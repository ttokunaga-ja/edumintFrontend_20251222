import React, { useState, useCallback, useEffect } from 'react';
import { Paper, Stack, Alert, CircularProgress, Box } from '@mui/material';
import { SubQuestionBlockContent } from '../SubQuestionBlock/SubQuestionBlockContent';
import { BlockHeader } from '../common/BlockHeader';
import { BlockMeta } from '../common/BlockMeta';
import { useSubQuestionState, SubQuestionStateType } from '@/features/content/hooks/useSubQuestionState';
import { useUnsavedChanges } from '@/features/content/hooks/useUnsavedChanges';
import { getSubQuestionRepository } from '@/features/content/repositories';
import { validateSubQuestion } from '@/features/content/utils/validateSubQuestion';
import { normalizeSubQuestion } from '@/features/content/utils/normalizeSubQuestion';
import { getQuestionTypeOptions, getQuestionTypeLabel } from '../utils/questionTypeUtils';

export type SubQuestionSectionProps = {
  id: string;
  subQuestionNumber: number;
  questionTypeId: number;
  questionContent: string;
  answerContent?: string;
  explanation?: string;
  keywords?: Array<{ id: string; keyword: string }>;
  options?: Array<{ id: string; content: string; isCorrect: boolean }>;
  pairs?: Array<{ id: string; question: string; answer: string }>;
  items?: Array<{ id: string; text: string; correctOrder: number }>;
  answers?: Array<{ id: string; sampleAnswer: string; gradingCriteria: string; pointValue: number }>;
  canEdit?: boolean;
  showAnswer?: boolean;
  onQuestionChange?: (content: string) => void;
  onAnswerChange?: (content: string) => void;
  onQuestionsUnsavedChange?: (hasUnsaved: boolean) => void;
  onAnswersUnsavedChange?: (hasUnsaved: boolean) => void;
  onKeywordAdd?: (keyword: string) => void;
  onKeywordRemove?: (keywordId: string) => void;
  onTypeChange?: (typeId: number) => void;
  onDelete?: () => void;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
  mode?: 'preview' | 'edit';
  // ref に保存メソッドを公開
  ref?: React.Ref<SubQuestionSectionHandle>;
};

export interface SubQuestionSectionHandle {
  save: () => Promise<void>;
  isSaving: boolean;
  hasError: boolean;
  error: Error | null;
}

// 新規問題形式のラベル定義（ID 1-5, 10-14）
// 外部管理可能な構造：ProblemTypeRegistry から取得することも可能
const questionTypeLabels: Record<number, string> = {
  1: '単一選択',
  2: '複数選択',
  3: '正誤判定',
  4: '組み合わせ',
  5: '順序並べ替え',
  10: '記述式',
  11: '証明問題',
  12: 'コード記述',
  13: '翻訳',
  14: '数値計算',
};

/**
 * 問題形式オプションを生成するユーティリティ
 * 将来的には ProblemTypeRegistry から取得することも可能
 */
const getLocalQuestionTypeOptions = () =>
  Object.entries(questionTypeLabels).map(([id, label]) => ({
    value: Number(id),
    label,
  }));

/**
 * SubQuestionSection
 *
 * Repository + Hooks + Validation + Normalization を統合した
 * 完全な保存フロー対応の SubQuestion エディタ
 *
 * 使用方法:
 * ```tsx
 * const sectionRef = useRef<SubQuestionSectionHandle>(null);
 *
 * // 保存を実行
 * await sectionRef.current?.save();
 * ```
 */
export const SubQuestionSection = React.forwardRef<
  SubQuestionSectionHandle,
  SubQuestionSectionProps
