# ディレクトリ構造 & アーキテクチャ規約（Frontend）

この章は「どこに何を置くべきか」を **ディレクトリ単位 + ファイル名単位** で定義し、特に以下を是正する。
- `features/*/components` や `shared/components` に UI が散在している（→ `src/src/components/` に集約）。
- `services/api/gateway.ts` が巨大化しており、外部通信の責務分離が弱い（→ domain 別 client に分割）。
- util が `src/src/lib` / `src/src/shared/utils` / `src/src/components/ui/utils` に分散している（→ shared utils に統合）。

## 原則（配置ルール）
- UI（React Component）
  - **ページ専用/画面専用**: `src/src/components/page/<PageName>/*`
  - **複数ページで使う**: `src/src/components/common/*`
  - **プリミティブ（shadcn/ui 派生）**: `src/components/ui/*`（既存資産を共通UIとして利用。新実装はここを参照）
- ドメインロジック（UI 以外）
  - **ユースケース/状態/バリデーション**: `src/src/features/<domain>/*`
  - `features/*` に **React Component（.tsx UI）を置かない**（Hooks は OK）。
- 外部通信（Gateway）
  - **唯一の外部通信層**: `src/src/services/api/*`
  - `components/` や `features/` から直接 `fetch()` しない（client 経由）。
- 横断関心
  - Context: `src/src/contexts/*`
  - Cross-cutting hooks: `src/src/hooks/*`
  - Pure utils: `src/src/shared/utils/*`（React を含まない）
  - Mocks（MSW）: `src/src/mocks/*`（DEV/Storybook/Vitest のみ。本番では起動しない）

---

# ディレクトリ構造・アーキ原則（React + TypeScript）

## 前提（本プロジェクトの標準）
- **Page は1ファイル**で構成する（画面定義のみ、詳細UI/ロジックを持たない）
- Page を構成する部品は **Page 専用 Component** として分離する
- 全画面共通（トップメニュー等）は **CommonComponent** として管理する
- **「Page = 画面」「Component = 部品」「Logic = hook」** を徹底する

## レイヤ責務（必須）
| レイヤ | 役割 |
| --- | --- |
| `src/pages` | ルーティング単位 / 画面定義のみ（1ファイル） |
| `src/components/page` | 特定 Page 専用の UI 部品 |
| `src/components/common` | 複数 Page で再利用する UI（Header等） |
| `src/hooks` / `src/stores` | ロジック・状態（UIから分離） |
| `src/features/<domain>/hooks` | ドメインに閉じた再利用ロジック（API単位/関連通信の最小単位） |
| `src/pages/<PageName>/hooks` | Page固有のオーケストレーション（複数ドメインHookの統合/UI状態管理） |
| `src/api` / `src/types` | 通信定義 / 型定義 |
| `src/utils` | 汎用関数 |
| `src/styles` | グローバルスタイル |

## 推奨ディレクトリ構造（標準）
```txt
src/
├─ app/
│  ├─ App.tsx
│  ├─ router.tsx
│  └─ index.tsx
│
├─ pages/
│  ├─ HomeSearch/
│  │  └─ HomeSearchPage.tsx
│  ├─ ProblemSubmit/
│  │  └─ ProblemSubmitPage.tsx
│  ├─ ProblemViewEdit/
│  │  └─ ProblemViewEditPage.tsx
│  ├─ MyPage/
│  │  └─ MyPagePage.tsx
│  ├─ LoginRegister/
│  │  └─ LoginRegisterPage.tsx
│  └─ AdminModeration/
│     └─ AdminModerationPage.tsx
│
├─ components/
│  ├─ common/
│  │  ├─ Header/
│  │  │  ├─ Header.tsx
│  │  │  └─ Header.module.css
│  │  └─ Button/
│  │     └─ Button.tsx
│  │
│  └─ page/
│     ├─ HomeSearch/
│     │  ├─ SearchForm.tsx
│     │  └─ ResultList.tsx
│     └─ ProblemSubmit/
│        ├─ SubmitForm.tsx
│        └─ GeneratingPanel.tsx
│
├─ hooks/
├─ stores/
├─ api/
├─ types/
├─ utils/
└─ styles/
```

