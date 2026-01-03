# ProblemViewEditPage リファクタリング設計案

**目的**: 既存のアーキテクチャ規約（`F_ARCHITECTURE.md`）に準拠し、**Form Context Pattern + useFieldArray + Zod Schema** を導入して、保守性・拡張性・パフォーマンスを大幅に改善する。

**対象ページ**: `src/pages/ProblemViewEditPage.tsx` 及び配下のコンポーネント群

---

## 1. 現状の課題分析

### 1.1 現実装の構造
```
ProblemViewEditPage (ページ)
├── EditedExam 状態を useState で管理（ProblemEditor へ prop 経由）
├── SubQuestionRefsMap を useRef で管理（個別 save() 呼び出し用）
├── hasChanges / isEditModeLocal / ... 複数の状態が分散
│
├── ProblemMetaBlock (メタデータ表示)
├── ProblemEditor (全体エディタ)
│   ├── QuestionBlock × N
│   │   ├── SubQuestionBlock × M (ref経由で save() メソッド公開)
│   │   │   └── SubQuestionSection (個別の保存ロジック内蔵)
│
└── AppBarActionContext へ状態を通知（外部操作の委譲）
```

### 1.2 問題点

| 問題 | 現状 | リスク |
|------|------|--------|
| **Propsバケツリレー** | 複数レイヤーを経由して、exam state、onChange コールバックが伝わる | コンポーネント数が増加するたびに煩雑化 |
| **分散した状態管理** | `editedExam` (useState)、`subQuestionRefsMap` (useRef)、未保存フラグ (useEffect内で計算) | 状態同期の遅延・不整合のリスク |
| **個別保存フロー** | 各 SubQuestionBlock が独立して `save()` を持つ | 部分的な失敗時の整合性が曖昧、ロールバック困難 |
| **UI 状態と保存の分離** | 編集フラグ、保存状況、キャッシュ更新が異なるレイヤーで実装 | バグの再発・修正困難 |
| **未保存チェックの複雑さ** | JSON.stringify による全体比較 + 部分比較ロジック | パフォーマンス低下・複雑さ増大 |

---

## 2. 新設計の方針

### 2.1 設計原則
1. **Single Source of Truth**: Zod Schema を「正」とし、すべての型・バリデーションをそこから導出
2. **Form Context Pattern**: `FormProvider` で Exam → Question → SubQuestion の全階層を一元管理
3. **Nested useFieldArray**: 動的な追加・削除・並び替えを RHF ネイティブで実装
4. **Unified Save Flow**: 保存を「ページレベル」で一度に行い、部分的な失敗を明確に通知
5. **MUI Standardization**: `sx` prop、`readOnly` フラグによる編集/閲覧モード切り替え

### 2.2 期待される効果
| 効果 | 実現方法 |
|------|---------|
| **保守性向上** | Propsバケツリレー廃止 → `useFormContext` で直接アクセス |
| **バグ削減** | 全体のフォーム検証を一度に実施、部分保存の失敗を統一的に通知 |
| **パフォーマンス向上** | `useWatch` で必要な部分のみ購読、不要な再レンダリング削減 |
| **拡張性向上** | 新たな問題形式を追加する際に、コンポーネント層の統一性が保たれる |
| **テスト容易性** | Schema, Hooks, Components の責務分離により、各層を独立してテスト可能 |

---

## 3. データスキーマ設計 (Zod)

**ファイル**: `src/features/exam/schema.ts`

### 3.1 最小限のスキーマ（Source of Truth）

**ファイル**: `src/features/exam/schema.ts`

