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
  - `GET /comments?examId=`, `POST /comments`, `DELETE /comments/{commentId}`, `POST /comments/{commentId}/vote`
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
│  - (Viewer) CommentSection                                    │
│  - (Owner Preview/History) EditHistoryBlock                   │
└──────────────────────────────────────────────────────────────┘
```

## 構造イメージ（閲覧モード）
```
[問題情報 Metadata]
  - タイトル / 科目・年度 / 大学 / 作成者 / 公開設定 / ステータス / 閲覧数・いいね・バッド・コメント
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

[コメントセクション]
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

## ブロック → コンポーネント分割（案）
- Header: `Common/TopMenuBar.tsx`, `Common/Breadcrumbs.tsx`
- Meta: `Common/ProblemMetaHeader.tsx`, `ProblemViewEditPage/ActionBar.tsx`
- Alerts: `Common/ContextHealthAlert.tsx`
- Owner toggle: `Common/PreviewEditToggle.tsx`
- Tabs: `ProblemViewEditPage/ContentTabs.tsx`
- Content blocks (shared): `Common/QuestionBlock.tsx`, `Common/SubQuestionBlock.tsx`, `Common/AnswerBlock.tsx`, `Common/MarkdownLatexRenderer.tsx`
- Ads: `Common/AdGate.tsx`, `Common/AdModal.tsx`
- Comments: `ProblemViewEditPage/CommentSection.tsx`, `ProblemViewEditPage/CommentCard.tsx`
- History: `Common/EditHistoryBlock.tsx`

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