## 命名規則（必須）
- Page: `src/pages/<PageName>/<PageName>Page.tsx`
- Page専用Component: `src/components/page/<PageName>/<ComponentName>.tsx`
- CommonComponent: `src/components/common/<ComponentName>/<ComponentName>.tsx`
- Hooks: `src/hooks/useXxx.ts`
- Domain Hooks: `src/features/<domain>/hooks/useXxx.ts`
- Page Orchestration Hooks: `src/pages/<PageName>/hooks/use<PageName>Controller.ts`
- Stores: `src/stores/xxxStore.ts`
- API: `src/api/xxxApi.ts`
- Types: `src/types/xxx.ts`
- Style（任意）: `*.module.css`（または採用した方式に統一）

## 依存方向ルール（必須）
### import 許可（概要）
- `pages` → `components/*`, `hooks`, `stores`, `types`, `api`, `utils`
- `pages/<PageName>/hooks` → `features/<domain>/hooks`, `hooks`, `stores`, `types`, `api`, `utils`
- `components/page` → `components/common`, `hooks`, `stores`, `types`, `utils`（原則 `api` 直参照しない）
- `components/common` → `hooks`, `stores`, `types`, `utils`（必要最小限）
- `features/<domain>/hooks` → `api`, `types`, `utils`（UI依存禁止、Page/Component への依存禁止）
- `hooks` / `stores` → `api`, `types`, `utils`
- `api` → `types`, `utils`（UI依存禁止）
- `types` / `utils` → 依存は最小（UI依存禁止）

### 境界ルール（破綻防止）
- `src/components/page/<PageName>` は **他 Page から import 禁止**（再利用したいなら `common` へ昇格）
- `Page` は **API通信・状態管理を直接持たない**（hook / store に委譲）
- `src/pages/<PageName>/hooks` は **画面固有の UI 状態/手続き（ステップ/開閉/統合）** のみを持ち、ドメインロジックは `src/features/<domain>/hooks` へ委譲する
- `src/features/<domain>/hooks` は **特定ドメインに閉じた最小単位のロジック**（API1件 or 近接する一連の通信）に限定し、Page固有の状態や UI 依存を持たない
- `api` / `types` / `utils` は **React/DOM 依存禁止**

## Hooks 層設計（ページ単位 vs マイクロサービス単位）
**結論**: 階層（レイヤー）によって「両方」を使い分ける。

- マイクロサービス単位（Domain-based Hooks）
  - 場所: `src/features/<domain>/hooks/`
  - 役割: 特定のドメイン（例: User/Content/Auth）に閉じた再利用可能な最小単位のロジック。API 1件、または密接に関連する一連の通信を担当。
  - 例: `useProfileUpdate`（User）、`useExamDetail`（Content）。複数画面から同機能を呼び出せるようにする。

- ページ単位（Page Orchestration Hooks）
  - 場所: `src/pages/<PageName>/hooks/`
  - 役割: 画面の「コントローラー」。複数のドメイン Hook を組み合わせ、その画面固有の状態（ステップ、UIの開閉、複数データの統合）を管理する。
  - 例: `useMyPageController`（User情報表示 + Wallet情報表示 + 編集状態管理）。

- 汎用 / UI 単位（Generic Hooks）
  - 場所: `src/hooks/`
  - 役割: ビジネス領域に依存しない UI 挙動やブラウザ API のラッパー。
  - 例: `useServiceHealth`, `useLocalStorage`, `useDebounce`, `useIntersectionObserver`。

この方針により、再利用ロジック（ドメイン）と画面固有の手続き（ページ）、そして純粋なUI補助（汎用）が明確に分離され、変更の影響範囲を局所化できる。

## Page（1ファイル）の要件
- Page の役割は「何を使うか」だけ（composition）
- 条件分岐（権限/状態）は **画面の見通しを壊さない範囲**に限定し、詳細は下位へ委譲する

## ルーティングとの対応
- ルート設計は `H_ROUTING_NAV_SPEC.md` を正とし、実装上の Page 位置は本ファイルの規約に従う。

## 生成物の置き場
- 実装報告/提案/現状は `cloudcode/` に集約する（詳細: `cloudcode/README.md`）

## Next.js（App Router）を使う場合（任意）
- ルーティングファイルは `page.tsx` になるが、**components の分離方針（`common` / `page` / `hooks` / `api`）は同一**とする。