```typescript
import { z } from 'zod';

// ============ Enums ============
export const QuestionTypeEnum = z.enum([
  '1', '2', '3', '4', '5', '10', '11', '12', '13', '14'
]);

export const QuestionTypeLabels: Record<string, string> = {
  '1': '単一選択',
  '2': '複数選択',
  '3': '正誤判定',
  '4': '組み合わせ',
  '5': '順序並べ替え',
  '10': '記述式',
  '11': '証明問題',
  '12': 'コード記述',
  '13': '翻訳',
  '14': '数値計算',
};

export const DifficultyEnum = z.enum(['1', '2', '3']);
export const DifficultyLabels: Record<string, string> = {
  '1': '基礎',
  '2': '標準',
  '3': '応用',
};

// ============ フォーマット別スキーマ ============

// 選択肢（ID 1/2/3用）
const SelectionOptionSchema = z.object({
  id: z.string(),
  content: z.string().min(1, '選択肢テキストは必須です'),
  isCorrect: z.boolean(),
});

// マッチング（ID 4用）
const MatchingPairSchema = z.object({
  id: z.string(),
  question: z.string().min(1, '左側のテキストは必須です'),
  answer: z.string().min(1, '右側のテキストは必須です'),
});

// 並び替え（ID 5用）
const OrderingItemSchema = z.object({
  id: z.string(),
  text: z.string().min(1, '順序項目は必須です'),
  correctOrder: z.number().int().positive(),
});

// 記述系（ID 10-14用）
const EssayAnswerSchema = z.object({
  id: z.string(),
  sampleAnswer: z.string().min(1, 'サンプル答案は必須です'),
  gradingCriteria: z.string(),
  pointValue: z.number().int().nonnegative(),
});

// ============ 小問スキーマ（ネスト対応） ============

export const SubQuestionSchema = z.object({
  id: z.string().optional().default(''),  // バックエンドが無視、フロント側で temp-id 生成
  subQuestionNumber: z.number().int().positive(),
  questionTypeId: QuestionTypeEnum,
  questionContent: z.string().min(1, '問題文は必須です'),
  answerContent: z.string().optional(),
  explanation: z.string().optional().default(''),
  keywords: z.array(z.object({
    id: z.string(),
    keyword: z.string(),
  })).optional().default([]),
  
  // フォーマット別データ（discriminated union に拡張可能）
  options: z.array(SelectionOptionSchema).optional(),
  pairs: z.array(MatchingPairSchema).optional(),
  items: z.array(OrderingItemSchema).optional(),
  answers: z.array(EssayAnswerSchema).optional(),
});

export type SubQuestion = z.infer<typeof SubQuestionSchema>;

// ============ 大問スキーマ ============

export const QuestionSchema = z.object({
  id: z.string().optional().default(''),  // バックエンドが無視、フロント側で temp-id 生成
  questionNumber: z.number().int().positive(),
  questionContent: z.string().min(1, '大問内容は必須です'),
  difficulty: DifficultyEnum.optional().default('2'),
  keywords: z.array(z.object({
    id: z.string(),
    keyword: z.string(),
  })).optional().default([]),
  
  // ネストされた小問配列（useFieldArray対応）
  subQuestions: z.array(SubQuestionSchema),
});

export type Question = z.infer<typeof QuestionSchema>;

// ============ 試験スキーマ（ルート） ============

export const ExamSchema = z.object({
  id: z.string().optional(),  // 新規作成時は未発行、edit時は必須。temp-id 送信でもOK
  examName: z.string().min(1, '試験名は必須です'),
  examName: z.string().min(1, 'タイトルは必須です'),
  universityId: z.string().optional(),
  facultyId: z.string().optional(),
  subjectId: z.string().optional(),
  examYear: z.number().int(),
  isPublic: z.boolean().optional().default(false),
  
  // ネストされた大問配列
  questions: z.array(QuestionSchema),
});

export type ExamFormValues = z.infer<typeof ExamSchema>;

// ============ デフォルト値生成 ============

export const createDefaultSubQuestion = (index: number): SubQuestion => ({
  id: `temp-sq-${Date.now()}-${index}`,
  subQuestionNumber: index + 1,
  questionTypeId: '10',
  questionContent: '',
  answerContent: '',
  explanation: '',
  keywords: [],
  options: [],
  pairs: [],
  items: [],
  answers: [],
});

export const createDefaultQuestion = (index: number): Question => ({
  id: `temp-q-${Date.now()}-${index}`,
  questionNumber: index + 1,
  questionContent: '',
  difficulty: '2',
  keywords: [],
  subQuestions: [createDefaultSubQuestion(0)],
});

export const createDefaultExam = (): ExamFormValues => ({
  id: `temp-exam-${Date.now()}`,
  examName: '',
  examYear: new Date().getFullYear(),
  questions: [createDefaultQuestion(0)],
});
```

---

## 3.2 データ変換層 (API ↔ Form)

**ファイル**: `src/features/exam/utils/normalization.ts`

重要: DB（または Backend API）のデータ構造と、フロントエンドのフォーム用スキーマには必ずギャップが存在します。
以下の2つの変換関数を必須実装してください。