>(function SubQuestionSectionComponent(
  {
    id,
    subQuestionNumber,
    questionTypeId,
    questionContent,
    answerContent,
    explanation,
    keywords = [],
    options = [],
    pairs = [],
    items = [],
    answers = [],
    canEdit = false,
    showAnswer = false,
    onQuestionChange,
    onAnswerChange,
    onQuestionsUnsavedChange,
    onAnswersUnsavedChange,
    onKeywordAdd,
    onKeywordRemove,
    onTypeChange,
    onDelete,
    onSaveSuccess,
    onSaveError,
    mode = 'preview',
  },
  ref
) {
  // 初期状態オブジェクトの構成
  const initialSubQuestion: SubQuestionStateType = {
    id,
    questionTypeId,
    questionContent,
    answerContent: answerContent || '',
    keywords,
    options,
    pairs,
    items,
    answers,
    // Required fields from SubQuestion interface
    questionId: '',
    subQuestionNumber,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  // 状態管理フック
  const {
    state: subQuestionState,
    updateContent,
    updateAnswerDescription,
    markDirty,
    markClean,
  } = useSubQuestionState(initialSubQuestion);

  // クライアント側での状態管理
  const [clientKeywords, setClientKeywords] = useState<Array<{ id: string; keyword: string }>>(keywords);
  const [clientQuestionTypeId, setClientQuestionTypeId] = useState(questionTypeId);
  const [clientOptions, setClientOptions] = useState(options);
  const [clientPairs, setClientPairs] = useState(pairs);
  const [clientItems, setClientItems] = useState(items);
  const [clientAnswers, setClientAnswers] = useState(answers);

  // 未保存変更追跡
  const questionChanges = useUnsavedChanges('questionContent');
  const answerChanges = useUnsavedChanges('answerContent');

  // UI 状態
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<Error | null>(null);

  // 未保存状態のコールバック
  useEffect(() => {
    onQuestionsUnsavedChange?.(questionChanges.hasUnsaved);
  }, [questionChanges.hasUnsaved, onQuestionsUnsavedChange]);

  useEffect(() => {
    onAnswersUnsavedChange?.(answerChanges.hasUnsaved);
  }, [answerChanges.hasUnsaved, onAnswersUnsavedChange]);

  // 質問内容の変更ハンドラ
  const handleQuestionChange = useCallback(
    (content: string) => {
      updateContent(content);
      onQuestionChange?.(content);
      questionChanges.markAsChanged('questionContent');
      setIsEditingQuestion(false);
    },
    [updateContent, onQuestionChange, questionChanges]
  );

  // 回答内容の変更ハンドラ
  const handleAnswerChange = useCallback(
    (content: string) => {
      updateAnswerDescription(content);
      onAnswerChange?.(content);
      answerChanges.markAsChanged('answerContent');
    },
    [updateAnswerDescription, onAnswerChange, answerChanges]
  );

  // キーワードの追加ハンドラ - クライアント側で状態管理、API呼び出しなし
  const handleKeywordAdd = useCallback(
    (keyword: string) => {
      setSaveError(null);
      // クライアント側で新しいキーワードを追加（IDはサーバ側で生成される想定）
      const newKeyword = { id: `temp-${Date.now()}`, keyword };
      setClientKeywords(prev => [...prev, newKeyword]);
      onKeywordAdd?.(keyword);
      markDirty();
    },
    [onKeywordAdd, markDirty]
  );

  // キーワードの削除ハンドラ - クライアント側で状態管理、API呼び出しなし
  const handleKeywordRemove = useCallback(
    (keywordId: string) => {
      setSaveError(null);
      // クライアント側でキーワードを削除
      setClientKeywords(prev => prev.filter(kw => kw.id !== keywordId));
      onKeywordRemove?.(keywordId);
      markDirty();
    },
    [onKeywordRemove, markDirty]
  );

  // 問題形式の変更ハンドラ - クライアント側で状態管理、API呼び出しなし
  const handleQuestionTypeChange = useCallback(
    (event: any) => {
      setSaveError(null);
      // event.target.value から値を正確に取得
      const newTypeId = event.target?.value;
      if (typeof newTypeId === 'number') {
        setClientQuestionTypeId(newTypeId);
        onTypeChange?.(newTypeId);
        markDirty();
      }
    },
    [onTypeChange, markDirty]
  );

  /**
   * 完全な保存フロー
   * 1. バリデーション
   * 2. 正規化
   * 3. 基本情報を Repository で保存
   * 4. 形式別データを Repository で保存
   * 5. キャッシュ自動更新
   */
  const handleSaveSubQuestion = useCallback(async () => {
    setSaveError(null);
    setIsSaving(true);

    try {
      // 1️⃣ データの統合 - クライアント側で管理している状態を使用
      const subQuestionData = {
        id,
        questionTypeId: clientQuestionTypeId,
        questionContent: subQuestionState.subQuestion.content,
        answerContent: answerContent || '',
        keywords: clientKeywords,
        options: clientOptions,
        pairs: clientPairs,
        items: clientItems,
        answers: clientAnswers,
      };

      // 2️⃣ バリデーション (validateSubQuestion)
      // 注: validateSubQuestion は SubQuestion 型を期待しているため、キャスト
      const validation = validateSubQuestion(subQuestionData as any);
      if (!validation.isValid) {
        // validation.errors は配列の配列の場合もあるため処理
        const errors = Array.isArray(validation.errors) ? validation.errors : [validation.errors];
        const errorMessages = errors
          .flat()
          .map((err: any) => typeof err === 'string' ? err : (err?.message || JSON.stringify(err)))
          .join(', ');
        throw new Error(`バリデーション失敗: ${errorMessages}`);
      }

      // 3️⃣ 正規化 (normalizeSubQuestion)
      const normalized = normalizeSubQuestion(subQuestionData as any);

      // 4️⃣ Repository で基本情報を保存
      const repo = getSubQuestionRepository();
      await repo.update(id, {
        content: (normalized as any).questionContent || subQuestionData.questionContent,
        keywords: clientKeywords.map((k: any) => typeof k === 'string' ? k : k.keyword),
      });

      // 5️⃣ 形式別のデータを保存 (updateSelection/Matching/Ordering/Essay)
      const normalizedData = normalized as any;
      switch (clientQuestionTypeId) {
        case 1:
        case 2:
        case 3:
          // Selection 形式
          if (clientOptions && clientOptions.length > 0) {
            await repo.updateSelection(id, clientOptions);
          }
          break;

        case 4:
          // Matching 形式
          if (clientPairs && clientPairs.length > 0) {
            await repo.updateMatching(id, clientPairs);
          }
          break;

        case 5:
          // Ordering 形式
          if (clientItems && clientItems.length > 0) {
            await repo.updateOrdering(id, clientItems);
          }
          break;

        case 10:
        case 11:
        case 12:
        case 13:
        case 14:
          // Essay 形式
          if (clientAnswers && clientAnswers.length > 0) {
            await repo.updateEssay(id, clientAnswers);
          }
          break;
      }

      // 6️⃣ キャッシュが自動更新される
      // Repository の自動キャッシング機構により、5分 TTL でキャッシュが無効化される

      // 7️⃣ 未保存状態をクリア
      questionChanges.markAllSaved();
      answerChanges.markAllSaved();
      markClean();

      // 8️⃣ 成功コールバック
      onSaveSuccess?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('保存に失敗しました');
      setSaveError(err);
      onSaveError?.(err);
    } finally {
      setIsSaving(false);
    }
  }, [
    id,
    clientQuestionTypeId,
    subQuestionState.subQuestion.content,
    answerContent,
    clientKeywords,
    clientOptions,
    clientPairs,
    clientItems,
    clientAnswers,
    questionChanges,
    answerChanges,
    markClean,
    onSaveSuccess,
    onSaveError,
  ]);
  // ref に save メソッドを公開
  React.useImperativeHandle(
    ref,
    () => ({
      save: handleSaveSubQuestion,
      isSaving,
      hasError: saveError !== null,
      error: saveError,
    }),
    [handleSaveSubQuestion, isSaving, saveError]
  );
  return (
    <Paper variant='outlined' sx={{ p: 2, mb: 2, bgcolor: 'background.paper', overflow: 'visible', position: 'relative', zIndex: 1 }}>
      <Stack spacing={2} sx={{ overflow: 'visible' }}>
        {/* エラーメッセージ */}
        {saveError && (
          <Alert severity='error' onClose={() => setSaveError(null)}>
            {saveError.message}
          </Alert>
        )}

        {/* 保存中インジケータ */}
        {isSaving && (
          <Stack direction='row' spacing={1} alignItems='center'>
            <CircularProgress size={20} />
            <span>保存中...</span>
          </Stack>
        )}

        {/* Header + Meta Info Row (同じ行に配置) */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, width: '100%' }}>
          {/* Header (小問番号) */}
          <Box sx={{ minWidth: 'fit-content' }}>
            <BlockHeader
              level="minor"
              number={subQuestionNumber}
            />
          </Box>

          {/* Meta Info (問題形式 + キーワード) - mode プロップで view/edit を切り替え */}
          <Box sx={{ flex: 1 }}>
            <BlockMeta
              level="minor"
              metaType="questionType"
              metaValue={clientQuestionTypeId}
              metaLabel={questionTypeLabels[clientQuestionTypeId] || '記述式'}
              metaOptions={getLocalQuestionTypeOptions()}
              keywords={clientKeywords}
              mode={canEdit ? 'edit' : 'preview'}
              canEdit={canEdit}
              onMetaChange={handleQuestionTypeChange}
              onKeywordAdd={handleKeywordAdd}
              onKeywordRemove={handleKeywordRemove}
              onDelete={onDelete}
              id={`${id}-meta`}
            />
          </Box>
        </Box>

        {/* Content */}
        <SubQuestionBlockContent
          subQuestionNumber={subQuestionNumber}
          questionTypeId={clientQuestionTypeId}
          questionContent={subQuestionState.subQuestion.content}
          answerContent={answerContent}
          answerExplanation={explanation}
          options={options}
          pairs={pairs}
          items={items}
          answers={answers}
          keywords={keywords}
          canEdit={isEditingQuestion && canEdit}
          showAnswer={showAnswer}
          onQuestionChange={handleQuestionChange}
          onAnswerChange={handleAnswerChange}
          onExplanationChange={() => {}}
          onQuestionsUnsavedChange={questionChanges.hasUnsaved ? () => {} : undefined}
          onAnswersUnsavedChange={answerChanges.hasUnsaved ? () => {} : undefined}
          mode={mode}
          id={`${id}-content`}
        />
      </Stack>
    </Paper>
  );
});

export default SubQuestionSection;
