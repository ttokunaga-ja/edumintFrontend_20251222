# ディレクトリ構造 & アーキテクチャ規約（Frontend）

本ドキュメントは、`edumintFrontend` における**ディレクトリ構造とアーキテクチャ規約の完全版**である。
本規約の最大の目的は、**「ライブラリ・フレームワーク標準機能の徹底活用」**による保守性の向上と、独自実装（オレオレ実装）の排除である。

---

## 1. アーキテクチャ原則

### 基本方針：Standard over Custom
*   **ライブラリに寄せる**: 独自のユーティリティやラッパーコンポーネントを作成する前に、導入済みライブラリ（MUI, TanStack Query, React Hook Form 等）に同様の機能がないか確認し、あればそれを使う。
*   **UIライブラリの直利用**: ボタンや入力フォームなどの基本要素は、独自ラッパー（`src/components/primitives` 等）を作らず、MUI コンポーネントを直接使用する。スタイル統一は `src/theme` で行う。
*   **宣言的データフェッチ**: `useEffect` による手書きのデータ取得を禁止し、必ず `TanStack Query` を使用する。

### レイヤリングと依存方向
依存関係は**「上から下」**への一方通行のみ許可する。

1.  **Pages** (`src/pages`)
    *   **役割**: ルーティングのエントリーポイント。レイアウト決定とFeature/Componentの配置。
    *   **禁止**: 複雑なロジック、直接のスタイリング、データフェッチの直書き。
2.  **Components** (`src/components`)
    *   **役割**: UIのレンダリング。
    *   **禁止**: ドメインロジックの保持、APIの直接呼び出し。
3.  **Features** (`src/features`)
    *   **役割**: ビジネスロジック、状態管理、API通信フック。
    *   **禁止**: 汎用UIコンポーネントの定義。
4.  **Lib / Services** (`src/lib`, `src/services`)
    *   **役割**: ライブラリ設定、API定義、インフラ層。
    *   **禁止**: Reactコンポーネントへの依存。

---

## 2. 技術スタック・ライブラリ制約（Strict）

独自実装を避けるため、以下のライブラリ群を標準として利用すること。

| カテゴリ | 採用技術 | 運用ルール |
| :--- | :--- | :--- |
| **Language** | TypeScript | Strict Mode 必須。`any` 禁止。 |
| **Framework** | React 19 + Vite | |
| **Styling** | **MUI v6 + Emotion** | **Tailwind CSS 禁止**。スタイルは `sx` prop または `styled()` で記述し、値を `theme` から参照する。 |
| **Server State** | **TanStack Query v5** | API通信は全て `useQuery` / `useMutation` で行う。手書き `fetch` 禁止。 |
| **Form** | **React Hook Form** | バリデーションは **Zod** スキーマと連携 (`@hookform/resolvers`) させる。 |
| **Routing** | React Router | |
| **I18n** | **i18next** | 独自辞書禁止。`src/locales` の JSON を `useTranslation` で読み込む。 |
| **Date** | Day.js / MUI Pickers | 日付操作の自作関数禁止。 |
| **Testing** | Vitest + Playwright | Unit/Component は Vitest, E2E は Playwright。 |

---

## 3. ディレクトリ構造（Final）

「設定（Config）と実装（Source）」を明確に分け、独自ラッパーを排除した構成とする。

