# Development Phases & Task Breakdown（Frontend）

本書は **Refactor v2（ディレクトリ再編・旧UI→新UI移行の配線整理）** のためのタスク洗い出しとフェーズ分割を定義する。

- 要件/方針（何を直すか）: `Y_REFACTOR2_REQUIREMENTS.md`
- アーキ/配置ルール（どこに置くか）: `F_ARCHITECTURE.md`
- CodexAgent 用プロンプト（どう実装するか）: `Q_PROMPT.md`

> 画面UIの実装/追加は FIGMAAI 担当。本書は **移動・import整備・互換レイヤ・配線** に限定する。

---

## フェーズプロンプト共通テンプレート（CodexAgent）

````markdown
### 1. 目的
### 2. 制約（やらないこと含む）
### 3. タスク（ID付き）
### 4. 完了条件（DoD）
### 5. 検証手順（build/typecheck/test）
### 6. 互換レイヤ（re-export）方針
### 7. ドキュメント更新
### 8. 停止条件 / BLOCKED 条件
````

---

## Refactor v2：フェーズ定義とタスク

### P0: 二重モック防止（最小安全策）
**Objective:** MSW有効時に内部モック（`USE_MOCK_DATA`）を強制OFFにし、混在によるデータ不整合を防ぐ。  
**Tasks:**
- P0-1: `src/src/services/api/httpClient.ts` に**環境変数チェック**を追加し、`VITE_ENABLE_MSW=true` のときは `USE_MOCK_DATA` を強制的に `false` にする（または警告ログを出力する）。
- P0-2: Gateway 各ファイル（health/search/content/generation/files/notifications/user）の `if (USE_MOCK_DATA)` 分岐が **MSW起動時には実行されない**ことを確認する（起動時ログまたはテストで検証）。
- P0-3: ドキュメント更新: `T_MSW_GUIDE.md` に「MSW有効時は内部モック自動無効化」のルールを明記する。
**Completion (DoD):**
- `VITE_ENABLE_MSW=true` 時に `USE_MOCK_DATA` が `false` になることをログまたはテストで確認できる。
- Gateway内の `if (USE_MOCK_DATA)` ブロックが実行されない（MSWのhandlerが優先される）。
**Verification:**
- `npm -C /mnt/c/Users/is0732hk/develop/Edumintfrontedfigma run build`
- DEV環境で `VITE_ENABLE_MSW=true` を設定し、コンソールログで `USE_MOCK_DATA` の値を確認

---

### P1: VITE_USE_MOCK_DATA 分岐の撤去/無害化
**Objective:** Gateway 内の `USE_MOCK_DATA` 分岐を削除し、モックは MSW のみに一本化する。  
**Background:**
- 現状: `USE_MOCK_DATA = API_BASE_URL.includes('localhost')` で判定（20+箇所で使用）
- 問題: MSW と内部モックが二重に存在し、データ不整合の原因になる
- 目標: Gateway は常に実 API を叩く実装にし、モックは MSW が通信レイヤで intercept

**Tasks:**
- P1-1: `src/src/services/api/httpClient.ts` から `USE_MOCK_DATA` の定義を削除する（または `false` 固定にする）。
- P1-2: Gateway 各ファイル（health/search/content/generation/files/notifications/user）から `if (USE_MOCK_DATA)` 分岐を削除する。
  - 削除対象: `gateway/generation.ts` (6箇所)、`gateway/search.ts` (2箇所)、`gateway/notifications.ts` (5箇所)、`gateway/user.ts` (3箇所)、`gateway/health.ts`、`gateway/content.ts`、`gateway/files.ts`
  - モック実装は MSW handlers へ移植済みであることを確認（未移植の場合は P1-3 で対応）
- P1-3: MSW handlers に不足している endpoint があれば追加する（Gateway から削除したモックロジックを handlers へ移植）。
- P1-4: `mockDelay()`, `getMockExams()`, `getMockComments()` の呼び出しを Gateway から削除する。
- P1-5: 環境変数 `VITE_USE_MOCK_DATA` の扱いを `J_ENV_VARS_REGISTRY.md` で明確化する（「廃止」または「互換用・将来削除予定」）。

**Completion (DoD):**
- Gateway ファイルに `USE_MOCK_DATA` の参照が存在しない（`grep -r "USE_MOCK_DATA" src/src/services/api/gateway/` が 0 件）。
- `npm -C /mnt/c/Users/is0732hk/develop/Edumintfrontedfigma run build` が通る。
- DEV環境で MSW 有効時に、Gateway が実 API（MSW が intercept）を叩いていることをネットワークタブで確認できる。

