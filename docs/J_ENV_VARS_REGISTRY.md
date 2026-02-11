# 環境変数レジストリ（Frontend）

CI には最小限、Prod 用の機密は Secret Manager で管理。`VITE_API_BASE_URL` 未設定はビルド失敗にする。

## 1. アプリ動作・API
| 変数名 | Local (.env) | CI | Prod | Secret | 説明 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://localhost:9000` | 必須 | `https://gateway.eduanima.app` | No | API Gateway ベースURL |
| `VITE_APP_ENV` | `local` | `ci` | `production` | No | 環境識別 |
| `VITE_SENTRY_DSN` | (任意) | (任意) | sm://`sentry-dsn` | Yes | エラー送信用 |
| `VITE_ENABLE_MSW` | `true/false` | `false` | `false` | No | MSW を起動する（DEV のみ有効化。PROD では絶対に起動しない） |
| `VITE_USE_MOCK_DATA` | `DEPRECATED` | `DEPRECATED` | `DEPRECATED` | No | 廃止フラグ（未使用）。モックは MSW に一本化済みのため設定不要。将来のクリーンアップで削除予定。 |
| `VITE_ENABLE_WALLET` | `false` | `false` | `true/false` | No | Wallet 機能フラグ |
| `VITE_ENABLE_SOCIAL` | `false` | `false` | `true/false` | No | Social 機能フラグ |
| `VITE_ENABLE_ADS` | `false` | `false` | `true/false` | No | 広告/収益機能フラグ |
| `VITE_STATUS_PAGE_URL` | (任意) | (任意) | `https://status.eduanima...` | No | ヘルス障害時の遷移先（任意） |

## 2. ヘルス/ポーリング
| 変数名 | Local | CI | Prod | 説明 |
| :--- | :--- | :--- | :--- | :--- |
| `VITE_HEALTH_POLL_MS` | `60000` | `60000` | `60000` | `/health/<service>` ポーリング間隔 |

## 運用ガイド
- Local: `.env.local` に上記を記載。API 未提供のときは `VITE_ENABLE_*` を false にし Coming Soon で表示。
- CI: Secrets は GitHub Secrets に限定。`VITE_API_BASE_URL` を必ず設定し、実 API を叩く or モックを明示。
- Prod: Secrets は Secret Manager で注入。Feature Flag はデプロイパイプラインで切替。GitHub Secrets に本番キーを置かない。

### 既存実装の注意（暫定）
- MSW 一本化により `VITE_USE_MOCK_DATA` は使用しない（互換のため残存しているが将来削除予定）。
- Refactor v2 では「内部モックフォールバック」を撤去し、**MSW（`VITE_ENABLE_MSW`）で通信レイヤをモック**する方式へ移行する（UI/本番コードは変更しない）。
- `VITE_ENABLE_MSW=true` のときは内部モック判定（`USE_MOCK_DATA`）を強制的に無効化し、MSW のみを有効化する（ローカル環境でも二重モックを防ぐ）。※ 現在 `USE_MOCK_DATA` は常時 `false` 固定。
