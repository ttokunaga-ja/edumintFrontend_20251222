### 技術スタック・ライブラリ制約書（Frontend） [更新版]

```yaml
Language:
  - TypeScript: ">=5.7" # 最新の型推論とパフォーマンス向上への追従
  - Style: eslint (Flat Config) + prettier (no semi, double quotes)
Framework:
  - React 19 + Vite 6 # Vite 6 が最新安定版。React 19 の新機能（Actions, Compiler）への対応
Styling:
  - **Tailwind の全面撤廃を採用**。既存クラスは段階的に削除し、MUI Theme / Design Tokens (sx prop) に統一。
  - **MUI v6 (Material UI) + Emotion** をスタンダードなスタイリング基盤とする。
    - 理由: MUI v6 は React 19 を正式サポートしており、将来的に Zero-runtime (Pigment CSS) への移行パスも存在するが、現行資産との互換性と安定性を重視し Emotion エンジンを採用する。
  - ガイドライン: `sx` prop および `styled()` API を使用し、Theme (colors, typography, spacing) から値を参照すること。ハードコードされた HEX 値や px 指定は原則禁止。
UI Component Library:
  - **MUI v6 (Core + Lab)** を公式採用。
  - Icons: `@mui/icons-material` に統一。Lucide 等の他ライブラリはバンドルサイズ肥大化防止のため新規利用禁止し、既存箇所も順次置換する。
  - Date/Time: `@mui/x-date-pickers` + `dayjs` (軽量性重視)。
State/Data Management:
  - **Server State**: **TanStack Query v5** (必須)。
    - 禁止: `useEffect` 内での直接的なデータフェッチ、独自フラグによる Loading/Error 管理。
    - 構成: `services/api/gateway.ts` を QueryFn として使用する。
  - **Client State**: React Context + Hooks (グローバルなUI状態のみ)。
  - **Form State**: **React Hook Form** + `@hookform/resolvers` (Zod連携)。
    - 禁止: 複雑なフォームにおける `useState` による手動管理。
  - 禁止: Redux 新規導入。
Routing:
  - React Router v7 (or TanStack Router if type-safety is prioritized)
  - React 19 のトランジションAPIと親和性の高いルーティング設計を行う。
API:
  - Fetch wrapper via `services/api/gateway.ts` (Axios ではなくネイティブ fetch を推奨するが、既存ラッパーがある場合はその利用を強制)
  - 必須: Response validation (Zod) before render via Zod Schema.
Validation:
  - Zod (APIレスポンス / フォームバリデーション共通化)
Rendering & Formatting:
  - Markdown: `react-markdown` (remark/rehype エコシステム推奨。markdown-it より React コンポーネントとしての統合が容易)
  - Math: KaTeX (`react-latex-next` 等のラッパー利用)
Animation:
  - `motion/react` (旧 framer-motion。React 19 対応の最新パッケージ名)。
  - 統一基準: 基本トランジション 200-300ms, easing は MUI Theme の定数を利用。
File Upload:
  - `react-dropzone` (UI) + `tanstack-query` (Mutation によるアップロード状態管理)
Testing:
  - Unit/Integration: Vitest + React Testing Library
  - E2E: Playwright (Cypress より高速で、Vite との親和性が高いため推奨)
  - Storybook: 8+ (React 19 / Vite 6 対応版)
  - Coverage target: statements 80% / critical flows 100%
Observability:
  - Console log禁止 (本番)。
  - Error Boundary: `react-error-boundary` を使用し、予期せぬエラーを Sentry 等へ送信。
Build/Bundle:
  - npm (npm ci)
  - 禁止: Yarn/pnpm 追加（ロックファイル競合防止）
Internationalization:
  - `i18next` + `react-i18next` (業界標準。独自 util よりもライブラリのエコシステムを活用することを強く推奨)
Feature Flag:
  - `VITE_ENABLE_<FEATURE>` で制御。
Service Health:
  - `/health/<service>` 連携必須。TanStack Query の `useQuery` でポーリングまたはステータスチェックを行う。
Accessibility:
  - keyboard focus / aria-label / color contrast 4.5:1
  - Linting: `eslint-plugin-jsx-a11y` を必須化し、CI で自動チェックする。
```

---

### 変更点とベストプラクティスに基づく解説

#### 1. MUI v5 → **MUI v6**
*   **理由:** 2025年現在、React 19 を利用する場合、MUI v5 はレガシーになりつつあります。MUI v6 は React 19 の変更（Context API の変更や Ref の扱いなど）に完全対応しており、CSS 変数の扱いが改善されているため、パフォーマンスと開発体験が向上しています。
*   **競合排除:** Tailwind を撤廃する場合、MUI のスタイリングシステムに完全に依存する必要があります。MUI v6 の `sx` prop は非常に強力で、Tailwind ライクな書き心地を提供しつつ、Theme の型安全性を担保できます。

#### 2. データフェッチ: **TanStack Query (React Query) の導入**
*   **現状の課題:** 「`fetch wrapper` を使う」「`Response validation` をする」とありますが、ローディング状態 (`isLoading`)、エラー再試行、キャッシュ、重複排除（Deduping）を自前で実装するのはバグの温床です。
*   **解決策:** `services/api` を **TanStack Query** の `queryFn` として利用することを義務付けます。これにより、コンポーネント内から `useEffect` と `useState` によるデータ管理コードを削除でき、宣言的な UI 構築が可能になります。

#### 3. フォーム: **React Hook Form の採用**
*   **現状の課題:** `Zod` は指定されていますが、フォームの状態管理ライブラリが指定されていません。React 19 の `useActionState` も強力ですが、バリデーションロジックや既存コンポーネントとの連携（MUI の `TextField` 制御など）を考えると、**React Hook Form** が現在のベストプラクティスです。
*   **メリット:** 不要な再レンダリングを防ぎ、MUI コンポーネントとの連携には `Controller` を使うことで一貫した実装が可能です。

#### 4. Markdown: markdown-it → **react-markdown**
*   **理由:** `markdown-it` は純粋な JS ライブラリであり、React 上で使うには `dangerouslySetInnerHTML` を使うか、独自にパースしてコンポーネントにマッピングする必要があります（XSS リスクや保守コスト増）。
*   **推奨:** `react-markdown` は React コンポーネントとして設計されており、`remark` / `rehype` プラグインエコシステムを使って安全かつ簡単に拡張（数式対応、コードハイライトなど）が可能です。

#### 5. 国際化 (i18n): 独自 util → **i18next**
*   **理由:** 「i18n util 既存使用」とありますが、単なる辞書置換以上の機能（複数形、日付フォーマット、補間、React Context との連携）が必要になった際、独自実装の拡張はコストが高いです。
*   **推奨:** 早い段階で **i18next** (`react-i18next`) に移行することで、標準的な保守性を担保できます。

#### 6. E2E テスト: **Playwright**
*   **理由:** 文書には Storybook と Unit テストのみ記載がありましたが、Critical Flow の 100% カバーを目指すなら E2E は必須です。Cypress よりも動作が高速で、Vite や CI 環境との親和性が高い Playwright を推奨技術として明記しました。