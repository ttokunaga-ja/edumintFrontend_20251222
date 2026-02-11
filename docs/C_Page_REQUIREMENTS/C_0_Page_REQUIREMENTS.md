# 要件定義書（Frontend Functional / Non-Functional）

## 機能要件 (FR)

```yaml
FR-AUTH-001:
  summary: SSO/OIDC/PKCE ログイン（Google/Microsoft/大学）
  pages: [C_5]
  health: [auth]
  gateway:
    - POST /auth/login
    - POST /auth/token
    - GET /profiles/me
  errors:
    - invalid_domain (.ac.jp バリデーション)
    - auth_unavailable (health!=operational → CTA disable + Alert)

FR-AUTH-002:
  summary: 初回プロフィール設定（大学/学部/分野/ユーザー名）
  pages: [C_5]
  gateway:
    - GET /universities (suggest)
    - GET /faculties (by university)
    - GET /subjects (suggest)
    - PATCH /profiles/me
  errors:
    - validation_error
    - profile_save_failed (toast + retry)

FR-SEARCH-001:
  summary: 試験/問題の検索（キーワード + フィルター + ソート）
  pages: [C_1]
  components: [D_1]
  health: [search]
  gateway:
    - GET /search/exams
  errors:
    - search_unavailable (health!=operational → 入力/CTA disable + Alert A/B)
    - timeout (retry 1回 + notify)

FR-SEARCH-002:
  summary: マスタ/予測変換（大学/学部/科目/教授/読みサジェスト）
  pages: [C_1, C_5]
  gateway:
    - GET /universities
    - GET /faculties
    - GET /subjects
    - GET /teachers
    - GET /search/readings

FR-SEARCH-003:
  summary: 詳細検索パネル（折りたたみ + 既定は非表示）
  pages: [C_1]
  components: [D_1]
  requirements:
    - フィルターは SearchFilters 型で一元化
    - フィルター指定時は自動展開（実装指針）

FR-SEARCH-005:
  summary: おすすめ/検索結果一覧 + ページネーション
  pages: [C_1]
  components: [D_1]
  gateway:
    - GET /search/exams?page=

FR-VIEW-001:
  summary: 問題閲覧（構造/問題/解答/履歴）
  pages: [C_3]
  components: [D_3]
  health: [content]
  gateway:
    - GET /exams/{id}
  errors:
    - content_unavailable (toast + Alert)

FR-VIEW-002:
  summary: 広告/ロック制御（初回閲覧、投稿者免除）
  pages: [C_3]
  requirements:
    - 未登録/未広告視聴ユーザーは段階開示（構造→問題→解答）

FR-VIEW-004:
  summary: メタデータ + アクション（ブックマーク/共有/PDF/通報）
  pages: [C_3]
  gateway:
    - POST /exams/{id}/bookmark
    - POST /exams/{id}/share
    - POST /reports

FR-SUBMIT-001:
  summary: ファイルアップロード（署名URL→S3→完了通知）
  pages: [C_2]
  components: [D_2]
  health: [file, content]
  gateway:
    - POST /files/upload-job
    - POST /files/upload-complete
  errors:
    - upload_failed (失敗ファイルのみ再送)
    - signed_url_expired (再取得)

FR-SUBMIT-002:
  summary: 構造確認（AI解析結果の確認/修正）
  pages: [C_2]
  health: [content, aiGenerator]
  gateway:
    - PATCH /exams/{id}/structure

FR-SUBMIT-003:
  summary: 生成ジョブ（queued/processing/paused/completed/error）
  pages: [C_7]
  health: [aiGenerator]
  gateway:
    - POST /generation/start
    - GET /generation/status/{jobId}
    - POST /generation/{cancel|resume|retry}/{jobId}

FR-MANAGE-001:
  summary: 編集機能（現状: 非動作 → 修正必須）
  pages: [C_3]
  gateway:
    - PATCH /exams/{id}

FR-INTERACT-001:
  summary: いいね/コメント（Phase2以降、ヘルス連動）
  pages: [C_3]
  health: [social, notifications]
  gateway:
    - POST /comments （Phase 2: eduanimaSocial）
    - POST /comments/{id}/vote （Phase 2: eduanimaSocial）
    - POST /exams/{id}/like

FR-MYPAGE-001:
  summary: マイページ（投稿/いいね/コメント/通知/ウォレット）
  pages: [C_4]
  components: [D_4]
  health: [wallet, notifications]
  gateway:
    - GET /user/stats
    - GET /notifications
    - GET /wallet/balance
```

## 非機能要件 (NFR)

