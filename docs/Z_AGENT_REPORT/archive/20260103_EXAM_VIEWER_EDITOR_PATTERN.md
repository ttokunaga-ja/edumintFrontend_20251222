# ExamViewer / ExamEditor Pattern

## Overview

新しい UI コンポーネント設計パターンで、テキストコンテンツ（Markdown + LaTeX）の表示と編集を統一的に扱います。

**特徴:**
- **分離の原則**: ViewerとEditorの責任を明確に分離
- **軽量化**: 表示のみが必要なユーザーは編集機能を読み込まない
- **一貫性**: 編集時と保存後で同じスタイルを使用（WYSIWYG）
- **再利用可能**: ExamEditorはExamViewerを内包

## Architecture

```
ExamEditor (Input + Preview)
├── TextField (Markdown/LaTeX input)
├── DragHandle (Resize)
└── ExamViewer (Preview - reused component)
```

### Component Hierarchy

```
ExamContentField (Feature Layer - RHF Integration)
├── isEditMode = true  → ExamEditor
└── isEditMode = false → ExamViewer (lightweight)
```

## Components

### 1. ExamViewer

**目的**: Markdown + LaTeX の純粋表示コンポーネント

**ロケーション**: `src/components/ui/exam/ExamViewer.tsx`

**Props:**
```typescript
interface ExamViewerProps {
  content: string;
  sx?: SxProps<Theme>;
  className?: string;
}
```

**使用例:**
```tsx
<ExamViewer 
  content="# 見出し\n\n$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$"
  sx={{ fontSize: '1rem' }}
/>
```

**サポート機能:**
- ✅ Markdown (見出し, リスト, テーブル, コード, 引用)
- ✅ LaTeX (インライン数式 $x$ 、ブロック数式 $$...$$)
- ✅ カスタムスタイリング (sx prop)
- ✅ 空コンテンツ時のフォールバック ('(記述なし)')

**スタイル対応:**
- `p`: 余白 (mb: 1.5), 行の高さ
- `h1/h2/h3`: フォントサイズ (1.8rem, 1.5rem, 1.2rem)
- `code`: インラインコード表示
- `pre`: コードブロック (背景色, パディング, スクロール)
- `ul/ol`: リスト (マージン)
- `blockquote`: 引用 (左ボーダー)
- `table`: テーブル (全幅, ボーダー)

### 2. ExamEditor

**目的**: Markdown/LaTeX 入力 + ライブプレビュー + リサイズ機能

**ロケーション**: `src/components/ui/exam/ExamEditor.tsx`

**Props:**
```typescript
interface ExamEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minEditorHeight?: number;        // Default: 150px
  initialEditorHeight?: number;    // Default: 200px
  error?: boolean;
  helperText?: string;
}
```

**使用例:**
```tsx
const [content, setContent] = useState('');

<ExamEditor
  value={content}
  onChange={setContent}
  placeholder="Markdown で記述..."
  minEditorHeight={100}
  initialEditorHeight={250}
  error={!!error}
  helperText={error?.message}
/>
```

**UI 構成:**
1. **入力エリア** (TextField)
   - モノスペース フォント
   - マルチライン対応
   - フルwidth

2. **リサイズハンドル**
   - マウスドラッグで高さ調整
   - `row-resize` カーソル
   - DragHandleIcon 表示

3. **プレビューエリア**
   - ExamViewer コンポーネントを内包
   - 背景色区別 (background.default)
   - スクロール対応 (maxHeight: 300px)

**ドラッグロジック:**
```tsx
const isDragging = useRef(false);     // ドラッグ状態
const startY = useRef(0);             // ドラッグ開始Y座標
const startHeight = useRef(0);        // ドラッグ開始時の高さ

// handleMouseDown: isDragging.current = true
// mousemove event: newHeight = Math.max(minEditorHeight, startHeight + deltaY)
// mouseup event: isDragging.current = false
```

### 3. ExamContentField

**目的**: React Hook Form 統合用フィーチャー層アダプター

**ロケーション**: `src/features/exam/components/inputs/ExamContentField.tsx`

**Props:**
```typescript
interface ExamContentFieldProps {
  name: string;                     // RHF field name
  label?: string;
  isEditMode: boolean;              // Editor vs Viewer
  placeholder?: string;
  required?: boolean;
  minEditorHeight?: number;
  initialEditorHeight?: number;
}
```

**使用例:**
```tsx
<FormProvider {...methods}>
  <ExamContentField
    name="problemText"
    label="問題文"
    isEditMode={isEditMode}
    placeholder="Markdownで記述..."
    required={true}
  />
</FormProvider>
```