**Verification:**
- `npm -C /mnt/c/Users/is0732hk/develop/Edumintfrontedfigma run build`
- `grep -rn "USE_MOCK_DATA" /mnt/c/Users/is0732hk/develop/Edumintfrontedfigma/src/src/services/api/gateway/`（0件であること）
- DEV環境で `VITE_ENABLE_MSW=true` を設定し、ブラウザの Network タブで API リクエストが発行されていることを確認

**Rollback:**
- git revert で P1 のコミットを取り消す
- MSW handlers に不足があった場合は、該当 handler を追加してから再実行

---

### R0: 現状棚卸し（移動マップ確定） - 継続

### R0: 現状棚卸し（移動マップ確定）
**Objective:** 実装を壊さないために、移動対象と import パターンを確定する。  
**Tasks:**
- R0-1: `src/src/` 内の UI 散在箇所（`shared/components`, `components/shared`, `components/features`, `features/*/components`）の一覧を更新し、移動先（common/page）を確定する。  
- R0-2: 「重複している実体」（例: `ContextHealthAlert` / `FileUploadQueue` / `ui/*`）を検出し、**どれを正**にするか決める（正以外は re-export shim 化）。  
- R0-3: 本番起動/ビルドのエントリ（どの `package.json` / `vite.config.ts` が使われるか）を確認し、以後の検証コマンドを固定する。  
**Completion (DoD):** 移動マップが本ファイルに確定し、以降フェーズで追加議論なく進められる。
**Status (2025-12-21):** 完了。以下の現状を確認済み。

#### 現状把握サマリ（根拠パス付き）

##### 1. Build の正本（root/inner の扱い）
- **Root build の正本**: `/mnt/c/Users/is0732hk/develop/Edumintfrontedfigma/vite.config.ts`
  - outDir: `build`
  - alias: `@` → `./src`, `@app` → `./src/src`
  - 検証コマンド: `npm -C /mnt/c/Users/is0732hk/develop/Edumintfrontedfigma run build`
- **Inner build**: `/mnt/c/Users/is0732hk/develop/Edumintfrontedfigma/src/vite.config.ts`
  - outDir指定なし（実験用と推測）
  - alias: `@` → `./`, `@app` → `./src`
  - 検証コマンド: `npm -C /mnt/c/Users/is0732hk/develop/Edumintfrontedfigma/src run build`（必要時のみ）

**結論**: Root buildが正式。Inner buildは補助的で、最終的には統合を目指す。

##### 2. Alias（@/@app）の現状
- Root `vite.config.ts`: `@` → `/mnt/c/Users/is0732hk/develop/Edumintfrontedfigma/src`, `@app` → `/mnt/c/Users/is0732hk/develop/Edumintfrontedfigma/src/src`
- `src/tsconfig.json`: `@/*` → `./*`, `@/*` → `./src/*`
- **整合性**: TypeScript と Vite の解釈は一致している（R1の目標は既に達成済み）。

##### 3. App ルーティングの現状（wrapper 利用状況）
- `/mnt/c/Users/is0732hk/develop/Edumintfrontedfigma/src/App.tsx`（324行）
  - State-based 画面遷移（`currentPage: Page` で分岐）
  - 新UIページを既に参照:
    - `LoginRegisterPage` → `@/pages/LoginRegisterPage`
    - `HomePage` → `@/pages/HomePage`
    - `ProblemCreatePage` → `@/pages/ProblemCreatePage`
    - `ProblemViewEditPage` → `@/pages/ProblemViewEditPage`
    - `MyPage` → `@/pages/MyPage`
  - Legacy コンポーネント（`src/components/*`）も混在:
    - `ProfileSetupPage` → `./components/ProfileSetupPage`
    - `StructureConfirmPage` → `./components/StructureConfirmPage`
  - `TopMenuBar` は `./src/shared/components/TopMenuBar` を参照

**結論**: 新UIページは既に配線済み。Legacy は ProfileSetup/StructureConfirm/TopMenuBar に限定。

##### 4. MSW の現状（起動条件、handlers の網羅範囲）
- **起動**: `/mnt/c/Users/is0732hk/develop/Edumintfrontedfigma/src/main.tsx`
  - 条件: `import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === "true"`
  - worker import: `@/mocks/browser`
  - 起動方法: `worker.start({ onUnhandledRequest: "bypass" })`
- **Handlers**: `/mnt/c/Users/is0732hk/develop/Edumintfrontedfigma/src/src/mocks/handlers/`
  - `healthHandlers.ts`, `searchHandlers.ts`, `notificationsHandlers.ts`, `contentHandlers.ts`, `generationHandlers.ts`, `filesHandlers.ts`, `userHandlers.ts`
