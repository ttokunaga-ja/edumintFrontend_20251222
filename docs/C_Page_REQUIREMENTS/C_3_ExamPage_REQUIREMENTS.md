# C_3 ProblemView/Edit Page REQUIREMENTS

## 機能要件
- Problem 表示（Meta/Question/Answer/History）
  - 初期表示は「構造」タブ（要件）/ 既視聴状態により「問題/解答」へ自動遷移（UC-06）
  - 広告/ロック制御: 未登録/初回は段階開示（構造→問題→解答）、投稿者は広告免除（UC-07）
- 編集モード（投稿者）
  - Preview/Edit トグルでフォーム編集、保存/取消、履歴ロールバック
  - 失敗時: Toast + Alert + リトライ/ロールバック導線
- Social（Phase2）
  - いいね/コメント/通知はヘルスとフラグで制御（outage|maintenance で CTA disable + Alert C/D）
- API（現状実装: `src/src/services/api/gateway.ts`）
  - `GET /exams/{examId}`
  - `POST /exams/{examId}/like`, `POST /exams/{examId}/bookmark`, `POST /exams/{examId}/share`
  - `GET /comments?examId=`, `POST /comments`, `DELETE /comments/{commentId}`, `POST /comments/{commentId}/vote` （Phase 2: eduanimaSocial）
  - `GET /exam-edit-history/{examId}`, `POST /exam-history/{examId}/rollback`（履歴）
- ServiceHealth
  - `GET /health/content` / `GET /health/community` / `GET /health/notifications`
  - `outage|maintenance` は API 呼び出し抑止 + CTA disable
  - `degraded` は警告表示（CTAは原則有効）

## 非機能要件
- 編集保存は楽観 UI 不可（API 確定後に反映）。エラーは Toast + Alert。
- i18n 辞書化。TTI p75 < 3.0s。

## 画面/コンポーネント配置
- route/page tsx（単一ページで View/Edit を内包）
  - 目標: `src/src/pages/ProblemViewEditPage.tsx`（Preview/Edit を同一ページ内で切替）
  - 現状: legacy `src/components/ProblemViewEditPage.tsx` / `src/components/ProblemViewEditPageNew.tsx`
- 方針
  - Edit は同ページ内で `mode=preview|edit` を切替し、**Edit中でも Preview を参照可能**にする（機能が重複するため）。
  - `QuestionBlock/SubQuestionBlock/AnswerBlock` を Preview と Edit で共用（Edit はフォームラッパーで包む）。
- 共通: PageHeader, ProblemMetaBlock, QuestionBlock, SubQuestionBlock, AnswerBlock, PreviewEditToggle, EditHistoryBlock, ContextHealthAlert, AdModal。

## ワイヤーフレーム（案）
```text
┌──────────────────────────────────────────────────────────────┐
│ TopMenuBar                                                   │
├──────────────────────────────────────────────────────────────┤
│ ← 検索結果に戻る / パンくず                                    │
│ ProblemMetaHeader                                            │
│  Title + meta chips + stats                                  │
│  Actions: [★bookmark] [共有] [通報] [PDF]                     │
├──────────────────────────────────────────────────────────────┤
│ ContextHealthAlert (content/community/notifications)          │
├──────────────────────────────────────────────────────────────┤
│ (Owner only) PreviewEditToggle   [Preview] [Edit]            │
|                                [Save] [Cancel]               |
├──────────────────────────────────────────────────────────────┤
│ Tabs: [構造] [問題] [解答] [履歴]                              │
├──────────────────────────────────────────────────────────────┤
│ Main                                                         │
│  - Structure/Question/Answer view (広告/ロック制御)             │
│  - QuestionBlock / SubQuestionBlock / AnswerBlock             │
│  - 全問解答表示 / 解答表示トグル                               │
│  - (Viewer) CommentSection (Phase 2)                          │
│  - (Owner Preview/History) EditHistoryBlock                   │
└──────────────────────────────────────────────────────────────┘
```

## 構造イメージ（閲覧モード）
```
[問題情報 Metadata]
  - タイトル / 科目・年度 / 大学 / 作成者 / 公開設定 / ステータス / 閲覧数・いいね・バッド・コメント (Phase 2)
  - アクションバー: いいね / バッド / ブックマーク / 共有 / PDF出力 / 通報

[大問ブロック #1]
  ├─ Header: 大問番号 / 難易度 / 大問キーワード（チップ複数）
  ├─ 大問の問題文（Markdown+LaTeX）
  └─ 小問ブロック群
       [小問 #1]
         - Header: 小問番号 / 問題形式 / 小問キーワード（チップ複数）
         - 小問の問題文
         - 解答・解説（折りたたみ可能）
       [小問 #2] ...（同上）

[大問ブロック #2] ... （以降繰り返し）

[コメントセクション (Phase 2)]
  - コメント入力 / 投稿ボタン / 既存コメント一覧
```