**機能:**
- ✅ Controller による RHF 統合
- ✅ バリデーションエラー表示
- ✅ isEditMode に応じた動的レンダリング
- ✅ FormControl / FormHelperText サポート
- ✅ 必須フィールド表示 (*)

**動作:**
```
isEditMode = true  → ExamEditor (全機能)
isEditMode = false → ExamViewer (軽量, 表示のみ)
```

## Usage Patterns

### Pattern 1: 表示のみ (軽量)

```tsx
<ExamViewer content="# 問題文\n\n選択肢は以下の通り:" />
```

### Pattern 2: 編集機能付き

```tsx
const [value, setValue] = useState('');

<ExamEditor
  value={value}
  onChange={setValue}
  placeholder="Markdown で記述..."
/>
```

### Pattern 3: React Hook Form 統合 (推奨)

```tsx
const methods = useForm({
  defaultValues: { problemText: '' }
});

<FormProvider {...methods}>
  <ExamContentField
    name="problemText"
    label="問題文"
    isEditMode={true}
    required={true}
  />
  <button type="submit">保存</button>
</FormProvider>
```

### Pattern 4: モード切り替え

```tsx
const [isEditMode, setIsEditMode] = useState(false);

{isEditMode ? (
  <ExamEditor value={text} onChange={setText} />
) : (
  <ExamViewer content={text} />
)}
```

## Integration with QuestionEditorPreview

### 現状（QuestionEditorPreview）

- 単一コンポーネントで表示と編集を兼ねる
- 重い（常に両機能を読み込む）
- 責任が重複している

### 目標（ExamViewer/ExamEditor）

```
QuestionEditorPreview を段階的に置き換え:

1. SubQuestionBlockContent.tsx
   - problemText → ExamViewer
   - explanation → ExamViewer

2. ProblemViewEditPage.tsx
   - 問題文編集 → ExamEditor

3. その他テキストコンテンツ → ExamViewer/ExamEditor
```

## Dependencies

```json
{
  "react-markdown": "^9.x",
  "remark-math": "^5.x",
  "rehype-katex": "^7.x",
  "katex": "^0.16.x",
  "@mui/material": "^6.x",
  "@mui/icons-material": "^6.x",
  "react-hook-form": "^7.x"
}
```

## File Structure

```
src/components/ui/exam/
├── ExamViewer.tsx          (110 lines - Pure display)
├── ExamEditor.tsx          (198 lines - Input + preview + resize)
└── index.ts                (Type + component exports)

src/features/exam/
└── components/inputs/
    └── ExamContentField.tsx (90 lines - RHF adapter)
```

## Performance Considerations

### ExamViewer
- ✅ **軽量**: Markdown + LaTeX レンダリングのみ
- ✅ **再利用可能**: ExamEditor のプレビューとして内包
- ⚠️ **大コンテンツ**: テーブルが大きい場合は height 制限を推奨

### ExamEditor
- ⚠️ **重い**: リアルタイムレンダリング
- 💡 **最適化**: debounce onChange を検討

### ExamContentField
- ✅ **条件付きレンダリング**: isEditMode により Viewer/Editor を切り替え
- 💡 **推奨**: 表示のみなら isEditMode=false に

## Browser Support

- ✅ Chrome/Edge (最新版)
- ✅ Firefox (最新版)
- ✅ Safari 15+
- ❌ IE 11 (非サポート)

## Markdown + LaTeX Examples

### インラインコード
```
コマイド: `npm install`
```

### コードブロック
````
```javascript
const x = 42;
console.log(x);
```
````

### インライン数式
```
根の公式: $x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$
```

### ブロック数式
```
$$
E = mc^2
$$
```

### テーブル
```
| 項目 | 説明 |
|------|------|
| A    | 説明A |
| B    | 説明B |
```

### リスト
```
- 箇条書き 1
- 箇条書き 2
  - ネストされた項目

1. 番号付き 1
2. 番号付き 2
```

## Known Limitations

1. **リサイズハンドル**: モバイルでは使いづらい（検討必要）
2. **大きなコンテンツ**: 500行以上は performance issue の可能性
3. **LaTeX**: マクロは未サポート（katex の制限）

## Future Enhancements

- [ ] リサイズハンドルのタッチ対応
- [ ] debounce onChange for ExamEditor
- [ ] コンテンツ保存状態の表示
- [ ] Markdown 記法ガイド/ツールバー
- [ ] Syntax highlighting for code blocks
- [ ] 複数の theme color support

## Changelog

### v1.0.0 (Initial Release)
- ExamViewer: Markdown + LaTeX display
- ExamEditor: Input + resize + preview
- ExamContentField: RHF integration
- Full test coverage
- Documentation
