# 運用・デプロイ仕様（Frontend 概要）

- Docker: Node 20 builder → Nginx runtime、非 root 実行、静的 `/health` を提供。詳細は `K_DOCKERFILE_POLICY.md`。
- CI/CD: Lint → TypeCheck → Test → Security → Build → Docker → Deploy（GitHub Actions/ArgoCD）。詳細は `L_CICD_SPEC.md`。
- 環境変数: `.env.example` を最新化し、`VITE_API_BASE_URL` 未設定ならビルド失敗。Feature Flag は `VITE_ENABLE_<FEATURE>`。
- Feature Flag/ヘルス連動: `/health/<service>` をポーリングし、outage の CTA は無効化＋Coming Soon 表示。ヘルスはバックエンドが更新、フロントは即時反映。
- 監視/ログ: フロントは Sentry（導入後）と構造化コンソールログ（devのみ）。デプロイ後は Lighthouse/Synthetics で TTI をモニタリング。

## Sources
- `../architecture/edumint_architecture.md`
- `../services/search-service/operational-readiness.md`（運用観点の参考）
