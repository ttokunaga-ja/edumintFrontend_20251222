# C_4 MyPage REQUIREMENTS

## 機能要件
- 画面構成
  - プロフィールカード + UserStatsCards（投稿数/閲覧数/高評価/コメント等）
  - タブ: 投稿/いいね/コメント/通知/ウォレット（Phase2）
  - ServiceHealthSummary を表示（全サービスの状態を一覧）
- API（現状実装: `src/src/services/api/gateway.ts`）
  - Profile: `GET /user/profile`, `PATCH /user/profile`
  - Stats: `GET /user/stats`
  - Lists:
    - `GET /user/{userId}/problems?page=&limit=`
    - `GET /user/{userId}/liked?page=&limit=`
    - `GET /user/{userId}/commented?page=&limit=` （Phase 2: eduanimaSocial）
  - Notifications:
    - `GET /notifications?limit=`, `POST /notifications/read-all`, `DELETE /notifications/{id}`
  - Wallet:
    - `GET /wallet/balance`, `POST /wallet/withdraw`
- Health/Flag
  - Wallet は Phase2: `VITE_ENABLE_WALLET`（計画） + `GET /health/wallet` が operational で解放、未提供時は Coming Soon
  - Notifications: `GET /health/notifications` outage|maintenance で CTA disable
- モック（暫定）
  - `src/src/services/api/gateway.ts` は `VITE_API_BASE_URL` が localhost の場合にモックへ分岐

## 非機能要件
- TTI p75 < 3.0s。ウォレット API 未接続時は必ず disable。
- i18n、Toast+Alert で失敗通知。

## 画面/コンポーネント配置
- tsx:
  - 現状: `src/components/MyPage.tsx`
  - 目標: `src/src/pages/MyPage.tsx`（FIGMA版へ移行）
- 画面専用: ウォレットカードの囲い、通知一覧ラッパ。
- 共通: PageHeader, ServiceHealthSummary, Pagination, EmptyState, UserStatsCards, ProfileEditForm。

## ワイヤーフレーム（案）
```text
┌──────────────────────────────────────────────────────────────┐
│ TopMenuBar                                                   │
├──────────────────────────────────────────────────────────────┤
│ PageHeader: マイページ                                       │
├──────────────────────────────────────────────────────────────┤
│ ServiceHealthSummary (always)                                │
├──────────────────────────────────────────────────────────────┤
│ ProfileCard (avatar / username / university / field)         │
│ UserStatsCards (投稿数 / 閲覧数 / 高評価 / コメント)            │
├──────────────────────────────────────────────────────────────┤
│ Tabs: [投稿] [いいね] [コメント] [通知] [ウォレット]             │
├──────────────────────────────────────────────────────────────┤
│ TabContent                                                   │
│  - List (ProblemCardRow) + filters + sort                    │
│  - Pagination                                                │
│  - (通知) NotificationList                                   │
│  - (Wallet) WalletCard + WithdrawalDialog (Phase2)           │
└──────────────────────────────────────────────────────────────┘
```

## ブロック → コンポーネント分割（案）
- Header: `Common/TopMenuBar.tsx`, `Common/PageHeader.tsx`
- Health: `Common/ServiceHealthSummary.tsx`
- Profile/Stats: `MyPage/ProfileCard.tsx`, `MyPage/UserStatsCards.tsx`, `MyPage/ProfileEditForm.tsx`
- Tabs: `MyPage/MyPageTabs.tsx`
- Lists: `MyPage/ProblemList.tsx`, `MyPage/ProblemRowCard.tsx`, `Common/Pagination.tsx`, `Common/EmptyState.tsx`
- Notifications: `MyPage/NotificationList.tsx`, `MyPage/NotificationItem.tsx`
- Wallet (Phase2): `MyPage/WalletCard.tsx`, `MyPage/WithdrawalDialog.tsx`

## Sources
- `../overview/requirements.md`, `../overview/use-cases.md`
- `../implementation/service-health/README.md`
- `src/src/services/api/gateway.ts`
