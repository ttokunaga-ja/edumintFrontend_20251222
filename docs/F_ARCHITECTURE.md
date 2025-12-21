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
