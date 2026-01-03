# リファクタリング・タスクフェーズ

効率的かつ手戻りのない移行を行うため、以下の順序でタスクを実行する。

## Phase 0: 準備とクリーンアップ (Destruction)
- [ ] Tailwind 関連パッケージのアンインストールおよび設定ファイルの削除。
- [ ] `src/components/primitives/` の全削除。
- [ ] `src/services/api/gateway` 関連ファイルの削除。
- [ ] `src/shared/utils` の削除（必要なものは `src/lib` へ移行準備）。

## Phase 1: 基盤の実装 (Foundation)
- [ ] **Config**: `src/lib/` を作成し、`axios.ts` (Interceptor設定), `query-client.ts`, `i18n.ts`, `dayjs.ts` を実装。
- [ ] **Theme**: `src/theme/` を作成し、MUI v6 の `createTheme` 設定、`AppProviders.tsx` での適用。
- [ ] **App Structure**: `src/app/` を作成し、`main.tsx`, `App.tsx`, `router.tsx` を移動・修正。React Router v7 + Vite 設定の整合性確認。
- [ ] **I18n**: `public/locales/` に初期翻訳ファイルを作成。

## Phase 2: Features (Logic & State)
各ドメインの `features/` ディレクトリを整備し、API通信と型定義を実装する。
*UIの実装は行わず、HooksとTypesのみを整備する。*

- [ ] **Auth**: `src/features/auth/hooks/useAuth.ts` (Login/Logout/Session)。
- [ ] **User**: `src/features/user/hooks` (Profile, Wallet)。
- [ ] **Content**: `src/features/content/hooks` (Problem CRUD via TanStack Query)。
- [ ] **Generation**: `src/features/generation/stores` (Zustand) と Hooks。

## Phase 3: Components (Pure UI Migration)
MUI コンポーネントを使用し、旧 `primitives` 依存を排除して書き直す。

- [ ] **Common**: `src/components/common/` (Header, Footer, Layout) の再実装。
- [ ] **ProblemTypes**: `src/components/problemTypes/` (Cloze, Choice等のView/Edit) を MUI 化。
- [ ] **Page Components**: `src/components/page/` 配下のコンポーネントを修正。

## Phase 4: Pages & Integration (Entry Points)
`src/pages/` を再構築し、Features Hooks と Components を結合する。

- [ ] **LoginRegisterPage**: `useAuth` フックとフォームコンポーネントの結合。
- [ ] **HomePage**: 検索Hooksと `SearchSection` の結合。
- [ ] **MyPage**: `useUser` フックと表示コンポーネントの結合。
- [ ] **ProblemCreatePage**: `Controller` パターンの適用と Generating フローの統合。
- [x] **ProblemViewEditPage**: 統合作業は終了し、関連ファイルは移動・削除済み（参照はアーカイブに記録）。

## Phase 5: Final Cleanup & Verification
- [ ] 未使用ファイル、空ディレクトリの削除。
- [ ] `eslint` / `tsc` チェックの実行と修正。
- [ ] `vitest` の実行（最低限の単体テスト通過）。
- [ ] アプリケーション起動確認。