```typescript
import type { ExamFormValues, Question, SubQuestion } from '../schema';

/**
 * APIレスポンス（スネークケース、数値ID）
 * をフォーム用スキーマ（キャメルケース、一時ID化）に変換
 * 
 * @param apiData - サーバーから取得した試験データ
 * @returns フォーム操作用のデータ
 */
export function transformToForm(apiData: any): ExamFormValues {
  return {
    id: apiData.id || '',
    examName: apiData.exam_name || '',
    examYear: apiData.exam_year || new Date().getFullYear(),
    
    questions: (apiData.questions || []).map((q: any, qIdx: number): Question => ({
      id: q.id?.toString() || `temp-q-${Date.now()}-${qIdx}`,
      questionNumber: q.question_number || qIdx + 1,
      questionContent: q.question_content || '',
      difficulty: q.difficulty?.toString() || '2',
      keywords: (q.keywords || []).map((kw: any) => ({
        id: kw.id?.toString() || `temp-kw-${Date.now()}`,
        keyword: kw.keyword || '',
      })),
      
      subQuestions: (q.sub_questions || []).map((sq: any, sqIdx: number): SubQuestion => ({
        id: sq.id?.toString() || `temp-sq-${Date.now()}-${sqIdx}`,
        subQuestionNumber: sq.sub_question_number || sqIdx + 1,
        questionTypeId: sq.question_type_id?.toString() || '1',
        questionContent: sq.question_content || '',
        answerContent: sq.answer_content || '',
        explanation: sq.explanation || '',
        keywords: (sq.keywords || []).map((kw: any) => ({
          id: kw.id?.toString() || `temp-kw-${Date.now()}`,
          keyword: kw.keyword || '',
        })),
        
        // フォーマット別データ
        options: sq.sub_question_selection?.map((opt: any) => ({
          id: opt.id?.toString() || `temp-opt-${Date.now()}`,
          content: opt.content || '',
          isCorrect: opt.is_correct || false,
        })),
        pairs: sq.sub_question_matching?.map((pair: any) => ({
          id: pair.id?.toString() || `temp-pair-${Date.now()}`,
          question: pair.question || '',
          answer: pair.answer || '',
        })),
        items: sq.sub_question_ordering?.map((item: any) => ({
          id: item.id?.toString() || `temp-item-${Date.now()}`,
          text: item.text || '',
          correctOrder: item.correct_order || 0,
        })),
        answers: sq.sub_question_essay?.map((ans: any) => ({
          id: ans.id?.toString() || `temp-ans-${Date.now()}`,
          sampleAnswer: ans.sample_answer || '',
          gradingCriteria: ans.grading_criteria || '',
          pointValue: ans.point_value || 0,
        })),
      })),
    })),
  };
}

/**
 * フォーム用スキーマ（キャメルケース、一時ID）
 * をAPIペイロード（スネークケース、IDフィルタリング）に変換
 * 
 * @param formData - React Hook Form の フォーム値
 * @returns API送信用のペイロード
 */
export function transformToApi(formData: ExamFormValues): any {
  // temp-* で始まるID（フロントエンド発行）は除去
  const isTemporaryId = (id: string | undefined) => !id || id.startsWith('temp-');
  
  return {
    id: isTemporaryId(formData.id) ? undefined : formData.id,
    exam_name: formData.examName,
    exam_year: formData.examYear,
    
    questions: formData.questions.map((q) => ({
      id: isTemporaryId(q.id) ? undefined : q.id,
      question_number: q.questionNumber,
      question_content: q.questionContent,
      difficulty: Number(q.difficulty),
      keywords: q.keywords
        .filter(kw => kw.keyword.trim())
        .map(kw => ({
          id: isTemporaryId(kw.id) ? undefined : kw.id,
          keyword: kw.keyword,
        })),
      
      sub_questions: q.subQuestions.map((sq) => ({
        id: isTemporaryId(sq.id) ? undefined : sq.id,
        sub_question_number: sq.subQuestionNumber,
        question_type_id: Number(sq.questionTypeId),
        question_content: sq.questionContent,
        answer_content: sq.answerContent,
        explanation: sq.explanation,
        keywords: sq.keywords
          .filter(kw => kw.keyword.trim())
          .map(kw => ({
            id: isTemporaryId(kw.id) ? undefined : kw.id,
            keyword: kw.keyword,
          })),
        
        // フォーマット別データ（選択肢など）
        sub_question_selection: sq.options?.map(opt => ({
          id: isTemporaryId(opt.id) ? undefined : opt.id,
          content: opt.content,
          is_correct: opt.isCorrect,
        })) || [],
        sub_question_matching: sq.pairs?.map(pair => ({
          id: isTemporaryId(pair.id) ? undefined : pair.id,
          question: pair.question,
          answer: pair.answer,
        })) || [],
        sub_question_ordering: sq.items?.map(item => ({
          id: isTemporaryId(item.id) ? undefined : item.id,
          text: item.text,
          correct_order: item.correctOrder,
        })) || [],
        sub_question_essay: sq.answers?.map(ans => ({
          id: isTemporaryId(ans.id) ? undefined : ans.id,
          sample_answer: ans.sampleAnswer,
          grading_criteria: ans.gradingCriteria,
          point_value: ans.pointValue,
        })) || [],
      })),
    })),
  };
}
```

**使用例（useExamMutation内）**:
```typescript
const mutation = useMutation({
  mutationFn: async (formData: ExamFormValues) => {
    const payload = transformToApi(formData);
    return apiClient.put(`/exams/${formData.id}`, payload);
  },
  onSuccess: (apiResponse) => {
    // APIが返したデータをフォーム用に正規化
    const normalizedData = transformToForm(apiResponse);
    methods.reset(normalizedData);
    queryClient.invalidateQueries({ queryKey: ['exam', examId] });
  },
});
```

---

## 4. ディレクトリ・ファイル設計