- **MockData**: `/mnt/c/Users/is0732hk/develop/Edumintfrontedfigma/src/src/mocks/mockData/`
  - `health.ts`, `search.ts`, `notifications.ts`, `content.ts`, `generation.ts`, `files.ts`, `user.ts`
- **Public**: `/mnt/c/Users/is0732hk/develop/Edumintfrontedfigma/public/mockServiceWorker.js` 存在

**結論**: MSW は正しく設置済み。起動条件も適切（DEV＋明示フラグ）。Handler/mockData はドメイン別に整理済み。

##### 5. VITE_USE_MOCK_DATA など内部モック分岐の残存箇所一覧
- **定義**: `/mnt/c/Users/is0732hk/develop/Edumintfrontedfigma/src/src/services/api/httpClient.ts:16`
  - `export const USE_MOCK_DATA = API_BASE_URL.includes('localhost');`
  - **問題**: `VITE_API_BASE_URL` に `localhost` が含まれるかで判定（環境変数 `VITE_USE_MOCK_DATA` は未使用）
- **利用箇所**（20+マッチ）:
  - `gateway/generation.ts`: 6箇所（全API関数で `if (USE_MOCK_DATA)` 分岐）
  - `gateway/search.ts`: 2箇所
  - `gateway/notifications.ts`: 5箇所
  - `gateway/user.ts`: 3箇所
  - `gateway/health.ts`: 推測で複数箇所（確認済み: 最低1箇所）
  - `gateway/content.ts`: 推測で複数箇所（確認済み: 最低1箇所）
  - `gateway/files.ts`: 推測で複数箇所（確認済み: 最低1箇所）

**問題点**: 
- MSW が有効な場合でも、`USE_MOCK_DATA` が `true` になる可能性がある（localhost で MSW を起動すると二重モック状態になる）。
- 環境変数 `VITE_USE_MOCK_DATA` は `J_ENV_VARS_REGISTRY.md` に記載があるが、実装では使われていない。

##### 6. features/repository 経路（UI→repository→gateway の現状）
- **repository 存在**: `/mnt/c/Users/is0732hk/develop/Edumintfrontedfigma/src/src/features/search/repository.ts`
  - `searchExams`, `suggestReadings` を gateway から re-export（薄いラッパー）
- **features 構造**: `/mnt/c/Users/is0732hk/develop/Edumintfrontedfigma/src/src/features/`
  - `auth/`, `content/`, `notifications/`, `search/`, `user/`
  - 各featureに `components/` が存在するかは未確認（次タスクで詳細調査）
- **Pages**: `/mnt/c/Users/is0732hk/develop/Edumintfrontedfigma/src/src/pages/`
  - `HomePage.tsx` は `@/features/search/repository` を利用（正しい依存方向）
  - `HomePage.tsx`, `ProblemCreatePage.tsx`, `ProblemViewEditPage.tsx`, `ProblemViewEditPage.tsx`, `MyPage.tsx` が存在

**結論**: Repository 層は既に導入済み（search は完了）。他ドメインは未確認。

##### 7. components 構造の現状
- **Page components**: `/mnt/c/Users/is0732hk/develop/Edumintfrontedfigma/src/src/components/page/`
  - `HomePage/`, `MyPage/`, `ProblemCreatePage/`, `ProblemViewEditPage/` が存在
- **Common components**: `/mnt/c/Users/is0732hk/develop/Edumintfrontedfigma/src/src/components/common/`
  - `TopMenuBar.tsx`, `ServiceHealthBar.tsx`, `Pagination.tsx`, `EmptyState.tsx`, `MaintenancePage.tsx`, `ContextHealthAlert.tsx`, `PageHeader.tsx`, `JobStatusRibbon.tsx`, `MultilingualAutocomplete.tsx`
  - **重複**: `ContextHealthAlert.tsx` と `ContextHealthAlertLegacy.tsx` が存在（正は `ContextHealthAlert.tsx`、Legacy は移行用）
- **Shared components（旧配置）**: `/mnt/c/Users/is0732hk/develop/Edumintfrontedfigma/src/src/shared/components/`
  - 存在の可能性あり（未確認）→ R2 で要調査

**結論**: 新構造（page/common）は既に部分的に整備済み。Legacy 配置との併存状態。

##### 8. Inner src の TS エラー状況（未実施・把握のみ）
- **検証未実施**: ビルドコマンドを実行していないため、具体的なエラーは不明。
- **推測**: Legacy import（`@/src/*`）や型解決の問題が発生している可能性（要件ドキュメントで報告済み）。