## 構造イメージ（編集モード）
```
[問題情報 Metadata エディタ]
  - タイトル、科目、年度、大学、作成者などのフォーム
  - 公開設定 / ステータス / 閲覧数系は表示のみ（編集不可）
  - アクションバー: プレビュー切替 / 保存 / 取消

[大問ブロック エディタ #1]
  ├─ Headerフォーム: 大問番号（必須） / 難易度 / 大問キーワード（チップ追加・削除）
  ├─ 大問問題文エディタ（Markdown対応テキストエリア）
  └─ 小問ブロックエディタ群
       [小問エディタ #1]
         - Headerフォーム: 小問番号 / 問題形式 / キーワード（チップ追加・削除）
         - 小問問題文エディタ
         - 解答・解説エディタ
         - 解答折りたたみ設定・表示切替
       [小問エディタ #2] ...（同上）

[大問ブロック追加/削除]
  - 大問の追加 / 移動 / 削除
  - 小問の追加 / 移動 / 削除

[履歴・ロールバック]
  - 編集履歴リスト / ロールバック操作
```

## ブロック → コンポーネント分割（改訂版 - アーキテクチャ準拠）

### ページレイヤー
- `src/pages/ProblemViewEditPage.tsx` : ページエントリーポイント（Preview/Edit 切り替えのみ）

### ページ固有コンポーネント
- `src/components/page/ProblemViewEditPage/`
  - `PreviewView.tsx` : Preview 表示エリア
  - `EditView.tsx` : Edit 表示エリア（= ProblemEditor）
  - `MetaSection.tsx` : 試験メタ情報
  - `ActionSection.tsx` : 保存/キャンセル/プレビュー切り替えバー
  - `QuestionSection/` : 大問セクション
    - `QuestionBlock.tsx` : 大問コンテナ
    - `Header.tsx` : 大問番号・削除ボタン
    - `Meta.tsx` : 難易度・キーワード
    - `Content.tsx` : 大問本文
  - `SubQuestionSection/` : 小問セクション（形式別分離）
    - `SubQuestionBlock.tsx` : 小問親コンポーネント（形式振り分け）
    - `common/` : 全形式共通
      - `Header.tsx` : 小問番号・タイプ・アクション
      - `Meta.tsx` : キーワード・タイプ選択
    - `Selection/`, `Matching/`, `Ordering/`, `Essay/` : 形式別実装

### 共通コンポーネント
- `src/components/common/`
  - `TopMenuBar.tsx` : トップメニューバー
  - `ContextHealthAlert.tsx` : サービスヘルスアラート
  - `PreviewEditToggle.tsx` : Preview/Edit トグル
  - `editors/` : 再利用可能なエディタコンポーネント
    - `QuestionEditorPreview.tsx` : LaTeX/Markdown 対応テキスト編集（Undo/Redo付き）
    - `EditorPreviewPanel.tsx` : エディタ + プレビュー パネル
    - `FormEditor.tsx` : テキスト入力フォーム
    - `LaTeXPreview.tsx` : LaTeX/Markdown レンダリング

### その他（Phase 2 以降）
- `src/components/page/ProblemViewEditPage/`
  - `CommentSection.tsx` : コメント機能
  - `EditHistoryBlock.tsx` : 編集履歴・ロールバック

## 理想要件 vs 現状差分
- 理想: 編集トグル→フォーム編集→保存/取消が正常に動作し、履歴ロールバックが成功すること。Social もヘルス/フラグで制御し、API スキーマに同期。
- 現状:
  - FIGMA版 `src/src/pages/ProblemViewEditPage.tsx` には編集 UI の統合が不十分（Preview/Edit/History の表示・導線整理が必要）。
  - legacy 側（`src/components/ProblemViewEditPage.tsx` 等）には一部コンポーネントが存在するため、移行方針と合わせて整理が必要。
  - 優先度は `Z_REFACTOR_REQUIREMENTS.md` と `../overview/refactor-priorities.md` を参照。

## Sources
- `../overview/requirements.md`, `../overview/use-cases.md`, `../overview/current_implementation.md`
- `../implementation/service-health/README.md`
- `src/src/services/api/gateway.ts`

## QuestionEditorPreview 統合パターン

### 実装ガイド
すべての問題形式（選択肢、組み合わせ、順序、記述）において、LaTeX/Markdown の編集・表示は `src/components/common/editors/QuestionEditorPreview.tsx` で統一します。

#### パターン A: 大問本文編集
**ファイル**: `src/components/page/ProblemViewEditPage/QuestionSection/Content.tsx`

```tsx
<QuestionEditorPreview
  value={question.content}
  mode={mode}  // 'preview' | 'edit'
  onUnsavedChange={(hasUnsaved) => setHasUnsaved(hasUnsaved)}
/>
```

