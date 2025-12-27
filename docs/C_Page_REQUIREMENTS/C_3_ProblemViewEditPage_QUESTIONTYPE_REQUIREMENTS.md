# 問題種別設計要件 — ProblemView/Edit Page (設計のみ) ✅

## 🎯 目的
- 各問題種別（MultipleChoice, TrueFalse, FreeText, Cloze, Numeric, Programming, CodeReading, Proof 等）ごとに**専用の View / Edit コンポーネント**を作成し、読みやすく、テスト可能で拡張しやすい構造を設計する。
- Moodle の問題種別設計を参考に、プラグイン性・拡張性・採点/フィードバック仕様を取り入れた設計を提示する。

---

## 🔍 参考（Moodle の方針概要）
- Moodle は問題種別をプラグイン的に実装し、各種レンダラ（表示）や編集 UI、採点ロジック、ヒント/フィードバックを個別に持つ。これにより新しい種類を容易に追加できる。設計も同様の**拡張性（プラグイン風）**を重視する。

---

## 📐 設計方針（高レベル）
- **Single Responsibility**: 各問題種別は表示(View) と編集(Edit) を別コンポーネントで実装する（例: `MultipleChoiceView.tsx`, `MultipleChoiceEdit.tsx`）。
- **契約（Props）を統一**: `ProblemTypeViewProps` / `ProblemTypeEditProps` を共通定義し、共通のフィールド（questionContent, questionFormat, answerContent, options, showAnswer 等）を使う。
- **Registry（拡張ポイント）**: `ProblemTypeRegistry` を使って型ID（例: id=2）やキー（例: 'multiplechoice'）で登録。動的 import を使い lazy-loading 可能にする。
- **Accessibility & i18n**: ARIA、ラベル、キーボード操作対応。UI 文言は i18n 管理（`i18n` / 翻訳キー）にする。
- **テスト & Storybook**: 各コンポーネントに Storybook ストーリーを作成し、ユニットテスト（イベント/callback 検証）とスナップショット/アクセシビリティテストを用意する。

---

## ディレクトリ / 命名規則（提案）
- src/components/problemTypes/
  - `MultipleChoiceView.tsx`  // 表示用
  - `MultipleChoiceEdit.tsx`  // 編集用
  - `MultipleChoiceView.stories.tsx`
  - `__tests__/MultipleChoiceView.test.tsx`
  - `__tests__/MultipleChoiceEdit.test.tsx`
  - `docs/IMPLEMENTATION_REPORTS/DATE_add-multiplechoice-{view|edit}.md`
- Registry と型は `ProblemTypeRegistry.tsx` に集約。

---

## 主要インターフェース（抜粋）

- ProblemTypeViewProps
  - subQuestionNumber: number
  - questionContent: string
  - questionFormat: 0|1 (0: Markdown, 1: LaTeX)
  - answerContent?: string
  - answerFormat?: 0|1
  - options?: Array<{id:string; content:string; isCorrect:boolean}>
  - showAnswer?: boolean

- ProblemTypeEditProps extends ProblemTypeViewProps
  - onQuestionChange?: (content:string) => void
  - onAnswerChange?: (content:string) => void
  - onOptionsChange?: (options: Array<...>) => void
  - onFormatChange?: (field:'question'|'answer', format:0|1) => void

---

## 共通編集・プレビューコンポーネント（設計） 🔁

### 概要
- **目的**: 問題文 / 解答解説の編集フォームとプレビュー表示を、選択式・記述式を問わず **共通コンポーネント** として提供し、保守性・一貫性を高める。例外として、コード専用のリッチエディタ（シンタックスハイライト、実行/ランタイムテスト統合など）が必要な場合は専用コンポーネントを用意する。

### 提案コンポーネント
1. `ProblemTextEditor` (共通)
  - 役割: 問題文や解答・解説の入力 UI を提供（textarea / format toggle / onChange コールバック / プレースホルダ等）
  - 主な Props:
    - value: string
    - format: 0 | 1
    - onChange: (v: string) => void
    - onFormatChange?: (next: 0|1) => void
    - ariaLabel: string
    - placeholder?: string
    - showPreview?: boolean
    - previewComponent?: React.ComponentType<{content:string; format:0|1}>
  - 備考: 内部で Debounce を用いて Preview 再レンダリングを抑制できるようにする。

