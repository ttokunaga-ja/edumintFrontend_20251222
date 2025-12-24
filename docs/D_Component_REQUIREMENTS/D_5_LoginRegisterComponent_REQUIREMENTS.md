# D_5 Login/Register Component REQUIREMENTS

## スコープ
- LoginRegisterPage の UI/フォーム
  - AuthLayout（センターカード/背景）
  - AuthProviderButtons（Google/Microsoft/大学SSO）
  - AcademicDomainHint（.ac.jp 説明/検証メッセージ）
  - ProfileSetupForm（初回ユーザー必須のプロフィール入力）
- 認証ページは TopMenuBar を表示しない（例外ルール）。

## 機能要件
- 認証導線（要件）
  - OIDC/PKCE によるログイン/登録（プロバイダボタンから開始）。
  - .ac.jp ドメイン要件の提示（大学SSO/大学メール利用時）。
- 初回プロフィール設定（ProfileSetup）
  - 必須: username / university / faculty / fieldType（理系/文系）
  - 入力補助: Autocomplete（大学/学部）※マスタ API 未整備の場合はモック/固定値で段階対応
- Guard
  - 未認証時は保護ページから `/login`（または `/login-register`）へリダイレクト。
  - 認証済みで Profile 未完了の場合は ProfileSetup を優先表示（同一ページ内の state で切替）。
- Health
  - `/health/summary` を一次情報として、認証/プロフィール保存に関わる CTA を disable（outage|maintenance）。
  - 実装規約: UI コンポーネントは `services/api/*` を直接 import しない。`features/auth` / `features/user` の hook/repository 経由で呼ぶ。

## API（要件/設計: 追加・統合予定）
- Auth / Session（未実装の可能性あり: `D_INTERFACE_SPEC.md` と同期）
  - `POST /auth/login`, `POST /auth/token`
  - `GET /profiles/me`
- Profile
  - `GET /user/profile`, `PATCH /user/profile`

## 非機能要件
- セキュリティ
  - SPA 側でアクセストークンを LocalStorage 永続化しない（実装方式はバックエンド契約に従う）。
- i18n（辞書化）。入力エラーは inline + Toast。
- アクセシビリティ: ボタン/フォームの tab order、ARIA。

## ファイル構成（提案）
- page: `src/src/pages/LoginRegisterPage.tsx`
- components:
  - `src/src/components/page/LoginRegisterPage/AuthLayout.tsx`
  - `src/src/components/page/LoginRegisterPage/AuthProviderButtons.tsx`
  - `src/src/components/page/LoginRegisterPage/AcademicDomainHint.tsx`
  - `src/src/components/page/LoginRegisterPage/ProfileSetupForm.tsx`
  - `src/src/components/page/LoginRegisterPage/ProfileSetupFieldGroup.tsx`（任意: 分割）

## Sources
- `C_5_LoginRegisterPage_REQUIREMENTS.md`
- `../overview/requirements.md`, `../overview/use-cases.md`
- `../architecture/edumint_architecture.md`（OIDC/PKCE 前提）
