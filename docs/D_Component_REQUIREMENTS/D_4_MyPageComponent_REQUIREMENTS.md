# D_4 MyPage Component REQUIREMENTS

## スコープ
- UserStatsCards, ProfileEditForm, WalletCard, NotificationList, Pagination, EmptyState。

## 機能要件
- UserStatsCards
  - `GET /user/stats` の集計値を表示（投稿/閲覧/高評価/コメント等）
- ProfileEditForm
  - `PATCH /user/profile`（バリデーション + 保存/失敗表示）
- WalletCard（Phase2）
  - `VITE_ENABLE_WALLET`（計画） + `GET /health/wallet` が operational で有効化
  - `GET /wallet/balance` 表示、`POST /wallet/withdraw`（出金）
  - 未提供時は Coming Soon + CTA disable
- NotificationList
  - `GET /notifications?limit=`、未読数は TopMenuBar と整合
  - `GET /health/notifications` outage|maintenance で CTA disable
  - 実装規約: UI コンポーネントは `services/api/*` を直接 import しない。`features/user` / `features/notifications` / `features/wallet` の hook/repository 経由で呼ぶ。
- モック（暫定）
  - `src/src/services/api/gateway.ts` は `VITE_API_BASE_URL` が localhost の場合にモックへ分岐

## 非機能要件
- i18n。アクセシビリティ。エラーは Toast + inline。

## ファイル構成（提案）
- page:
  - `src/src/pages/MyPage.tsx`
- components:
  - `src/src/components/page/MyPage/ProfileSummaryCard.tsx`
  - `src/src/components/page/MyPage/UserStatsCards.tsx`
  - `src/src/components/page/MyPage/MyPageTabs.tsx`
  - `src/src/components/page/MyPage/ProblemsList.tsx`
  - `src/src/components/page/MyPage/ProblemRow.tsx`
  - `src/src/components/page/MyPage/ProfileEditForm.tsx`
  - `src/src/components/page/MyPage/WalletCard.tsx`（Phase2）
  - `src/src/components/page/MyPage/NotificationList.tsx`

## Sources
- `../overview/requirements.md`
- `../implementation/service-health/README.md`
- `src/src/services/api/gateway.ts`