---

#### 移動マップ（As-Is → To-Be）- 2025-12-21 更新版
※ R0 で詳細な実ファイル調査を実施し、以下を確定すること（現在は一部推測を含む）。

**現状確認済み（存在）**:
- `src/src/components/common/`: TopMenuBar, ServiceHealthBar, Pagination, EmptyState, MaintenancePage, ContextHealthAlert, ContextHealthAlertLegacy, PageHeader, JobStatusRibbon, MultilingualAutocomplete
- `src/src/components/page/`: HomePage/, MyPage/, ProblemCreatePage/, ProblemViewEditPage/
- `src/src/shared/components/`: 存在の可能性あり（未調査）

**移動候補（要実ファイル確認）**:
- `src/src/features/search/components/` → `page/HomePage/` または `common/`
- `src/src/features/content/components/` → `page/ProblemCreatePage/` または `page/ProblemViewEditPage/`
- `src/src/features/user/components/` → `page/MyPage/`
- `src/src/components/features/` → 各 page または common
- `src/src/components/shared/` → `common/`

**重複処理方針**:
- ContextHealthAlert: `common/ContextHealthAlert.tsx`（正）、`common/ContextHealthAlertLegacy.tsx`（削除予定）
- TopMenuBar: `common/TopMenuBar.tsx` が正。`shared/components/TopMenuBar.tsx` が存在すれば shim 化
- FileUploadQueue: 実体の場所を確認（features/content vs components/features/upload）

---

### R1: import/alias の整合（壊れない移行）
**Objective:** TypeScript と Vite の import 解釈を一致させ、`@`/`@app` を使い分け可能にする。  
**Status (2025-12-21):** 完了済み（実装確認）。alias は既に整合している。
- Root `vite.config.ts`: `@` → `./src`, `@app` → `./src/src`
- `src/tsconfig.json`: `@/*` → `./*`, `@/*` → `./src/*`
**Tasks:**
- R1-1: ~~`Edumintfrontedfigma/src/tsconfig.json` の `paths` を **Vite の `@`（= `Edumintfrontedfigma/src`）と一致**させる。~~ **完了済み**
- R1-2: ~~Vite（`Edumintfrontedfigma/vite.config.ts`）へ `@app` alias（`Edumintfrontedfigma/src/src`）を追加する。~~ **完了済み**
- R1-3: 新実装（`src/src`）は原則 `@/*` を使用するよう import を置換し、legacy 参照は `@/*`（例: `@/components/ui/*`）に限定する。 **部分完了（`HomePage.tsx` 等で使用中）**
**Completion (DoD):** IDE/tsc と Vite が同一のファイルを解決し、`@/src/*` と `@/*` が両立する。 **達成済み**
**Verification:** `npm -C /mnt/c/Users/is0732hk/develop/Edumintfrontedfigma run build`

---

### R2: UI を `src/src/components/` に集約（common / page）
**Objective:** UI の配置ルールを固定し、移動後も既存 import を壊さない（shim で吸収）。  
**Tasks:**
- R2-1: `src/src/components/common/*` を新設し、R0 の common 移動対象を `git mv` する。  
- R2-2: `src/src/components/page/<PageName>/*` を新設し、R0 の page 移動対象を `git mv` する。  
- R2-3: 旧配置（`src/src/shared/components`, `src/src/components/shared`, `src/src/components/features`, `src/src/features/*/components`）には **re-export shim** を残す。  
**Completion (DoD):** UI 実体は `components/common` と `components/page/*` に集約され、旧パスは参照互換のみになる。

---

### R3: `features` から UI を排除（hook/repository/model 化）
**Objective:** `features` を UI 非依存にし、Page/Component から利用できるロジック層にする。  
**Tasks:**
- R3-1: `src/src/features/*/components` を撤去し、残るものは `src/src/components/*` へ移動（R2 で対応できないものを回収）。  
- R3-2: `features/<domain>/hooks`, `features/<domain>/repository`, `features/<domain>/models` を整備し、UI が直接 API client を呼ばない形にする。  
- R3-3: 依存方向違反（`features -> components`, `components -> services/api`）がない状態にする。  
**Completion (DoD):** `src/src/features/**` 配下に React UI コンポーネントが存在しない。

---