```text
edumintFrontend/
├── .dockerignore                     # Dockerビルド除外設定
├── .env.example                      # 環境変数テンプレート
├── .gitignore
├── Dockerfile                        # 本番/プレビュー用 Dockerビルド定義
├── docker-compose.yml                # ローカル開発用コンテナ定義 (App, API Mock)
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts                    # Vite設定 (Plugin, Alias)
├── vitest.config.ts                  # テスト設定
├── public/
│   ├── locales/                      # [New] 静的翻訳ファイル (i18next backend対応)
│   │   ├── en/
│   │   │   └── translation.json
│   │   └── ja/
│   │       └── translation.json
│   └── mockServiceWorker.js          # MSW Service Worker
│
├── src/
│   ├── app/                          # [New] アプリケーション構成・設定層
│   │   ├── App.tsx                   # ルートコンポーネント
│   │   ├── AppProviders.tsx          # Context Provider集約 (Theme, Query, Router, Auth)
│   │   └── router.tsx                # ルーティング定義 (React Router v7)
│   │
│   ├── components/                   # UI層 (Logic-less / Pure View)
│   │   ├── common/                   # アプリ固有の共有コンポーネント (Header, Footer, Dialogs)
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   ├── ContextHealthAlert.tsx
│   │   │   ├── NotificationCenter.tsx # [New] グローバル通知表示
│   │   │   └── EmptyState.tsx         # [New] 検索結果0件・データなし表示
│   │   ├── page/                     # ページ固有のサブコンポーネント (再利用しないもの)
│   │   │   ├── HomePage/             # 画面単位でディレクトリ分割
│   │   │   │   ├── SearchSection.tsx
│   │   │   │   └── AdvancedSearchPanel.tsx
│   │   │   ├── ProblemCreate/
│   │   │   │   ├── AnalysisPhase.tsx
│   │   │   │   └── GenerationPhase.tsx
│   │   │   └── MyPage/
│   │   │       └── UserStatsCards.tsx
│   │   └── problemTypes/             # ドメイン固有のUI部品 (問題形式ごとのView/Edit)
│   │       ├── ClozeView.tsx
│   │       ├── MultipleChoiceView.tsx
│   │       └── ProblemTypeRegistry.tsx
│   │   # NOTE: `primitives/` (Button, Card等) は廃止。MUIコンポーネントを直接使用。
│   │
│   ├── contexts/                    # [New] グローバルコンテキスト管理
│   │   └── NotificationContext.tsx  # トースト通知システム (グローバル)
│   │
│   ├── features/                     # ドメインロジック層 (Hooks, State, Types)
│   │   ├── auth/                     # 認証ドメイン
│   │   │   ├── hooks/                # useAuth, useLogin, useLogout
│   │   │   └── types/                # UserSession型
│   │   ├── content/                  # 問題コンテンツドメイン
│   │   │   ├── hooks/                # useProblemQuery (TanStack Query), useProblemMutation
│   │   │   └── types/                # ProblemSchema (Zod)
│   │   ├── generation/               # 生成AIドメイン
│   │   │   ├── hooks/                # useGenerationStatus
│   │   │   └── stores/               # generationStore (Zustand - 複雑なUI状態のみ)
│   │   ├── search/                   # 検索ドメイン
│   │   └── user/                     # ユーザードメイン (Profile, Wallet)
│   │       ├── hooks/                # useUserProfile, useUserStats
│   │       └── types/
│   │
│   ├── hooks/                        # 汎用 Hooks (ビジネスロジックを含まない)
│   │   ├── useDebounce.ts
│   │   └── useServiceHealth.ts       # システムヘルス監視
│   │
│   ├── lib/                          # [New] ライブラリ設定・初期化 (独自Utilsはここへ統合)
│   │   ├── axios.ts                  # Axios Instance (Interceptors設定)
│   │   ├── dayjs.ts                  # Day.js Plugins設定
│   │   ├── i18n.ts                   # i18next 初期化設定
│   │   ├── query-client.ts           # QueryClient 設定 (cacheTime, staleTime)
│   │   └── utils.ts                  # 最小限のHelper (clsx/twMerge等、必要な場合のみ)
│   │
│   ├── mocks/                        # MSW API Mocks
│   │   ├── browser.ts
│   │   ├── server.ts
│   │   └── handlers/                 # APIハンドラー定義
│   │
│   ├── pages/                        # ページエントリーポイント (Routing Destination)
│   │   │                             # ここは画面構成と主要コンポーネントの配置のみ行う
│   │   ├── HomePage.tsx
│   │   ├── MyPage.tsx
│   │   ├── LoginRegisterPage.tsx     # ログイン・登録統合ページ
│   │   ├── AdminModerationPage.tsx
│   │   ├── ProblemViewEditPage.tsx   # 詳細・編集兼用ページ (/problem/:id)
│   │   └── ProblemCreatePage.tsx       # 複雑なページはディレクトリ化して責務分離
│   │
│   ├── services/                     # 外部連携定義
│   │   └── api/
│   │       ├── endpoints.ts          # API Endpoint定数一覧
│   │       └── types.ts              # API Request/Response型 (OpenAPI生成推奨)
│   │       # NOTE: `gateway/*.ts` は廃止。features hooks内で直接宣言的にデータ取得する。
│   │
│   ├── theme/                        # デザインシステム定義 (MUI Theme)
│   │   ├── index.ts                  # createTheme エントリー
│   │   ├── palette.ts                # 色定義
│   │   ├── typography.ts             # フォント定義
│   │   └── components.ts             # MUIコンポーネントのデフォルトProps/Styleオーバーライド
│   │
│   └── types/                        # グローバル型定義
│       ├── env.d.ts                  # Vite環境変数型
│       └── global.d.ts
│
└── tests/                            # テストスイート (機能・目的別に整理)
    ├── unit/                         # 単体テスト (Hooks, Utils, Features)
    │   ├── features/
    │   │   └── generation/
    │   │       └── stateMachine.test.ts
    │   └── hooks/
    ├── component/                    # コンポーネント結合テスト (React Testing Library)
    │   ├── problemTypes/
    │   │   └── ClozeView.test.tsx
    │   └── page/
    │       └── ProblemCreateView.test.tsx
    └── e2e/                          # E2Eテスト (Playwright)
        ├── problemCreation.spec.ts
        └── authFlow.spec.ts
```

---

## 4. 実装ガイドライン

### UIコンポーネントの実装 (Use MUI)
独自に `Card` や `Button` コンポーネントを作らず、MUI をそのまま使うか `theme` でカスタマイズする。

**Bad (独自実装):**
```tsx
// src/components/primitives/Button.tsx
export const Button = ({ variant, ...props }) => (
  <button className={`btn-${variant}`} {...props} /> // Tailwind禁止
);
```

**Good (MUI直利用):**
```tsx
import { Button } from '@mui/material';

// src/pages/HomePage.tsx
<Button variant="contained" color="primary" sx={{ borderRadius: 2 }}>
  検索
</Button>
```
※ 全体的なスタイル変更が必要な場合は `src/theme/components.ts` の `styleOverrides` を編集する。

### API通信の実装 (Use TanStack Query)
`gateway.ts` に手続き的なメソッドを書かず、Hooks 内で宣言的に記述する。

**Bad (Gateway Pattern):**
```ts
// src/services/api/gateway.ts
export const fetchUser = async (id: string) => { ... } // 手書き禁止

// component
useEffect(() => { fetchUser(id).then(...) }, []) // useEffect禁止
```

**Good (Query Hooks):**
```ts
// src/features/user/hooks/useUser.ts
import { useQuery } from '@tanstack/react-query';
import { axios } from '@/lib/axios';

export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const { data } = await axios.get(`/users/${userId}`);
      return UserSchema.parse(data); // Zodで検証
    }
  });
};
```

### フォーム実装 (Use React Hook Form)
`useState` で入力を管理せず、`useForm` を使う。

```tsx
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
});

<TextField {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
```

---

## 5. 移行・削除アクション（Refactoring Checklist）

現状のコードベースから以下のディレクトリ・ファイルを削除または移行する。

1.  **`src/components/primitives/` の全削除**:
    *   shadcn/ui や独自実装の Button, Card, Input 等を削除。
    *   利用箇所を MUI コンポーネント (`@mui/material/*`) に置換。
2.  **`src/shared/utils/` の縮小**:
    *   日付フォーマット関数 → `dayjs` へ置換。
    *   API用関数 → `src/lib/axios.ts` へ統合。
    *   i18nヘルパー → `i18next` へ移行。
3.  **`src/services/api/gateway` の廃止**:
    *   手書きの Fetch 関数群を削除。
    *   各 Features の `hooks` 内にクエリ定義を移設。
4.  **Tailwind 関連ファイルの削除**:
    *   `tailwind.config.js`, `postcss.config.js` を削除。
    *   `className` 属性を `sx` prop または `styled` component に書き換え。