2. `PreviewBlock` (共通)
  - 役割: Markdown / LaTeX を切り替えてレンダリングする単一責任のコンポーネント
  - 主な Props:
    - content: string
    - format: 0 | 1
    - className?: string
  - 実装: `MarkdownBlock` / `LatexBlock` を内部で切り替え。サニタイズや XSS 防御はここで集中して行う。

3. `CodeEditorWrapper`（例外用）
  - 役割: プログラミング問題等で必要なコード編集体験（Monaco や CodeMirror）を提供
  - 主な Props:
    - value: string
    - language?: string
    - onChange: (v: string) => void
    - showPreview?: boolean (実行結果の埋め込みなどは別 API と協調)
  - 備考: heavy-weight なので遅延ロード（React.lazy）推奨。

### 使用ルール（ガイドライン）
- すべての Edit コンポーネントは、**直接 textarea を持たず**、`ProblemTextEditor`/`PreviewBlock` を compose して利用する。
- 例外: ProgrammingEdit は `ProblemTextEditor` と `CodeEditorWrapper` を状況により切り替え（例: `questionFormat` が "code" を指す等）する。
- PreviewBlock は常に安全なサニタイズを行い、LaTeX 表示は `katex` を使う（既存の `LatexBlock` を再利用）。

### API 互換・移行
- 既存の `FreeTextEdit` などは、内部ロジックを `ProblemTextEditor` に置き換えるだけで互換性を保てるようにする（props mapping を用意）。

### テストカバレッジ
- `ProblemTextEditor`:
  - format 切替、onChange 発火、プレースホルダ表示のテスト
  - accessibility: aria-label, keyboard toggle
- `PreviewBlock`:
  - Markdown/LaTeX のレンダリング一致
  - XSS サニタイズテスト
- Storybook にて Interactive controls を用意

---

### 実装小ステップ（提案）
1. `ProblemTextEditor` および `PreviewBlock` の設計と Story 作成（小 PR）
2. `FreeTextEdit` を `ProblemTextEditor` に置き換え（テスト更新）
3. 複数種別（Cloze / Programming / MultipleChoice）の Edit を順次 refactor
4. E2E で ProblemEditor 保存/読み込みを検証

---

※ 全体設計へ統合する際は、アクセシビリティ（スクリーンリーダ対応）と i18n を優先して検証します。

---

## Registry / 解決戦略（設計）
- registerProblemType({ id, key, view, edit, meta })
- lookup by id or key — used by `SubQuestionBlock` などで `getProblemTypeView(typeId)` / `getProblemTypeEdit(typeId)` を呼ぶ。
- Edit コンポーネントは遅延読み込み（React.lazy + Suspense）で、エディター重い処理を遅延ロードする。

---

## 各種機能仕様（要点）
- **採点情報**: View 側は採点/正解表示のため `showAnswer` flag を受け取る。正誤表示の表現は各種問題で異なる。
- **ヒント/フィードバック**: 各コンポーネントは optional な `hints?: string[]` `feedback?: string` を受け取る。
- **複数正解・部分点**: MultipleChoice / Programming / Cloze 等は部分点ロジックをサポートするオプションを持つ（メタ情報でスコア配分を定義）。
- **保存/バリデーション**: Edit 側は `onValidate?: () => {valid:boolean, errors?:string[]}` を提供することで ProblemEditor が保存前に検証できる。

---

## Accessibility & i18n（実装チェックリスト）
- フォームコントロールは明確なラベルと `aria-*` を持つ
- 動的リスト（選択肢追加・削除）でフォーカス管理を行う
- Storybook にアクセシビリティチェック（axe）を追加
- すべてのユーザー向け文字列は翻訳キーを使う

---

## テスト計画
- Storybook stories: Default / WithAnswer / LaTeX / LongContent / EdgeCases
- Unit tests: rendering, callback invocation, format toggle, option add/remove
- Snapshot tests for visual regression
- Integration E2E for ProblemEditor (+ MSW による API のモック)

---

## マイグレーション / 運用（小さな PR 戦略）
1. `ProblemTypeRegistry` のテスト・ドキュメント化（小 PR）
2. FreeTextEdit の整備（既に実装済み）
3. MultipleChoice / Cloze / Programming Edit の追加（各々小さな PR）
4. TrueFalse / Numeric / Proof / CodeReading の追加
5. CI: storybook build + test + ts typecheck

