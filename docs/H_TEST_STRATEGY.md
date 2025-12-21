# テスト戦略・カバレッジ基準（Frontend）

```markdown
- Unit: Vitest + RTL で hooks/logic をテスト。API コールは MSW（`src/src/mocks/server.ts`）でモックし、ネットワーク依存を排除する。
- Storybook: UI バリアント検証と Visual Regression（主要ページ/コンポーネント）。必要に応じて MSW addon で handler を適用する。
- E2E (optional later): Playwright で submit/search/health CTA フローを確認。
- Coverage目標: statements 80%、クリティカルフロー（submit/search/health disable）は 100%。
- Snapshot乱用禁止。UI は Storybook とロジックは RTL で検証。
- Naming: should_render_<state>, handles_<error>_gracefully など振る舞い基準。
```

## Manual QA（リリース前チェック）
- 基本チェックリスト: `../qa/README.md`（認証/検索/生成/閲覧/ヘルス/マイページ）
- ヘルス連動: `outage|maintenance` で CTA 無効化、`degraded` で警告表示（CTAは原則有効）
- 生成フロー: アップロード失敗→再試行、ポーリング停止/再開、完了時遷移
- 広告/ロック: 未登録/初回/投稿者での表示差分（UCに沿って確認）

## バグレポート
- テンプレート: `../qa/README.md` の「5.1 バグレポートテンプレート」
- API 系は `traceId/requestId` を併記（`I_ERROR_LOG_STANDARD.md`）

## Sources
- `../qa/README.md`
- `../implementation/service-health/README.md`