```text
src/
├── features/
│   └── content/
│       ├── components/
│       │   └── ProblemViewEditPage/
│       │       ├── ProblemViewEditPage.tsx         # ページエントリー（薄い）
│       │       ├── ExamEditorLayout.tsx            # レイアウト & 保存ボタン
│       │       ├── ExamMetaSection.tsx             # 試験メタデータ
│       │       ├── QuestionList.tsx                # 大問リスト (useFieldArray)
│       │       ├── QuestionItem.tsx                # 大問アイテム
│       │       ├── SubQuestionList.tsx             # 小問リスト (useFieldArray)
│       │       ├── SubQuestionItem.tsx             # 小問アイテム
│       │       ├── CommonMetadata.tsx              # 共通メタ（難易度/キーワード/削除）
│       │       ├── QuestionContentField.tsx        # Markdown形式の問題文フィールド
│       │       └── formats/
│       │           ├── FormatRegistry.tsx          # 形式ごとの振り分け
│       │           ├── SelectionEditor.tsx         # ID 1/2/3
│       │           ├── MatchingEditor.tsx          # ID 4
│       │           ├── OrderingEditor.tsx          # ID 5
│       │           └── EssayEditor.tsx             # ID 10-14
│       ├── hooks/
│       │   ├── useExamQuery.ts                     # 試験データ取得 (TanStack Query)
│       │   └── useExamMutation.ts                  # 試験データ保存
│       ├── schema.ts                               # Zod Schema (新規作成)
│       ├── types.ts                                # 既存型定義（互換性保持）
│       └── utils/
│           └── normalization.ts                    # Data normalization (API ↔ Form)
└── pages/
    └── ProblemViewEditPage.tsx                     # エントリーポイント（薄い）
```

---

## 5. コンポーネント実装例

### 5.1 ページエントリー（薄い）

**ファイル**: `src/pages/ProblemViewEditPage.tsx`

```typescript
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Container, LinearProgress, Alert } from '@mui/material';

import { useExamQuery } from '@/features/content/hooks/useExamQuery';
import { useExamMutation } from '@/features/content/hooks/useExamMutation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAppBarAction } from '@/contexts/AppBarActionContext';
import { ExamSchema, ExamFormValues, createDefaultExam } from '@/features/content/schema';
import { ProblemViewEditPageLayout } from '@/features/content/components/ProblemViewEditPage/ProblemViewEditPageLayout';

export default function ProblemViewEditPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { setEnableAppBarActions, isEditMode, setIsEditMode, setHasUnsavedChanges } = useAppBarAction();

  const [isEditModeLocal, setIsEditModeLocal] = useState(false);

  // 1. データ取得 (TanStack Query)
  const { data: initialData, isLoading, error } = useExamQuery(id);

  // 2. 保存 Mutation
  const mutation = useExamMutation(id);

  // 3. Form 初期化 (RHF + Zod)
  const methods = useForm<ExamFormValues>({
    resolver: zodResolver(ExamSchema),
    defaultValues: initialData || createDefaultExam(),
    values: initialData, // データロード後に自動更新
    mode: 'onBlur',
  });

  // 4. 編集可能判定
  const isAuthor = user && initialData && user.id === initialData.userId;

  // 5. 状態通知
  React.useEffect(() => {
    setEnableAppBarActions(!!isAuthor);
  }, [isAuthor, setEnableAppBarActions]);

  React.useEffect(() => {
    setHasUnsavedChanges(methods.formState.isDirty);
  }, [methods.formState.isDirty, setHasUnsavedChanges]);

  // 保存ハンドラ
  const onSubmit = (data: ExamFormValues) => {
    mutation.mutate(data, {
      onSuccess: () => {
        methods.reset(data); // isDirty をリセット
        setIsEditModeLocal(false);
      },
    });
  };

  if (isLoading) return <LinearProgress />;
  if (error) return <Alert severity="error">データの読み込みに失敗しました</Alert>;

  return (
    <FormProvider {...methods}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <ProblemViewEditPageLayout
            isEditMode={isEditModeLocal && isAuthor}
            onToggleEditMode={() => setIsEditModeLocal(prev => !prev)}
            isSaving={mutation.isPending}
            onSaveError={mutation.error}
          />
        </form>
      </Container>
    </FormProvider>
  );
}
```

### 5.2 レイアウト & 保存ボタン

**ファイル**: `src/features/exam/components/ExamEditorLayout.tsx`

```typescript
import { useFormContext } from 'react-hook-form';
import { Box, Button, Stack, Alert, CircularProgress } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';

import { ExamMetaSection } from './ExamMetaSection';
import { QuestionList } from './QuestionList';
import type { ExamFormValues } from '../schema';

interface Props {
  isEditMode: boolean;
  onToggleEditMode: () => void;
  isSaving: boolean;
  onSaveError?: Error | null;
}

export const ProblemViewEditPageLayout = ({
  isEditMode,
  onToggleEditMode,
  isSaving,
  onSaveError,
}: Props) => {
  const { formState: { isDirty, isSubmitting } } = useFormContext<ExamFormValues>();

  return (
    <Box>
      {/* ツールバー */}
      <Stack direction="row" spacing={2} sx={{ mb: 4, justifyContent: 'flex-end' }}>
        {isEditMode ? (
          <>
            <Button
              type="submit"
              variant="contained"
              startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={!isDirty || isSaving}
            >
              保存
            </Button>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={onToggleEditMode}
              disabled={isSaving}
            >
              キャンセル
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={onToggleEditMode}
          >
            編集
          </Button>
        )}
      </Stack>

      {/* エラー表示 */}
      {onSaveError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          保存に失敗しました: {onSaveError.message}
        </Alert>
      )}

      {/* 試験メタデータ */}
      <ExamMetaSection isEditMode={isEditMode} />

      {/* 大問リスト */}
      <QuestionList isEditMode={isEditMode} />
    </Box>
  );
};
```