---

## 例: MultipleChoice JSON スキーマ（簡易）
```json
{
  "type": "multiplechoice",
  "question": "Which are prime?",
  "options": [
    {"id":"a","content":"2","isCorrect":true},
    {"id":"b","content":"4","isCorrect":false}
  ],
  "metadata": {"partialScoring": true}
}
```

---

## Deliverables（設計フェーズ）
- 本ドキュメント（設計） — 完了
- 詳細設計（必要に応じて補足: UI モック、アクセシビリティ仕様、API スペック） — 次フェーズ
- 1つずつ小さな PR で段階的実装（レビューしやすく）

---

## 次のアクション（提案）
1. この設計を確認してもらい、問題がなければ **MultipleChoice Edit** の実装を本格化（既に story/tests を追加済み）します。✅
2. 続いて **TrueFalse / Numeric / Proof / CodeReading** の Edit を順に実装していきます。✍️

---

※ 参考: Moodle の問題種別設計（プラグイン化、採点/フィードバックの独立したロジック）を踏襲しました。必要であれば、Moodle の個別ページ（Question types）を解析して、Score / Behavior / Feedback モデルをより詳しく取り込むことも可能です。

---

## GUIの包含関係（メンタルモデル）とディレクトリ構成（設計）

ご提示いただいた要件（全9種類の問題形式、共通コンポーネントの配置場所、Markdown/LaTeX/プレビューの詳細構成）に基づき、**GUIの包含関係（視覚的な階層）**と**ディレクトリ構造**を設計しました。

共通部品を `src/components/common` に切り出し、問題形式ごとの固有ロジックを `src/components/common/ViewerEditor` に集約することで、拡張性と保守性を最大化します。

---

### 1. GUIの包含関係（メンタルモデル）

画面上でコンポーネントがどうネストされるかの全体図です。

```text
[Page: ProblemCreatePage]
 └─ [GrandQuestionBlock] (大問ブロック: 1つの大問)
     │
     ├─ [GrandQuestionHeader] (大問ヘッダー)
     │   ├─ [DifficultyBlock] (★共通: 難易度)
     │   └─ [KeywordBlock] (★共通: キーワード)
     │
     └─ [SubQuestionList] (小問リスト)
         │
         └─ [SubQuestionBlock] (小問ブロック)
             │
             ├─ [QuestionMeta] (メタ情報エリア: 横並び配置)
             │   ├─ [QuestionFormatBlock] (★共通: 問題形式プルダウン 1~9)
             │   └─ [KeywordBlock] (★共通: 小問用キーワード)
             │
             └─ [ProblemAnswerWrapper] (形式ごとのUI切り替えコンテナ)
                 │
                 │  ▼ state.format に応じて以下のいずれか1つを表示 (ViewerEditor)
                 │
                 ├─ [DescriptiveEditor] (ID:1 記述式)
                 │   ├─ [MarkdownLatexEditor] (★共通: 問題文エディタ)
                 │   │   ├─ [RawInputArea] (Markdown/LaTeX 入力フォーム)
                 │   │   └─ [PreviewDisplay] (リアルタイムプレビュー)
                 │   └─ [AnswerTextConfig] (正答キーワード・文字数制限設定)
                 │
                 ├─ [SelectionEditor] (ID:2 選択式)
                 │   ├─ [MarkdownLatexEditor] (問題文: 必要なら色付け機能拡張)
                 │   └─ [OptionsManager] (選択肢リスト作成・正誤チェック)
                 │
                 ├─ [FillInBlankEditor] (ID:4 穴埋め式)
                 │   ├─ [MarkdownLatexEditor] (問題文: 穴埋め記法 {{1}} を使用)
                 │   └─ [BlankAnswerList] (空欄ごとの正答設定)
                 │
                 ├─ [TrueFalseEditor] (ID:5 正誤判定)
                 │   ├─ [MarkdownLatexEditor] (問題文)
                 │   └─ [TrueFalseToggle] (○/× 正答スイッチ)
                 │
                 ├─ [MathCalculationEditor] (ID:6 数値計算式)
                 │   ├─ [MarkdownLatexEditor] (数式含む問題文)
                 │   └─ [NumericalInputConfig] (数値正答・許容誤差設定)
                 │
                 ├─ [ProofEditor] (ID:7 証明問題)
                 │   ├─ [MarkdownLatexEditor] (証明課題文)
                 │   └─ [ProofStepBuilder] (証明プロセスのステップ定義)
                 │
                 ├─ [ProgrammingEditor] (ID:8 プログラミング)
                 │   ├─ [MarkdownLatexEditor] (課題説明)
                 │   ├─ [CodeEditor] (初期コード/模範解答コード)
                 │   └─ [TestCaseManager] (テストケース入力/出力)
                 │
                 └─ [CodeReadingEditor] (ID:9 コード読解)
                     ├─ [CodeSnippetViewer] (読解対象のコード)
                     ├─ [MarkdownLatexEditor] (設問文)
                     └─ [OptionsManager] (選択肢または入力欄)
```