### R4: `services/api` の責務分割（gateway.ts 分割 + 互換）
**Objective:** `gateway.ts` の肥大を止め、ドメイン別 client に分割する。  
**Tasks:**
- R4-1: `src/src/services/api/httpClient.ts` を作成し、baseUrl/headers/timeout/retry を集約する。  
- R4-2: `src/src/services/api/gateway/<domain>.ts`（health/search/files/generation/content/user/notifications/moderation）へ分割する。  
- R4-3: `src/src/services/api/index.ts` で再 export し、当面は `src/src/services/api/gateway.ts` を barrel（再 export）として残す。  
**Completion (DoD):** `gateway.ts` は薄い re-export に近く、client の実体は domain ファイルに分離される。

---

### R5: utils/types の重複排除（参照ルール固定）
**Objective:** util/type の参照ブレを止め、旧UI・新UIの混線を抑える。  
**Tasks:**
- R5-1: `cn()` 等の pure util を `src/src/shared/utils/*` に統一し、重複実体は shim 化する。  
- R5-2: 型の参照ルールを固定する（例: 新実装は `@/types/*`、legacy は `@/types/*`）。  
- R5-3: `src/src/components/ui/utils.ts` と `src/src/lib/utils.ts` の役割を整理し、単一路線に統一する。  
**Completion (DoD):** util/type の二重実装が消え、import 先が一貫する。

---

### R6: App 配線の段階移行（旧UI 参照 0 へ & Wrapper 解消）
**Objective:** App の参照先を新UIへ寄せ、Wrapper 状態のページをリファクタリングして旧UIを退役できる状態にする。  
**Tasks:**
- R6-1: `src/App.tsx` の参照先が全て `src/src/pages/*` になっていることを確認（R1時点で概ね完了）。
- R6-2: **MyPage の Wrapper 解消**:
  - `src/components/MyPage.tsx` の内容を `src/src/components/page/MyPage/*`（Tabs, ProfileCard, HistoryList 等）に分解・移植する。
  - `src/src/pages/MyPage.tsx` を新コンポーネントで再実装し、Legacy import を除去する。
- R6-3: **LoginRegisterPage の Wrapper 解消**:
  - `src/components/LoginPage.tsx` の内容を `src/src/components/page/LoginRegisterPage/*`（AuthForm, SocialButtons 等）に分解・移植する。
  - `src/src/pages/LoginRegisterPage.tsx` を新コンポーネントで再実装する。
- R6-4: **ProblemCreatePage の Wrapper 解消**:
  - `src/components/ProblemCreatePage.tsx` と `GeneratingPage.tsx` のロジックを統合する。
  - `src/src/components/page/ProblemCreatePage/*`（Stepper, URLInput, FileUpload, GeneratingStatus）に再構成する。
  - `src/src/pages/ProblemCreatePage.tsx` を再実装し、jobId に基づく条件分岐（入力モード/生成中モード）を一元管理する。
- R6-5: 旧 `src/components/*` のページファイル（Wrapper 解消済み）を削除または `_archived/` へ移動する。  
**Completion (DoD):**
- `src/src/pages/*` が `src/components/*` を import していない。
- `npm -C Edumintfrontedfigma run build` が通る。
- アプリの挙動（ログイン、マイページ表示、問題作成フロー）が維持されている。

---

### R7: MSW 導入（通信レイヤのモック）
**Objective:** 本番コードを変えずに、DEV/Storybook/Vitest で API を安定モックできる状態を作る。  
**Tasks:**
- R7-1: `msw` を devDependency に追加し、`public/mockServiceWorker.js` を生成する（`npx msw init public/ --save`）。  
- R7-2: `src/src/mocks/*`（`browser.ts`, `server.ts`, `handlers/*`, `mockData/*`）を新設する。  
- R7-3: `src/main.tsx` で **DEV かつ明示フラグ有効時のみ** `worker.start()` する（例: `VITE_ENABLE_MSW=true`）。  
- R7-4: Gateway のドメイン単位で handlers を用意する（health/search/content/generation/user など）。  
- R7-5: mockData は正常系だけでなく **404/401/500/空配列/境界値** を用意し、Contract-first を徹底する。  
**Completion (DoD):**
- 本番ビルド/本番環境で MSW が起動しない。
- UI 側に「モック用分岐」が存在しない（MSW は通信横取りのみ）。
- Storybook/Vitest で安定してモックできる。

---

## 検証コマンド（推奨）
- `npm -C Edumintfrontedfigma run build`
- `npm -C Edumintfrontedfigma/src run build`（tsc を含む検証が必要な場合）

---

## Sources
- `Y_REFACTOR2_REQUIREMENTS.md`
- `F_ARCHITECTURE.md`
- `Z_REFACTOR_REQUIREMENTS.md`（MVP最小改修の参考）