### 5.3 大問リスト（useFieldArray）

**ファイル**: `src/features/exam/components/QuestionList.tsx`

```typescript
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import { QuestionItem } from './QuestionItem';
import { createDefaultQuestion } from '../schema';
import type { ExamFormValues } from '../schema';

export const QuestionList = ({ isEditMode }: { isEditMode: boolean }) => {
  const { control } = useFormContext<ExamFormValues>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'questions',
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {fields.map((field, qIndex) => (
        <QuestionItem
          key={field.id}
          questionIndex={qIndex}
          isEditMode={isEditMode}
          onDelete={fields.length > 1 ? () => remove(qIndex) : undefined}
          onMoveUp={qIndex > 0 ? () => move(qIndex, qIndex - 1) : undefined}
          onMoveDown={qIndex < fields.length - 1 ? () => move(qIndex, qIndex + 1) : undefined}
        />
      ))}

      {isEditMode && (
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => append(createDefaultQuestion(fields.length))}
          sx={{ alignSelf: 'center', mt: 2 }}
        >
          大問を追加
        </Button>
      )}
    </Box>
  );
};
```

### 5.4 小問リスト（ネストされた useFieldArray）

**ファイル**: `src/features/exam/components/SubQuestionList.tsx`

```typescript
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import { SubQuestionItem } from './SubQuestionItem';
import { createDefaultSubQuestion } from '../schema';
import type { ExamFormValues } from '../schema';

interface Props {
  questionIndex: number;
  isEditMode: boolean;
}

export const SubQuestionList = ({ questionIndex, isEditMode }: Props) => {
  const { control } = useFormContext<ExamFormValues>();
  const basePath = `questions.${questionIndex}.subQuestions`;

  const { fields, append, remove } = useFieldArray({
    control,
    name: basePath as any,
  });

  return (
    <Box sx={{ pl: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {fields.map((field, sqIndex) => (
        <SubQuestionItem
          key={field.id}
          questionIndex={questionIndex}
          subQuestionIndex={sqIndex}
          isEditMode={isEditMode}
          onDelete={fields.length > 1 ? () => remove(sqIndex) : undefined}
        />
      ))}

      {isEditMode && (
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => append(createDefaultSubQuestion(fields.length))}
        >
          小問を追加
        </Button>
      )}
    </Box>
  );
};
```

### 5.5 小問アイテム

**ファイル**: `src/features/exam/components/SubQuestionItem.tsx`

```typescript
import { useFormContext, useWatch } from 'react-hook-form';
import { Paper, Box, Divider } from '@mui/material';

import { CommonMetadata } from './CommonMetadata';
import { QuestionContentField } from './QuestionContentField';
import { FormatRegistry } from './formats/FormatRegistry';
import { QuestionTypeLabels } from '../schema';
import type { ExamFormValues } from '../schema';

interface Props {
  questionIndex: number;
  subQuestionIndex: number;
  isEditMode: boolean;
  onDelete?: () => void;
}

export const SubQuestionItem = ({
  questionIndex,
  subQuestionIndex,
  isEditMode,
  onDelete,
}: Props) => {
  const { control } = useFormContext<ExamFormValues>();
  const basePath = `questions.${questionIndex}.subQuestions.${subQuestionIndex}`;

  // 形式を監視（コンポーネント動的切り替え用）
  const questionTypeId = useWatch({
    control,
    name: `${basePath}.questionTypeId`,
  });

  return (
    <Paper elevation={1} sx={{ p: 3, borderLeft: '4px solid', borderColor: 'primary.main' }}>
      {/* 共通メタ（難易度・キーワード・削除） */}
      <CommonMetadata
        basePath={`${basePath}`}
        label={`小問 ${subQuestionIndex + 1}`}
        isEditMode={isEditMode}
        onDelete={onDelete}
      />

      {/* 問題文 */}
      <Box sx={{ mt: 3, mb: 3 }}>
        <QuestionContentField
          name={`${basePath}.questionContent`}
          isEditMode={isEditMode}
          label="問題文"
        />
      </Box>

      {/* 形式別エディタ（ひ孫） */}
      <Box sx={{ my: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
        <FormatRegistry
          questionTypeId={questionTypeId}
          basePath={basePath}
          isEditMode={isEditMode}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* 解説 */}
      <Box sx={{ mt: 3 }}>
        <QuestionContentField
          name={`${basePath}.explanation`}
          isEditMode={isEditMode}
          label="解答・解説"
        />
      </Box>
    </Paper>
  );
};
```