---

### 2. ディレクトリ構造の提案

`common` に汎用部品を置き、`ViewerEditor` に形式ごとの「問題＋解答」セットのロジックを置きます。`features` はそれらを組み立てる役割です。

**Edumintfrontedfigma/src/src/**

```text
 ├─ components/
 │   ├─ common/
 │   │   ├─ DifficultyBlock/         // 【難易度】(Easy/Normal/Hard, ★表示)
 │   │   ├─ KeywordBlock/            // 【キーワード】(タグ入力)
 │   │   ├─ QuestionFormatBlock/     // 【問題形式】(プルダウン)
 │   │   │
 │   │   ├─ MarkdownLatex/           // 【MD/LaTeXエディタ】
 │   │   │   ├─ index.tsx            // ラッパー
 │   │   │   ├─ RawInputArea.tsx     // テキストエリア
 │   │   │   └─ PreviewDisplay.tsx   // レンダリング表示
 │   │   │
 │   │   └─ ViewerEditor/            // 【形式別エディタ】(ここにロジックを集約)
 │   │       ├─ Descriptive/         // ID:1 記述式
 │   │       │   └─ index.tsx
 │   │       ├─ Selection/           // ID:2 選択式
 │   │       │   └─ index.tsx
 │   │       ├─ FillInBlank/         // ID:4 穴埋め式
 │   │       ├─ TrueFalse/           // ID:5 正誤判定
 │   │       ├─ MathCalculation/     // ID:6 数値計算
 │   │       ├─ Proof/               // ID:7 証明
 │   │       ├─ Programming/         // ID:8 プログラミング
 │   │       └─ CodeReading/         // ID:9 コード読解
 │
 ├─ features/
 │   ├─ content/
 │   │   ├─ components/
 │   │   │   ├─ Editor/
 │   │   │   │   ├─ GrandQuestion/
 │   │   │   │   │   ├─ GrandQuestionBlock.tsx   // 大問枠
 │   │   │   │   │   └─ GrandQuestionHeader.tsx  // 難易度+キーワード配置
 │   │   │   │   │
 │   │   │   │   └─ SubQuestion/
 │   │   │   │       ├─ SubQuestionBlock.tsx     // 小問枠
 │   │   │   │       ├─ QuestionMeta.tsx         // 形式+キーワード配置
 │   │   │   │       └─ ProblemAnswerWrapper.tsx // ViewerEditorを呼び出す分岐点
 │
 ├─ pages/ (or app/)
 │   └─ ProblemCreatePage.tsx
```

---

### 3. 実装のポイント

#### A. `ProblemAnswerWrapper` (振り分けロジック)
`features/content/components/Editor/SubQuestion/ProblemAnswerWrapper.tsx` は、選択された形式IDを見て、`components/common/ViewerEditor/` 内の適切なコンポーネントを呼び出すだけの「スイッチ」として機能します。

```tsx
import { DescriptiveEditor } from '@/components/common/ViewerEditor/Descriptive';
import { SelectionEditor } from '@/components/common/ViewerEditor/Selection';
// ... 他の形式もインポート

export const ProblemAnswerWrapper = ({ formatId, data, onChange }) => {
  switch (formatId) {
    case 1: return <DescriptiveEditor data={data} onChange={onChange} />;
    case 2: return <SelectionEditor data={data} onChange={onChange} />;
    // ...
    case 8: return <ProgrammingEditor data={data} onChange={onChange} />;
    default: return <div>形式を選択してください</div>;
  }
};


