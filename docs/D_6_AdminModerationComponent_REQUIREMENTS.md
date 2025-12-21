# D_6 AdminModeration Component REQUIREMENTS（提案）

## スコープ
- AdminModerationPage の UI/テーブル/詳細パネル
  - Tabs（Reports/Content/Users/Audit）
  - Search/Filter/Sort Bar
  - Table + Pagination（一覧）
  - DetailDrawer（右パネル/Sheet）
  - ConfirmDialog（重要操作の安全弁）
- Admin の操作は監査ログ（Audit）に集約して閲覧できること。

## 機能要件
- 共通（全タブ）
  - 検索: id/キーワード（対象に応じて placeholder を変更）
  - フィルタ: status/type/date range、ソート: newest/oldest/priority
  - 行選択で DetailDrawer を開く（同一ページ内で完結）
  - `outage|maintenance` の依存サービスがある場合、該当操作を disable + 理由表示
- Reports
  - 一覧: `pending/resolved/ignored`、理由、対象種別、通報者、通報日時
  - 詳細: 対象コンテンツ抜粋プレビュー、関連履歴、証拠添付（任意）
  - アクション: Resolve / Ignore / Take action（hide/delete/ban 等）
- Content
  - 一覧: exam/comment 等の検索結果、状態（public/hidden/deleted 等）
  - 詳細: 最低限のメタデータ、必要なら ProblemViewEdit へ遷移
- Users
  - 一覧: userId/email/university/status/role
  - アクション: role 変更、凍結/復帰（確認必須）
- Audit
  - 一覧: action/user/admin/target/createdAt
  - 詳細: requestId/traceId、差分メモ（任意）

## API（追加予定）
現状 `src/src/services/api/gateway.ts` には管理者向けの一覧/更新 API は未定義のため、Gateway 側契約確定後に同期する。
実装規約: UI コンポーネントは `services/api/*` を直接 import しない。`features/moderation`（hook/repository）経由で呼ぶ。

（例: 方向性のメモ）
- Reports
  - `GET /admin/reports?status=&type=&page=&limit=`
  - `PATCH /admin/reports/{reportId}`（resolve/ignore + memo）
- Users
  - `GET /admin/users?query=&page=&limit=`
  - `PATCH /admin/users/{userId}`（role/status）
- Content
  - `GET /admin/exams?query=&page=&limit=`
  - `PATCH /admin/exams/{examId}`（status）
- Audit
  - `GET /admin/audit-logs?query=&page=&limit=`

## 非機能要件
- セキュリティ: admin ロール必須。誤操作対策（ConfirmDialog / type-to-confirm）。
- 監査: 重要操作は traceId とセットでログに残す（`I_ERROR_LOG_STANDARD.md`）。
- アクセシビリティ: Table/Drawer の keyboard 操作。

## ファイル構成（提案）
- page: `src/src/pages/AdminModerationPage.tsx`
- components:
  - `src/src/components/page/AdminModerationPage/AdminModerationTabs.tsx`
  - `src/src/components/page/AdminModerationPage/AdminSearchBar.tsx`
  - `src/src/components/page/AdminModerationPage/AdminFilterBar.tsx`
  - `src/src/components/page/AdminModerationPage/ReportsTable.tsx`
  - `src/src/components/page/AdminModerationPage/ReportDetailDrawer.tsx`
  - `src/src/components/page/AdminModerationPage/ContentTable.tsx`
  - `src/src/components/page/AdminModerationPage/ContentDetailDrawer.tsx`
  - `src/src/components/page/AdminModerationPage/UsersTable.tsx`
  - `src/src/components/page/AdminModerationPage/UserDetailDrawer.tsx`
  - `src/src/components/page/AdminModerationPage/AuditLogTable.tsx`
  - `src/src/components/page/AdminModerationPage/AuditLogDetailDrawer.tsx`

## Sources
- `C_6_AdminModerationPage_REQUIREMENTS.md`
- `../overview/use-cases.md`（UC-12, UC-13）
- `../architecture/database.md`（通報/監査の概念）