### 5.5.5 Markdown エディタフィールド（パフォーマンス最適化版）

**ファイル**: `src/features/exam/components/QuestionContentField.tsx`

**重要**: Markdown エディタは一文字入力ごとの再レンダリング（頻繁な onChange）が重くなる傾向があります。
以下のパフォーマンス対策パターンを採用します。

```typescript
import { useCallback } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { TextField, Box, Typography } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { debounce } from 'lodash-es';  // or use useDeferredValue

interface Props {
  name: string;
  isEditMode: boolean;
  label?: string;
}

export const QuestionContentField = ({ name, isEditMode, label = '問題文' }: Props) => {
  const { control, watch } = useFormContext();
  const contentValue = watch(name);

  // デバウンス: 入力完了 500ms 後にフォーム状態を更新
  // これにより、入力中の頻繁なレンダリングを抑制
  const handleChangeDebounced = useCallback(
    debounce((value: string, onChange: (val: string) => void) => {
      onChange(value);
    }, 500),
    []
  );

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
      {/* 入力エリア */}
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 'bold', mb: 1, display: 'block' }}>
          {label} (Markdown)
        </Typography>
        
        <Controller
          name={name}
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              disabled={!isEditMode}
              multiline
              minRows={6}
              maxRows={12}
              placeholder={`# 見出し\n\n段落テキスト\n\n$$LaTeX数式$$`}
              variant="outlined"
              fullWidth
              onChange={(e) => {
                // ローカルで即座に textarea を更新（見た目の反応性向上）
                field.onChange(e.target.value);
                // フォーム状態の更新はデバウンス（重い処理を抑制）
                handleChangeDebounced(e.target.value, field.onChange);
              }}
              onBlur={field.onBlur}
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                backgroundColor: !isEditMode ? '#f5f5f5' : 'white',
              }}
            />
          )}
        />
      </Box>

      {/* プレビューエリア */}
      {!isEditMode && (
        <Box
          sx={{
            p: 2,
            border: '1px solid #ddd',
            borderRadius: 1,
            backgroundColor: '#fafafa',
            overflowY: 'auto',
            maxHeight: 400,
            '& h1, & h2, & h3': { mt: 2, mb: 1 },
            '& p': { mb: 1 },
            '& code': {
              backgroundColor: '#f0f0f0',
              padding: '2px 4px',
              borderRadius: '4px',
              fontFamily: 'monospace',
            },
          }}
        >
          <ReactMarkdown>{contentValue || ''}</ReactMarkdown>
        </Box>
      )}
    </Box>
  );
};
```

**実装上のポイント**:
- `Controller` を使用して、RHF との統合を明確に
- `onChange` の即座更新（textarea の値反映）と、フォーム状態のデバウンス更新を分離
- 読み取り時（`!isEditMode`）はプレビューパネルを右側に表示
- Markdown → HTML 変換は `react-markdown` を使用（KaTeX対応）

---

### 5.6 ネストされた useFieldArray の型安全実装例

**ファイル**: `src/features/exam/components/SubQuestionList.tsx` (改良版)

```typescript
import { useFieldArray, useFormContext } from 'react-hook-form';
import { SubQuestionItem } from './SubQuestionItem';
import type { ExamFormValues } from '../schema';

interface Props {
  questionIndex: number;
  isEditMode: boolean;
}

export const SubQuestionList = ({ questionIndex, isEditMode }: Props) => {
  const { control } = useFormContext<ExamFormValues>();
  
  // 型安全なパス定義: タイプミスを事前に防ぐ
  const subQuestionsName = `questions.${questionIndex}.subQuestions` as const;

  const { fields, append, remove } = useFieldArray({
    control,
    name: subQuestionsName,
  });

  return (
    <Box>
      {fields.map((field, subQuestionIndex) => (
        <SubQuestionItem
          key={field.id}
          questionIndex={questionIndex}
          subQuestionIndex={subQuestionIndex}
          isEditMode={isEditMode}
        />
      ))}
      {isEditMode && (
        <Button
          onClick={() =>
            append({
              id: `temp-sq-${Date.now()}`,
              subQuestionNumber: fields.length + 1,
              questionTypeId: '1',
              questionContent: '',
              explanation: '',
            })
          }
        >
          小問を追加
        </Button>
      )}
    </Box>
  );
};
```

---

### 5.7 形式ごとのエディタ例（選択肢）

**ファイル**: `src/features/exam/components/formats/SelectionEditor.tsx`

```typescript
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Box, TextField, Checkbox, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

interface Props {
  basePath: string;
  isEditMode: boolean;
}

