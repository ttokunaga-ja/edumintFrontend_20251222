# C_6 AdminModeration Page REQUIREMENTS（提案）

## 機能要件
- 目的: 不正コンテンツの通報対応、ユーザー/コンテンツの状態変更、監査ログ確認。
- アクセス制御
  - admin ロールのみ表示/操作可能。
  - 未認証/権限不足は即リダイレクト（403/401 のハンドリングを統一）。
- 主要タブ（同一ページ内で切替）
  1. Reports（通報一覧/詳細/対応）
  2. Content（問題/コメント等の検索・状態変更）
  3. Users（ユーザー検索・ロール/凍結/復帰）
  4. Audit（操作履歴/監査ログの検索）
- 一覧操作（共通）
  - Search（ID/キーワード）、Filter（status/type/date range）、Sort（newest/oldest/priority）。
  - Pagination（ページング or 無限スクロールは後回し）。
  - Row click で DetailDrawer（右）を開き、詳細とアクションを提示。
- Reports（通報）
  - 一覧: `pending/resolved/ignored`、理由、対象種別（exam/question/sub_question/exam_comment/user）、通報者、通報日時。
  - 詳細: 対象コンテンツの抜粋プレビュー、関連履歴（同対象の過去通報/対応履歴）、証拠添付（任意）。
  - アクション: Resolve / Ignore / Take action（hide/delete/ban など）※すべて確認ダイアログ必須。
- Content / Users
  - 一覧: 検索結果テーブル + 詳細パネル + 状態変更アクション（確認必須）。
  - Admin が ProblemViewEdit の編集機能を再利用できるよう、詳細パネルから該当ページへの遷移 CTA を用意。
- ServiceHealth（運用）
  - `GET /health/summary` を一次情報として CTA を制御（必要に応じて `/health/{service}` を追加）。
  - `outage|maintenance` の依存サービス（content/community/notifications 等）に紐づく操作は無効化 + 理由を表示。

## 非機能要件
- 監査/追跡
  - すべての操作に traceId を付与（`I_ERROR_LOG_STANDARD.md` に準拠）。
  - 重要操作（ban/delete/hide/rollback）は二重確認（Dialog + “type to confirm” を検討）。
- UI
  - 1画面で完結（タブ切替のみでルーティングを増やさない）。
  - テーブルはキーボード操作（行移動/詳細開閉）を提供。

## 画面/コンポーネント配置
- route/page tsx: `src/src/pages/AdminModerationPage.tsx`
- 目標: legacy `src/components/AdminPage.tsx` を置き換え（段階移行）。
- 共通: `Common/TopMenuBar`, `Common/PageHeader`, `Common/ContextHealthAlert`, `Common/Table`, `Common/Pagination`, `Common/ConfirmDialog`。

## ワイヤーフレーム（案）
```text
┌──────────────────────────────────────────────────────────────────────┐
│ TopMenuBar                                                           │
├──────────────────────────────────────────────────────────────────────┤
│ PageHeader: Admin / Moderation                                       │
│ ContextHealthAlert (content/community/notifications/search)          │
├──────────────────────────────────────────────────────────────────────┤
│ Tabs: [Reports] [Content] [Users] [Audit]   Search [______________]  │
│ Filters: Status [Pending▼] Type [All▼] Date [____-____] Sort [▼]     │
├──────────────────────────────────────────────────────────────────────┤
│ (2-column @lg)                                                       │
│ ┌────────────── MainPane ──────────────┐  ┌────── DetailDrawer ─────┐ │
│ │ Table (rows)                         │  │ Header: selected item    │ │
│ │  - id / type / reason / status ...   │  │ Tabs: [Overview][History]│ │
│ │  - ...                               │  │ Content preview (excerpt)│ │
│ │ Pagination                           │  │ Action buttons            │ │
│ └──────────────────────────────────────┘  │  [Resolve][Ignore][Action]│ │
│                                            └─────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘

Mobile:
- DetailDrawer は Sheet/FullScreenDialog で表示（戻るで閉じる）。
```

## ブロック → コンポーネント分割（案）
- Page shell
  - `Common/TopMenuBar.tsx`, `Common/PageHeader.tsx`, `Common/ContextHealthAlert.tsx`
- Tabs / Filters
  - `AdminModerationPage/AdminModerationTabs.tsx`
  - `AdminModerationPage/AdminSearchBar.tsx`
  - `AdminModerationPage/AdminFilterBar.tsx`
- Reports
  - `AdminModerationPage/ReportsTable.tsx`
  - `AdminModerationPage/ReportDetailDrawer.tsx`
  - `AdminModerationPage/ReportActionPanel.tsx`
- Content
  - `AdminModerationPage/ContentTable.tsx`
  - `AdminModerationPage/ContentDetailDrawer.tsx`（ProblemViewEdit への遷移 CTA）
- Users
  - `AdminModerationPage/UsersTable.tsx`
  - `AdminModerationPage/UserDetailDrawer.tsx`
  - `AdminModerationPage/UserRoleEditor.tsx`
- Audit
  - `AdminModerationPage/AuditLogTable.tsx`
  - `AdminModerationPage/AuditLogDetailDrawer.tsx`
- Confirm / Safety
  - `Common/ConfirmDialog.tsx`（重要操作の共通）
  - `AdminModerationPage/ActionReasonInput.tsx`（任意: 監査メモ）

## Sources
- `../overview/use-cases.md`（UC-09, UC-12, UC-13）
- `../architecture/edumint_architecture.md`
- `../architecture/database.md`（通報システムの概念/テーブル）
