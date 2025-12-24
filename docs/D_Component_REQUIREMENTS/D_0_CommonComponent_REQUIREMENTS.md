# D_0 Common Component REQUIREMENTS

## スコープ
- 全ページ共通の UI（必要最小の状態は OK、外部通信は hook/repository に委譲）
  - TopMenuBar（検索バー/通知/ユーザーメニュー/ハンバーガー）
  - PageHeader
  - ServiceHealthBar（全体バナー）, ContextHealthAlert（局所アラート）, ServiceHealthSummary（MyPage）
  - Pagination, EmptyState, Toast
  - FileUploadQueue / JobStatusRibbon（Submit/Generating でも共通利用）
  - FeatureFlag / ServiceHealth hooks
- モック利用（暫定）: 現状 `src/src/services/api/gateway.ts` は `VITE_API_BASE_URL` が `localhost` の場合にモック動作へ分岐する。

## 機能要件
- TopMenuBar
  - Desktop: ロゴ + 検索バー + 通知 + ユーザーメニュー
  - Mobile: 検索バーは下段、ナビはハンバーガー（44pxタッチターゲット）
  - 通知: `GET /notifications/unread-count` を利用し未読バッジを表示（`/health/notifications` outage で無効化）
  - 実装規約: TopMenuBar 自体は `services/api/*` を直接 import しない。通知取得/既読化などは `features/notifications/*`（または `hooks/*`）へ寄せ、TopMenuBar は hook を呼ぶか props で受け取る。
  - 参照: `../implementation/pages/topbar.md`, `../implementation/features/hamburger-menu.md`
- ServiceHealth
  - `GET /health/summary` を 60s ポーリング（バックグラウンド時停止）
  - `GET /health/{service}`（content/community/notifications/search/wallet）を必要箇所で利用可
  - `outage|maintenance` は CTA 無効化（API呼び出し抑止）、`degraded` は警告表示（CTAは原則有効）
  - `shouldDisableCTA(['serviceA','serviceB'])` は OR 判定
  - 参照: `../implementation/service-health/README.md`
- FeatureFlag（計画）
  - `VITE_ENABLE_<FEATURE>` が false の機能は Coming Soon（UI表示は残し CTA disable）
  - ヘルスが outage の場合はフラグより優先して disable
- FileUploadQueue
  - 4状態管理、失敗のみ再送。アップロード失敗時にエラー表示
  - 署名URL取得 `POST /files/upload-job` → 直接 PUT → 完了通知 `POST /files/upload-complete`
- JobStatusRibbon
  - `POST /generation/{cancel|resume|retry}/{jobId}` を呼び、`GET /generation/status/{jobId}` の状態変化を UI へ反映
  - 実装規約: リクエストは `features/generation/*`（hook/repository）から行い、UI は handler を受け取る。

## 非機能要件
- 依存方向: 共通→(features/components) への逆参照禁止。
- パフォーマンス: ヘルス/フラグ評価は 200ms 以内。
- 観測性: エラーは logger + Toast + Alert。i18n 必須。

## ファイル構成（提案）
- components:
  - `src/src/components/common/TopMenuBar.tsx`
  - `src/src/components/common/ServiceHealthBar.tsx`
  - `src/src/components/common/ContextHealthAlert.tsx`
  - `src/src/components/common/PageHeader.tsx`
  - `src/src/components/common/ConfirmDialog.tsx`
  - `src/src/components/common/Pagination.tsx`
  - `src/src/components/common/EmptyState.tsx`
  - `src/src/components/common/ToastProvider.tsx`（sonner など）
  - `src/src/components/common/FooterActionBar.tsx`（wizard 共通）
  - `src/src/components/common/FileUploadQueue.tsx`
  - `src/src/components/common/JobStatusRibbon.tsx`
  - `src/src/components/common/GenerationStatusTimeline.tsx`
  - `src/src/components/common/MultilingualAutocomplete.tsx`

## Sources
- `../implementation/pages/topbar.md`, `../implementation/features/hamburger-menu.md`
- `../implementation/service-health/README.md`
- `../implementation/features/file-upload.md`
- `src/src/services/api/gateway.ts`