```yaml
NFR-PERF-001:
  summary: レンダリング速度
  targets:
    - Home TTI p75 < 2.5s (mid-tier)
    - ProblemView TTI p75 < 3.0s (mid-tier)
NFR-PERF-002:
  summary: API/ポーリング負荷
  targets:
    - /health ポーリングは既定 60s、バックグラウンド時停止
NFR-UX-001:
  summary: レスポンシブ
  requirements:
    - md(768px) を境にメニュー/検索バー配置を切替
    - タッチターゲット最小 44x44
NFR-UX-002:
  summary: アクセシビリティ
  requirements:
    - aria-label/フォーカスリング/キーボード操作
NFR-UX-003:
  summary: 多言語対応
  requirements:
    - 新規文言は辞書化（ja/en）。ハードコード禁止
NFR-SEC-001:
  summary: 認証/セッション
  requirements:
    - OIDC/PKCE 前提
    - LocalStorage にアクセストークンを保存しない（機微データ禁止）
NFR-SEC-002:
  summary: データ保護
  requirements:
    - ログに PII/トークンを出さない
NFR-MAIN-001:
  summary: 依存方向と責務分離
  requirements:
    - pages -> components -> features -> services/api -> shared/utils, types（features に UI を置かない）
NFR-MAIN-002:
  summary: 型安全性
  requirements:
    - Gateway レスポンスは Zod/TS で検証し、欠損時も UI が落ちない
NFR-OPS-001:
  summary: サービスヘルス連動
  requirements:
    - operational の CTA 有効化率 100%
    - outage/maintenance の CTA 無効化率 100%（呼び出し自体を抑止）
```

## ページ/コンポーネント別要件ドキュメントへの分割
- ページ: `C_1_HomePage_REQUIREMENTS.md`, `C_2_CreatePage_REQUIREMENTS.md`（ProblemCreate: Submit+StructureConfirm+Generating 統合）, `C_3_ProblemViewEditPage_REQUIREMENTS.md`（編集機能は現在非動作→必須修正を明記）, `C_4_MyPage_REQUIREMENTS.md`, `C_5_LoginRegisterPage_REQUIREMENTS.md`。提案追加: `C_6_AdminModerationPage_REQUIREMENTS.md`, `C_7_GeneratingPage_REQUIREMENTS.md`（ProblemCreate の統合ステップ要件）。
- コンポーネント: `D_0_CommonComponent_REQUIREMENTS.md`, `D_1_HomeSearchComponent_REQUIREMENTS.md`, `D_2_ProblemSubmitComponent_REQUIREMENTS.md`（ProblemCreate）, `D_3_ProblemViewEditComponent_REQUIREMENTS.md`, `D_4_MyPageComponent_REQUIREMENTS.md`, `D_5_LoginRegisterComponent_REQUIREMENTS.md`, `D_6_AdminModerationComponent_REQUIREMENTS.md`.
- 編集機能の現状: ProblemView の編集が動作していないため、`C_3_ProblemViewEditPage_REQUIREMENTS.md` / `D_3_ProblemViewEditComponent_REQUIREMENTS.md` に修正要件を必須で記載。
- 実装指針: 各ページごとに tsx を作成し、内部ブロックは「共通コンポーネント vs 画面専用コンポーネント」を分離。再利用が確認できたら共通側にファイル移動で複数画面へ展開。

## レイヤー規格（z-indexと重なり順の統一ルール）
- 目的: トップバーより前面に通常コンテンツがかぶる等の不具合を防ぎ、全ページで一貫した重なり順を維持する。
- スケール定義:
  - 900台: グローバルオーバーレイ層（999: モーダル最前面、950: ドロワー/全画面メニュー、930: Toast/ポップアップ）
  - 800台: ナビ層（899: TopMenuBar、850: サブナビ/固定タブ）
  - 700台: ページ上位コンテナ（750: ページ固有ヘッダー/ステップバー）
  - 600台: 固定補助（650: 固定サイド/追従カード）
  - 500台: 通常コンテンツ（カード/フォーム。原則 z-index 指定なし）
  - 400台: 背景演出（装飾用のみ）
- 運用ルール:
  - z-index は必要最小限。レイヤー種別に合わせ固定値を使い、props で自由な値を受け取らない。
  - ドロップダウン/ツールチップ/ポップオーバーはポータルルートで z-930 に統一。
  - モーダル/ドロワーは Overlay z-950、Content z-999 の固定パターンを採用。
  - TopMenuBar は常に z-899、ページ固有ヘッダー/進捗バーは z-750 以内、通常カードは z 指定なし。
  - transform/filter/backdrop-filter による不要なスタッキングコンテキスト生成を避ける。
  - 新規コンポーネントが z-index を要する場合、上記スケールから選び、レビュー時に種別を明記する。

## Sources
- `../overview/requirements.md`, `../overview/ideal-requirements.md`, `../overview/current_implementation.md`
- `../overview/use-cases.md`, `../overview/refactor-priorities.md`
- `../architecture/eduanima_architecture.md`
- `../implementation/pages/home-page.md`, `../implementation/features/file-upload.md`, `../implementation/service-health/README.md`
