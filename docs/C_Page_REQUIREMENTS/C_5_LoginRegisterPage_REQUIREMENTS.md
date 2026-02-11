# C_5 Login/Register Page REQUIREMENTS

## 機能要件
- 認証
  - OIDC/PKCE ログイン導線（Google/Microsoft/大学メール）。.ac.jp ドメインバリデーション（学生向け）
  - 未認証時は全ページをガードし、ログインページへリダイレクト
- 初回プロフィール設定（ProfileSetup）
  - ユーザー名、大学、学部、分野（理系/文系）
  - 予測変換/サジェスト（理想要件）: 大学/学部/科目/教授、読み（かな/ローマ字/英語）
- UI（要件レイアウト）
  - Login: プロバイダ別ボタン（ログイン/新規登録）
  - ProfileSetup: 入力フォーム + 「保存して開始」
- データ供給
  - 要件: マスタは API から取得（`/universities`, `/faculties` 等）
  - 現状: マスタ API が未整備の場合があるため、段階的にモック/固定値で補完しつつ、`Z_REFACTOR_REQUIREMENTS.md` で追随タスク化

## 非機能要件
- セキュリティ: LocalStorage にアクセストークンを保存しない。セッション管理はバックエンドに委譲。
- i18n。失敗時は Alert + Toast。

## 画面/コンポーネント配置
- tsx:
  - 現状: `src/components/LoginPage.tsx`, `src/components/ProfileSetupPage.tsx`
  - 目標: `src/src/pages/LoginRegisterPage.tsx`（統合ページ）
- 共通: PageHeader, Form components, ContextHealthAlert (auth outage 時)。

## ワイヤーフレーム（案）
```text
┌──────────────────────────────────────────────────────────────┐
│ (Auth pages: TopMenuBar は非表示)                             │
├──────────────────────────────────────────────────────────────┤
│ Centered Auth Card                                            │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Logo / Eduanima                                           │ │
│  │ ContextHealthAlert (auth outage/maintenance)              │ │
│  │                                                         │ │
│  │ [Googleでログイン]                                        │ │
│  │ [Microsoftでログイン]                                     │ │
│  │ [大学メールでログイン]                                     │ │
│  │                                                         │ │
│  │ (新規ユーザー) ProfileSetupForm                           │ │
│  │  username / university / faculty / field                 │ │
│  │  [保存して開始]                                           │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## ブロック → コンポーネント分割（案）
- Layout: `LoginRegisterPage/AuthLayout.tsx`（centered）
- Provider buttons: `LoginRegisterPage/AuthProviderButtons.tsx`
- Domain validation: `LoginRegisterPage/AcademicDomainHint.tsx`
- Profile setup: `LoginRegisterPage/ProfileSetupForm.tsx`（Autocomplete を内包）
- Alerts: `Common/ContextHealthAlert.tsx`

## Sources
- `../overview/requirements.md`, `../overview/use-cases.md`
- `../architecture/eduanima_architecture.md`（OIDC/PKCE 前提）