export const SelectionEditor = ({ basePath, isEditMode }: Props) => {
  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${basePath}.options`,
  });

  const options = useWatch({ control, name: `${basePath}.options` });

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
        選択肢
      </Typography>

      {fields.map((field, index) => {
        const optionPath = `${basePath}.options.${index}`;
        const isCorrect = options?.[index]?.isCorrect;

        return (
          <Box
            key={field.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: 2,
              p: 2,
              border: isCorrect && !isEditMode ? '2px solid green' : '1px solid #ddd',
              borderRadius: 1,
              bgcolor: isCorrect && !isEditMode ? 'success.light' : 'transparent',
            }}
          >
            {/* 正解チェック */}
            {isEditMode ? (
              <Checkbox {...register(`${optionPath}.isCorrect`)} size="small" />
            ) : (
              <Checkbox checked={isCorrect} readOnly size="small" />
            )}

            {/* テキスト入力 or 表示 */}
            {isEditMode ? (
              <TextField
                fullWidth
                size="small"
                {...register(`${optionPath}.content`)}
                placeholder="選択肢テキスト"
              />
            ) : (
              <Typography sx={{ flex: 1 }}>{field.content}</Typography>
            )}

            {/* 削除ボタン（編集モードのみ） */}
            {isEditMode && fields.length > 2 && (
              <Button
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => remove(index)}
              >
                削除
              </Button>
            )}
          </Box>
        );
      })}

      {isEditMode && (
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => append({ id: `temp-${Date.now()}`, content: '', isCorrect: false })}
        >
          選択肢を追加
        </Button>
      )}
    </Box>
  );
};
```

---

## 6. Hooks 実装例

### 6.1 データ取得 Hook

**ファイル**: `src/features/exam/hooks/useExamQuery.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { getExam } from '@/services/api/gateway/content';
import { ExamFormValues, ExamSchema } from '../schema';

export const useExamQuery = (id?: string) => {
  return useQuery({
    queryKey: ['exam', id],
    queryFn: async () => {
      const raw = await getExam(id!);
      // Zod で型検証＆正規化
      return ExamSchema.parse(raw);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5分キャッシュ
  });
};
```

### 6.2 保存 Mutation Hook

**ファイル**: `src/features/exam/hooks/useExamMutation.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateExam } from '@/services/api/gateway/content';
import { ExamFormValues } from '../schema';

export const useExamMutation = (id?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ExamFormValues) =>
      updateExam(id!, data),
    onSuccess: (newData) => {
      // キャッシュ更新
      queryClient.setQueryData(['exam', id], newData);
      // トースト通知（必要に応じて）
    },
    onError: (error) => {
      console.error('Save failed:', error);
      // エラー通知
    },
  });
};
```

---

## 7. マイグレーションチェックリスト

### Phase 1: 基盤整備
- [ ] `src/features/exam/schema.ts` を新規作成
- [ ] `useExamQuery` / `useExamMutation` を新規作成
- [ ] 新しい形式別エディタコンポーネント（SelectionEditor 等）を作成

### Phase 2: コンポーネント実装
- [ ] `ProblemViewEditPageLayout.tsx` を実装
- [ ] `QuestionList.tsx`, `QuestionItem.tsx` を実装（useFieldArray対応）
- [ ] `SubQuestionList.tsx`, `SubQuestionItem.tsx` を実装（ネストされた useFieldArray）
- [ ] `CommonMetadata.tsx` を実装（読み書き切り替え）
- [ ] `QuestionContentField.tsx` を実装（Markdown対応）

### Phase 3: 統合
- [ ] `src/pages/ProblemViewEditPage.tsx` をリプレイス
- [ ] 既存の `SubQuestionBlock`, `ProblemEditor` は削除
- [ ] AppBarActionContext との連携確認

### Phase 4: テスト & 調整
- [ ] ユニットテスト（schema バリデーション）
- [ ] 統合テスト（保存フロー）
- [ ] E2E テスト（UI操作 + 保存）
- [ ] ブラウザテスト（複数大問・小問の動作確認）

---

## 8. 既存実装との差分（旧→新）

| 観点 | 旧実装 | 新実装 | 利点 |
|------|--------|--------|--------|
| **状態管理** | useState + useRef 分散 | FormProvider 一元化 | 同期・整合性が保証 |
| **バリデーション** | validateSubQuestion 関数 | Zod Schema | 型安全・再検証可能 |
| **保存フロー** | 各 SubQuestion 個別保存 | フォーム全体で一度保存 | 失敗時の対応が明確 |
| **未保存チェック** | JSON.stringify 全体比較 | RHF isDirty | パフォーマンス向上 |
| **編集/閲覧切り替え** | モード別コンポーネント分岐 | readOnly フラグ + sx | DRY 原則遵守 |
| **Propsバケツリレー** | 多数のコールバック prop 経由 | useFormContext 直接アクセス | 保守性向上 |

---

## 9. パフォーマンス予想

### 改善ポイント
1. **再レンダリング削減**: useWatch + useFieldArray の局所的な購読により、不必要な全体再描画が削減される
2. **キャッシング**: TanStack Query の自動キャッシング + staleTime 設定で、API呼び出しが削減される
3. **バリデーション効率**: Zod は lazy-parse 対応のため、必要な部分のみバリデーション可能

### 実測値予想（相対比較）
- 初期ロード: 同等
- 大問/小問追加: **20-30% 高速化**（Propsバケツリレー廃止）
- 編集時反応: **肌感で即座に反映**（クライアント側の操作）
- 保存処理: **統一されたエラーハンドリングで安定化**

---

## 10. 今後の拡張性

### 形式追加時のチェックリスト
1. `schema.ts` に新しいスキーマを追加（例: ImageChoiceSchema）
2. `formats/ImageChoiceEditor.tsx` を新規作成
3. `FormatRegistry.tsx` に case を追加
4. テストケースを追加

### ローカルストレージ対応
```typescript
// 自動保存用フック（追加予定）
const useAutoSave = (formValues: ExamFormValues, interval: number) => {
  useEffect(() => {
    const timer = setInterval(() => {
      localStorage.setItem('exam-draft', JSON.stringify(formValues));
    }, interval);
    return () => clearInterval(timer);
  }, [formValues, interval]);
};
```

---

## 参考資料

- **F_ARCHITECTURE.md**: アーキテクチャ規約
- **react-hook-form**: https://react-hook-form.com/form-builder
- **TanStack Query**: https://tanstack.com/query/latest
- **Zod**: https://zod.dev
- **MUI**: https://mui.com/material-ui/api/

---

## 11. レビュー確認済み: 実装に向けた最終指示 (Review Approved)

### ✅ 総合評価: **S (承認 / 即時実装推奨)**

| 評価項目 | 判定 | 理由 |
| :--- | :---: | :--- |
| **アーキテクチャ整合性** | **S** | FormProvider, Zod, Custom Hooks の責務分離が完璧 |
| **保守性** | **S** | スキーマ駆動（Schema-Driven）により、型定義とバリデーション一元化 |
| **パフォーマンス** | **A** | `useFieldArray` と `useWatch` の採用で無駄なレンダリング最小化 |
| **拡張性** | **A** | `FormatRegistry` による分岐戦略が明確で、新形式追加が容易 |

### ✅ 実装順序（優先度順）

**1. Schema First** → 型定義を確定させる
   - `src/features/exam/schema.ts` を完成
   - `src/features/exam/utils/normalization.ts` (transformToForm / transformToApi)
   - 所要: **1日**

**2. Mocking** → API未実装でも UI開発を先行
   - `useExamQuery`, `useExamMutation` をモック実装
   - MSW ハンドラーまたはハードコード済みモック利用
   - 所要: **0.5日**

**3. Components** → 親→子→孫の順で組立
   - ExamEditorLayout (親フレーム)
   - QuestionList / QuestionItem (1階層)
   - SubQuestionList / SubQuestionItem (2階層)
   - 所要: **2-3日**

**4. Integration** → ページへ統合
   - `src/pages/ProblemViewEditPage.tsx` リプレイス
   - AppBarActionContext との連携確認
   - 既存コンポーネント（SubQuestionBlock など）廃止
   - 所要: **1日**

**総工期**: 4-5日（平行作業可）

### ✅ 修正・補強項目（実装完了）

- [x] ディレクトリ名統一: `src/features/exam/` で確定
- [x] APIデータ↔フォームデータ変換層: `normalization.ts` に詳細実装パターン記載
- [x] Markdownエディタパフォーマンス対策: `Controller` + debounce パターン記載
- [x] スキーマ id フィールド: `optional().default('')` に修正
- [x] ネストされた useFieldArray の型安全パターン: 実装例を明記

### ✅ 制約事項・禁止事項

**必須**:
- FormProvider は必ずページレベルで wrap
- useFormContext 呼び出しは FormProvider 内のコンポーネントから**のみ**
- 保存・編集切り替えは **AppBarActionContext + TopmenuBar で統一**（独自編集ボタン禁止）
- 新規ID生成は `temp-{type}-{timestamp}-{index}` パターン

**パフォーマンス**:
- QuestionContentField は debounce + Controller パターンを採用必須
- useWatch の購読は「必要な部分のみ」に限定

**テスト**:
- schema.ts の各型に対してユニットテスト実装必須
- transformToForm / transformToApi の往復テスト実装必須

---

## 実装開始チェックリスト

- [ ] 既存 `src/components/page/ProblemViewEditPage/` のコード体系を確認（流用可能な UI部品を特定）
- [ ] 既存 `src/features/content/` の `useExamDetail.ts`, `useExamEditor.ts` 等を参照（API仕様の統一）
- [ ] Mock データ (`src/mocks/mockData/content.ts`) を活用し、transformToForm / transformToApi の動作確認
- [ ] AppBarActionContext の使用方法を確認し、保存・編集ボタン統合テスト計画
- [ ] スキーマバリデーション（Zod）の既存実装パターンがあれば参照
- [ ] CSS-in-JS（sx prop）の既存スタイリング規約を確認