**用途**: Question.content（大問本文）の LaTeX/Markdown 編集

#### パターン B: 小問本文編集
**ファイル**: `src/components/page/ProblemViewEditPage/SubQuestionSection/*/Content.tsx`

```tsx
<QuestionEditorPreview
  value={subQuestion.content}
  mode={mode}
  onUnsavedChange={(hasUnsaved) => setHasUnsaved(hasUnsaved)}
/>
```

**用途**: SubQuestion.content（小問本文）の LaTeX/Markdown 編集

#### パターン C: 選択肢編集（Selection 形式）
**ファイル**: `src/components/page/ProblemViewEditPage/SubQuestionSection/Selection/OptionBlock.tsx`

```tsx
<QuestionEditorPreview
  value={option.text}
  mode={mode}
  onUnsavedChange={(hasUnsaved) => setHasUnsaved(hasUnsaved)}
/>
```

**用途**: Selection 形式の選択肢テキストの LaTeX/Markdown 編集

#### パターン D: ペア編集（Matching 形式）
**ファイル**: `src/components/page/ProblemViewEditPage/SubQuestionSection/Matching/PairBlock.tsx`

```tsx
{/* 質問テキスト */}
<QuestionEditorPreview
  value={pair.question}
  mode={mode}
  onUnsavedChange={(hasUnsaved) => setHasUnsaved(hasUnsaved)}
/>

{/* 回答テキスト */}
<QuestionEditorPreview
  value={pair.answer}
  mode={mode}
  onUnsavedChange={(hasUnsaved) => setHasUnsaved(hasUnsaved)}
/>
```

**用途**: Matching 形式のペア質問・回答テキストの LaTeX/Markdown 編集

#### パターン E: アイテム編集（Ordering 形式）
**ファイル**: `src/components/page/ProblemViewEditPage/SubQuestionSection/Ordering/ItemBlock.tsx`

```tsx
<QuestionEditorPreview
  value={item.text}
  mode={mode}
  onUnsavedChange={(hasUnsaved) => setHasUnsaved(hasUnsaved)}
/>
```

**用途**: Ordering 形式のアイテムテキストの LaTeX/Markdown 編集

#### パターン F: 記述解答編集（Essay 形式）
**ファイル**: `src/components/page/ProblemViewEditPage/SubQuestionSection/Essay/AnswerBlock.tsx`

```tsx
{/* 模範解答 */}
<QuestionEditorPreview
  value={answer.sampleAnswer}
  mode={mode}
  onUnsavedChange={(hasUnsaved) => setHasUnsaved(hasUnsaved)}
/>

{/* 採点基準 */}
<QuestionEditorPreview
  value={answer.gradingCriteria}
  mode={mode}
  onUnsavedChange={(hasUnsaved) => setHasUnsaved(hasUnsaved)}
/>
```

**用途**: Essay 形式の模範解答・採点基準の LaTeX/Markdown 編集

### コンポーネント仕様

#### QuestionEditorPreview.tsx
- **Props**:
  - `value: string` : 編集対象テキスト
  - `mode?: 'preview' | 'edit'` : 表示モード（デフォルト: 'preview'）
  - `onUnsavedChange?: (hasUnsaved: boolean) => void` : 未保存状態変更コールバック
- **動作**:
  - `mode='preview'` :読み取り専用プレビュー表示（LaTeXPreview のみ）
  - `mode='edit'` : 左にフォーム、右にプレビュー表示（リサイズ可能）
  - `onUnsavedChange` : 初期値との差分を追跡し、変更があれば true をコール

#### EditorPreviewPanel.tsx
- **Props**:
  - `value: string` : エディタ内容
  - `onChange: (value: string) => void` : 入力変更コールバック
  - `mode?: 'preview' | 'edit'` : 表示モード
  - その他プロパティはドキュメント参照
- **動作**:
  - `mode='preview'` : LaTeXPreview のみ表示（読み取り専用）
  - `mode='edit'` : FormEditor（左）+ 垂直リサイズバー + LaTeXPreview（右）

#### FormEditor.tsx
- **Props**:
  - `value: string` : フォーム値
  - `onChange: (value: string) => void` : 入力イベント
  - その他プロパティはドキュメント参照
- **機能**:
  - 等幅フォント、行番号表示
  - LaTeX デリミタ（$, $$）の自動ペアリング
  - シンタックスハイライト（$ 囲み部分の色分け）

#### LaTeXPreview.tsx
- **Props**:
  - `content: string` : レンダリング対象テキスト
  - その他プロパティはドキュメント参照
- **機能**:
  - LaTeX（$ $, $$ $$）と Markdown の自動認識・レンダリング
  - KaTeX + MathJax でブラウザレンダリング
  - エラーハンドリング：不完全数式は直前の正しい状態を維持


