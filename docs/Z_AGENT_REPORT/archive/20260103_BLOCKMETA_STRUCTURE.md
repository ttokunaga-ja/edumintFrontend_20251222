# BlockMeta 構造の共通化ドキュメント

## 概要

BlockMeta コンポーネントは、大門（難易度）と小門（問題形式）のメタデータを管理する統一されたコンポーネントです。

## 共通化された構造

### BlockMeta Props

```tsx
interface BlockMetaProps {
  level: 'major' | 'minor';                          // 大門 or 小門
  metaType: 'difficulty' | 'questionType';          // メタデータタイプ
  metaValue: number;                                 // 難易度ID or 問題形式ID
  metaOptions: Array<{ value: number; label: string }>; // プルダウンオプション（必須）
  metaLabel?: string;                               // メタラベル（preview時に表示）
  metaLabels?: Record<number, { label: string; color: string }>; // カラー定義
  keywords: Array<{ id: string; keyword: string }>;
  mode?: 'preview' | 'edit';
  canEdit?: boolean;
  onMetaChange?: (event: SelectChangeEvent<unknown>) => void;
  onKeywordAdd?: (keyword: string) => void;
  onKeywordRemove?: (keywordId: string) => void;
  onDelete?: () => void;
  id?: string;
}
```

## 呼び出し側での実装パターン

### 大門（QuestionBlock）- 難易度

難易度は種類が限定的なため、コンポーネント内で直打ちで定義します。

```tsx
import { getDifficultyOptions, getDifficultyLabel } from './utils/difficultyUtils';

// 難易度オプション（ローカル定義）
const difficultyOptions = [
  { value: 1, label: '基礎' },
  { value: 2, label: '応用' },
  { value: 3, label: '発展' },
];

const difficultyLabels = {
  1: { label: '基礎', color: 'success' },
  2: { label: '応用', color: 'warning' },
  3: { label: '発展', color: 'error' },
};

// BlockMeta に難易度オプションを渡す
<BlockMeta
  level="major"
  metaType="difficulty"
  metaValue={difficulty}
  metaOptions={difficultyOptions}
  metaLabels={difficultyLabels}
  // ... その他のProps
/>
```

### 小門（SubQuestionSection）- 問題形式

問題形式は ProblemTypeRegistry で管理されます。ユーティリティ関数で取得します。

```tsx
import { getQuestionTypeOptions, getQuestionTypeLabel } from '../utils/questionTypeUtils';

// 問題形式オプション（ユーティリティから生成）
const questionTypeOptions = getQuestionTypeOptions();

// BlockMeta に問題形式オプションを渡す
<BlockMeta
  level="minor"
  metaType="questionType"
  metaValue={questionTypeId}
  metaOptions={questionTypeOptions}
  // ... その他のProps
/>
```

## ユーティリティ関数

### difficultyUtils.ts

```tsx
export const getDifficultyOptions(): Array<{ value: number; label: string }>
export const getDifficultyLabel(difficultyId): { label: string; color: string }
export const getDifficultyText(difficultyId): string
```

### questionTypeUtils.ts

```tsx
export const getQuestionTypeOptions(): Array<{ value: number; label: string }>
export const getQuestionTypeLabel(typeId): string
export async function getQuestionTypeOptionsFromRegistry() // 将来の拡張用
```

## 実装の進化

### 現在（Phase 1）
- 難易度：直打ちで difficultyOptions を定義
- 問題形式：questionTypeLabels から getQuestionTypeOptions() で生成

### 将来（Phase 2 以降）
- 問題形式を ProblemTypeRegistry から動的に取得
- 難易度も同様に外部管理に切り替える可能性

## BlockMeta の内部処理

BlockMeta は metaType に基づいて以下を処理します：

1. **Edit モード**
   - metaOptions を使用してプルダウンを表示
   - onMetaChange で値の変更を通知
   
2. **Preview モード**
   - metaLabel とmetaLabels を使用してチップで表示

同じロジックで難易度と問題形式の両方に対応します。

## 削除ボタンの配置

BlockMeta の2行目左端に統一的に配置されます。

```
Row 1: [Meta Dropdown/Chip] [Keyword Input]
Row 2: [Delete Button] [Keyword Chips]
```

canEdit && onDelete が指定された場合のみ表示されます。

## 今後の拡張ポイント

1. **ProblemTypeRegistry 統合**
   - questionTypeUtils の getQuestionTypeOptionsFromRegistry() を実装
   - 問題形式が新しく追加された場合、自動的に反映

2. **難易度のカスタマイズ**
   - 難易度オプションを外部から注入可能にする
   - 異なる教育機関で難易度体系をカスタマイズ可能に

3. **ローカライゼーション**
   - ラベルを国言語に対応させる機構の追加