## 記入例（Pageは何を使うかだけ）
```tsx
// src/pages/HomeSearch/HomeSearchPage.tsx
import { Header } from '@/components/common/Header/Header';
import { SearchForm } from '@/components/page/HomeSearch/SearchForm';
import { ResultList } from '@/components/page/HomeSearch/ResultList';
import { useProblemSearch } from '@/hooks/useProblemSearch';

export const HomeSearchPage = () => {
  const { query, setQuery, results, isLoading, error } = useProblemSearch();

  return (
    <>
      <Header />
      <SearchForm value={query} onChange={setQuery} />
      <ResultList items={results} isLoading={isLoading} error={error} />
    </>
  );
};
```

## 「src/src/components/ へ移行済み」（現状）
以下のコンポーネントは新アーキテクチャ (`src/src/components`) に移行済みであり、こちらを正規実装として利用する。

- `src/src/components/common/*`
  - `TopMenuBar.tsx`, `ServiceHealthBar.tsx`, `Pagination.tsx`, `EmptyState.tsx`, `MaintenancePage.tsx`, `ContextHealthAlert.tsx`, `FooterActionBar.tsx`, `JobStatusRibbon.tsx`, `PageHeader.tsx`, `ConfirmDialog.tsx`
- `src/src/components/page/HomePage/*`
  - `AdvancedSearchPanel.tsx`
- `src/src/components/page/ProblemViewEditPage/*`
  - `ProblemMetaBlock.tsx`, `QuestionBlock.tsx`, `SubQuestionBlock.tsx`, `AnswerBlock.tsx`, `PreviewEditToggle.tsx`, `EditHistoryBlock.tsx`, `ProblemEditor.tsx`, `ActionBar.tsx`
- `src/src/components/page/ProblemCreatePage/*`
  - `ProblemSettingsBlock.tsx`, `GenerationOptionsBlock.tsx`, `GenerationSettingsSummary.tsx`, `GenerationStatusTimeline.tsx`

## 外部通信（services/api）の見直し（gateway.ts 分割）
現状の `src/src/services/api/gateway.ts` は「全ドメインの API + util（+暫定のモック判定）」が同居しているため、以下へ分割する。
- `httpClient.ts`: BaseURL/headers/token/timeout/retry/ApiError/traceId/log を集約
- `gateway/*.ts`: domain 別の薄い client（endpoint と DTO 変換のみ）
- API モックは **MSW（`src/src/mocks/*`）** に隔離し、`services/api` は本番 I/F のみを持つ（本番で自動フォールバックしない）。

## ディレクトリ構造（As-Is: 現状）
```text
Edumintfrontedfigma/src/src/
 ├─ features/
 │   ├─ auth/, content/, search/, user/ ...
 ├─ components/ (New Architecture)
 │   ├─ common/
 │   ├─ page/
 │   │   ├─ HomePage/
 │   │   ├─ ProblemCreatePage/
 │   │   └─ ProblemViewEditPage/
 │   └─ ui/ (Moved/Referenced from src/components/ui)
 ├─ pages/ (Entry Points)
 │   ├─ HomePage.tsx (Pure New)
 │   ├─ ProblemViewEditPage.tsx (Pure New)
 │   ├─ ProblemCreatePage.tsx (Wrapper around Legacy)
 │   ├─ MyPage.tsx (Wrapper around Legacy)
 │   ├─ LoginRegisterPage.tsx (Wrapper around Legacy)
 │   └─ AdminModerationPage.tsx (Stub)
 ├─ stories/ (Storybook Files)
 ├─ services/api/, contexts/, hooks/, shared/utils/ ...
```

### 2025-12-21 時点の実装ステータス（移行状況）

現在、`src/src/pages` が `App.tsx` からの正規エントリーポイントとなっているが、一部は旧実装 (`src/components/`) のラッパーとして動作している。

#### ✅ [完了] 新アーキテクチャ（Pure New）
以下のページは完全にリファクタリングされ、`src/components/` (Legacy) に依存していない。
- **HomePage**: `src/src/pages/HomePage.tsx` -> `src/src/components/page/HomePage/*`
- **ProblemViewEditPage**: `src/src/pages/ProblemViewEditPage.tsx` -> `src/src/components/page/ProblemViewEditPage/*`

#### ⚠️ [過渡期] ラッパー（Wrapper）
以下のページは `src/src/pages` にファイルが存在するが、内部で `src/components/` (Legacy) を import し、使用している。
- **ProblemCreatePage**: `src/components/ProblemCreatePage.tsx`, `src/components/GeneratingPage.tsx` を使用。
- **MyPage**: `src/components/MyPage.tsx` を使用。
- **LoginRegisterPage**: `src/components/LoginPage.tsx` を使用。
- **StructureConfirmPage**: `App.tsx` が直接 `src/components/StructureConfirmPage.tsx` を使用中。
- **ProfileSetupPage**: `App.tsx` が直接 `src/components/ProfileSetupPage.tsx` を使用中。

