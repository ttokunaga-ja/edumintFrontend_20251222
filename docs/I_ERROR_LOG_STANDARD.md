# エラーハンドリング & ログ出力標準（Frontend）

```json
{
  "userMessage": "検索サービスが一時的に利用できません。しばらく待って再試行してください。",
  "internal": {
    "code": "search_unavailable",
    "httpStatus": 503,
    "traceId": "req-12345",
    "service": "search"
  }
}
```

- UI 表示: Toast（短文）＋ Alert コンポーネント（理由と再試行手順）。CTA は disable で誤操作防止。
- ログ: `logger.error({ level, msg, traceId, service, url, status })` を使用。`console.log` 禁止（dev除く）。
- ヘルス連動: `/health/<service>` が outage の場合は API を呼ばずに即時 Alert + disable。
- リトライ: fetch 失敗時は 1 回まで指数バックオフ。連続失敗時はエラー画面へ遷移しない（モーダル/Alert で留める）。

## エラー分類（推奨）
- `validation_error`: 入力不備（フォーム/クエリ）
- `network_error`: オフライン/接続断
- `timeout`: タイムアウト（retry対象）
- `service_unavailable`: 503/ヘルス outage（retryせず disable）
- `unexpected`: 想定外（Sentry送信対象）

## ログ必須フィールド（推奨）
- `traceId` / `requestId`（あれば必ず）
- `service`（search/content/community/notifications/wallet/aiGenerator/auth）
- `url`, `method`, `status`
- `code`（アプリ内コード。UIメッセージと分離）

## Sources
- `../implementation/service-health/README.md`
- `../qa/README.md`（バグレポートに traceId を添付）
