# Phase 2 コンポーネント階層化 - 実装計画書

## 現在の状態分析

### ディレクトリ構造
```
src/components/
├── common/
│   └── QuestionForm.tsx
├── generation/
├── page/
│   ├── HomePage/
│   ├── MyPage/
│   ├── ProblemCreatePage/
│   └── ProblemViewEditPage/  ← ここが対象
│       ├── common/
│       │   ├── KeywordEditor.tsx
│       │   ├── MetaSelect.tsx
│       │   ├── QuestionMetaEdit.tsx
│       │   ├── QuestionMetaView.tsx
│       │   ├── SubQuestionMetaEdit.tsx
│       │   └── SubQuestionMetaView.tsx
│       ├── QuestionBlock.tsx     ← 大型コンポーネント
│       ├── SubQuestionBlock.tsx  ← 大型コンポーネント
│       └── ...
└── problemTypes/  ← ProblemType ごとのコンポーネント
```

### 現在の課題

1. **QuestionBlock/SubQuestionBlock が大きすぎる**
   - 複数の責務を持つ（メタ情報編集、フォーム、UI など）
   - 層分離が不十分

2. **共通コンポーネントが不足**
   - 難易度プルダウンが QuestionBlock に直書き
   - キーワードエディタが独立していない
   - 問題形式プルダウンが QuestionBlock に直書き
   - 共通フォームが不十分

3. **ProblemType ごとのコンポーネント内のフォーム**
   - MUI と独自実装が混在している可能性がある
   - 共通フォームコンポーネントを使用していない可能性がある

4. **import パスが不統一**
   - 相対パスと絶対パス（@/） が混在している可能性

---

## 実装計画

### Phase 2-1: 共通コンポーネント充実化（優先度: 最高）

#### 1. TextInputField（テキスト入力フォーム）
```
src/components/common/forms/TextInputField.tsx
```
- 統一されたテキスト入力フォーム
- エラーハンドリング、ラベル、ヘルパーテキスト
- ProblemType のフォーム内で使用

#### 2. DifficultySelect（難易度プルダウン）
```
src/components/common/selects/DifficultySelect.tsx
```
- 難易度（未設定、基礎、応用、発展）の選択
- QuestionBlock/SubQuestionBlock で使用

#### 3. QuestionFormatSelect（問題形式プルダウン）
```
src/components/common/selects/QuestionFormatSelect.tsx
```
- 問題形式（0: markdown, 1: latex）の選択
- QuestionBlock で使用

#### 4. KeywordInput（キーワード入力+チップ表示）
```
src/components/common/inputs/KeywordInput.tsx
```
- キーワード入力フォーム
- 既存キーワードをチップで表示
- Chip の x ボタンで削除可能

### Phase 2-2: QuestionBlock の分解（優先度: 高）

```
src/components/page/ProblemViewEditPage/QuestionBlock/
├── QuestionBlock.tsx（メインコンポーネント）
├── QuestionBlockHeader.tsx（ヘッダー部分）
├── QuestionBlockContent.tsx（コンテンツ部分）
└── QuestionBlockMeta.tsx（メタ情報部分）
```

### Phase 2-3: SubQuestionBlock の分解（優先度: 高）

```
src/components/page/ProblemViewEditPage/SubQuestionBlock/
├── SubQuestionBlock.tsx（メインコンポーネント）
├── SubQuestionBlockHeader.tsx
├── SubQuestionBlockContent.tsx
└── SubQuestionBlockMeta.tsx
```

### Phase 2-4: ProblemType コンポーネント共通化（優先度: 中）

- 各 ProblemType の Edit コンポーネント内のフォーム
- TextInputField, DifficultySelect などを使用するように更新

### Phase 2-5: import パス統一（優先度: 中）

- すべてのコンポーネントで @/ の絶対パスを使用

---

## 実装順序

1. **共通コンポーネント作成**（Phase 2-1）
   - TextInputField
   - DifficultySelect
   - QuestionFormatSelect
   - KeywordInput
   - → ビルド・テスト検証

2. **QuestionBlock 分解**（Phase 2-2）
   - QuestionBlockHeader
   - QuestionBlockContent
   - QuestionBlockMeta
   - QuestionBlock をこれらを組み合わせるように修正
   - → ビルド・テスト検証

3. **SubQuestionBlock 分解**（Phase 2-3）
   - 同上
   - → ビルド・テスト検証

4. **ProblemType コンポーネント更新**（Phase 2-4）
   - 共通フォームを使用するように更新
   - → ビルド・テスト検証

5. **import パス統一**（Phase 2-5）
   - → 最終検証

---

## 推定作業時間

- Phase 2-1: 1時間
- Phase 2-2: 1.5時間
- Phase 2-3: 1.5時間
- Phase 2-4: 1時間
- Phase 2-5: 0.5時間
- **合計: 5.5時間**（当初の7時間より削減）

---

## 次のアクション

実装を開始しますか？ それとも計画を調整しますか？