#### 🗑️ [削除済み] 未使用ファイル（Legacy Cleanup）
以下のファイルは参照がなくなり、2025-12-21 時点で**削除済み**である。

- `src/components/HomePage.tsx`
- `src/components/ProblemViewPage.tsx`
- `src/components/SearchPage.tsx`
- `src/components/AdModal.tsx`
- `src/components/AdminPage.tsx`
- `src/components/DepartmentSelect.tsx`
- `src/components/SubjectAutocomplete.tsx`
- `src/components/TeacherAutocomplete.tsx`
- `src/components/UniversityAutocomplete.tsx`

## ディレクトリ構造（To-Be: 推奨 / ファイル名込み）
※ `src/app` への rename は任意。まずは `src/src` 内での完結を目指す。

```text
Edumintfrontedfigma/src/src/
 ├─ pages/                            # Page = 画面定義（1ファイル）
 │   ├─ HomePage.tsx
 │   ├─ ProblemCreatePage.tsx         # /problem-create（Generating 統合）
 │   ├─ ProblemViewEditPage.tsx       # /problem/:id（Preview/Edit 同一 Page）
 │   ├─ MyPage.tsx
 │   ├─ LoginRegisterPage.tsx
 │   └─ AdminModerationPage.tsx
 ├─ components/
 │   ├─ common/                       # 汎用ドメインコンポーネント
 │   ├─ page/                         # ページ固有コンポーネント分解
 │   │   ├─ HomePage/
 │   │   ├─ ProblemCreatePage/
 │   │   ├─ ProblemViewEditPage/
 │   │   ├─ MyPage/
 │   │   └─ LoginRegisterPage/
 ├─ features/                         # 纯粋なロジック・モデル・Hooks
 ├─ services/api/                     # API通信層
 ├─ types/
 └─ ...
```

## アーキテクチャ原則
- 依存方向（レイヤ）: `pages -> components -> features -> services/api -> shared/utils, types`。下位層から上位層を import しない（特に `features -> components` を禁止）。
- Gateway は唯一の API 経路。直接 fetch 禁止。レスポンスは必ず型/スキーマ検証。
- Legacy は参照のみ許可。新規開発は新実装ルート（As-Is: `src/src/*` / To-Be: `src/app/*`）に配置し、移行後に削除。
- ServiceHealth と FeatureFlag は UI レイヤーの手前で評価し、CTA で重複判定しない。
- 文言/i18n は辞書経由。スタイルは Tailwind/shadcn/ui を優先、カスタム CSS は限定的に。
- 現状: `src/src/pages` は Home/ProblemCreate/ProblemViewEdit が中心。MyPage/Login/Admin は legacy に残存しうる。

## 移行方針（Legacy → FIGMA/New）
1. **Entry Point 統一**: `App.tsx` の描画を全て `src/src/pages/*` 経由にする（StructureConfirmPage/ProfileSetupPage も wrapper を作成して移行する）。
2. **Wrapper 解消**: `src/src/pages/*` 内で Legacy コンポーネントを使わず、`src/src/components/page/*` に新規実装して置き換える。
3. **Legacy 削除**: 参照がなくなった `src/components/*` ファイルを順次削除する。

## システム境界（Frontend ⇄ Gateway ⇄ Services）
- フロントは `edumintGateway` の REST のみを利用（サービス直叩き禁止）。
- 検索は `edumintSearch`（Elasticsearch + Qdrant）だが、UI は Gateway 越しにのみアクセス。
- ファイルは S3 に直接 PUT（署名URL）。完了通知は Gateway に戻す（詳細は `D_INTERFACE_SPEC.md`）。
- ヘルス/運用: `/health/{service}` と `/health/summary` をポーリングし、`outage|maintenance` は CTA を抑止。
- 認証: SPA は OIDC/PKCE を前提（トークンを LocalStorage に置かない）。

## Sources
- `../overview/current_implementation.md`, `../overview/requirements.md`
- `../migration/legacy-to-new.md`
- `../architecture/edumint_architecture.md`
- `../implementation/figma/README.md`, `../implementation/service-health/README.md`
