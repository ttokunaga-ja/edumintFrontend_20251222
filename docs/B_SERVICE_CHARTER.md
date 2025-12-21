# Frontend Service Charter（AI Coding 用）

目的: EduMint フロントエンドの責務・非責務を一枚で定義し、バックエンド未完成期間も「Coming Soon」運用で逸脱なく進める。

```markdown
サービス名: EduMint Frontend (React + Vite)
ビジネス目的: 問題投稿/検索/閲覧/生成フローを FIGMA 準拠 UI で提供し、バックエンドのフェーズ進行に合わせて段階解放する
対象ユーザー: 学生・教員（.ac.jp）、運営チーム（管理UIは Phase3 以降）
責務 (Must):
  - HomeSearch/ProblemViewEdit/ProblemCreate（Generating統合）/MyPage/LoginRegister の FIGMA 版 UI を実装し、ServiceHealth と Feature Flag で CTA を制御する
  - API Gateway 経由の実データを優先し、未接続領域は Coming Soon 表示 + CTA disable で明示
  - SSO (OIDC/PKCE) フローを導線に組み込み、未認証時のガードを実装
  - アラート/トースト/エラーハンドリングを統一（Gateway 共通ハンドラ）
  - `/health/<service>` の状態でフォーム/CTA を無効化し、ユーザーに理由を提示
非責務 (Must Not):
  - ビジネスロジック（問題生成/検索ランキング/ウォレット計算）の決定
  - モックデータを本番経路に残置すること
  - バックエンド契約を無視したフィールド拡張や書き込み
成功条件 (SLO/SLI 概要):
  - TTI: p75 < 2.5s (Home), CSR レンダー p95 < 3.5s @ mid-tier device
  - 重大操作エラーハンドリング率: 99% (ユーザーに意味のあるメッセージを返せた割合)
  - UI 一貫性: FIGMA コンポーネント利用率 95%以上、Legacy UI の残存ページ 0
  - 機能可用性: operational サービスの CTA 有効化率 100%、outage サービスの CTA 無効化率 100%
```

## Sources
- `../overview/requirements.md`, `../overview/use-cases.md`
- `../architecture/edumint_architecture.md`
