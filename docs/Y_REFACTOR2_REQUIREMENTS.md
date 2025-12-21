# Y Refactor v2 REQUIREMENTS（ディレクトリ再編・旧UI→新UI移行）

目的: FIGMAAI が画面実装を進めやすい状態にするために、CodexAgent が得意とする **ディレクトリ構造の整理 / import 経路の整合 / 旧UI→新UI の段階移行** を安全に実施する。

本書は「何を直すべきか（要件/方針/制約）」を定義し、具体タスク/フェーズは `O_TASK_PHASES.md`、CodexAgent 用プロンプトは `Q_PROMPT.md` に記載する。

---

## 1. スコープ（やること）

### 1.1 ディレクトリ再編（UI の集約）
- Page は **1ファイル**（画面定義のみ）: `src/src/pages/*.tsx`
- Page 専用 UI: `src/src/components/page/<PageName>/*`
- 複数 Page 共通 UI: `src/src/components/common/*`
- shadcn/ui 派生のプリミティブ: `src/components/ui/*`（既存資産を優先。新UI側はここを参照）
- `features/*/components` の **UI を廃止**し、`features` は **hook/repository/model** に限定する。

### 1.2 外部通信（Gateway）責務分割
- `src/src/services/api/gateway.ts`（巨大ファイル）を To-Be へ分割:
  - `src/src/services/api/httpClient.ts`（fetch wrapper: baseUrl/headers/retry/timeout/traceId）
  - `src/src/services/api/gateway/<domain>.ts`（health/search/files/generation/content/user/notifications/moderation）
  - `src/src/services/api/index.ts` で再 export
- 互換のため当面は `src/src/services/api/gateway.ts` を **barrel（再 export）** に残してもよい。

### 1.3 import/alias の整合（壊れない移行）
現状は Vite と TypeScript の alias 解釈が一致しておらず、長期的に破綻しやすい。

- 方針:
  - `@/*` は **legacy も含むルート `src/`** を指す（Vite と一致させる）
  - 新実装（旧 `src/src`）は `@/*` のような **別 alias** を付与する（例: `@app` → `src/src`）
  - 既存の `@/src/*`（= `src/src/*`）を使い続ける場合は、TS/Vite の両方で同じ解釈になるように調整する

> 最終形は「旧UI撤去後に alias を単純化」でもよいが、Refactor v2 では *旧UIを壊さずに併存* できることを優先する。

### 1.4 utils/types の重複排除
- `cn()` などの util が `src/src/lib`, `src/src/shared/utils`, `src/src/components/ui/utils` に重複しているため、**pure util は `src/src/shared/utils/*`** に集約する。
- 型定義が `src/types` と `src/src/types` に分散しているため、**参照ルールを固定**する（旧UI/新UI/サービス層の境界で衝突しないこと）。

### 1.5 旧UI→新UI の段階移行（App の切替）
- `src/App.tsx` は state ベースの画面遷移で legacy と新UIが混在している。
- FIGMAAI が作成する新ページが揃い次第、CodexAgent が **ルーティング/画面切替の配線**を新UI側へ寄せる。
  - `GeneratingPage` は `ProblemCreatePage` に統合（別 Page を作らない）
  - `ProblemViewEditPage` は Preview/Edit を同一 Page 内で切替（別 Page を作らない）

### 1.5.1 Wrapper Component の解消（完全移行）
- 現在 `src/src/pages/*` にある一部のページ（MyPage, ProblemCreatePage, LoginRegisterPage）は、旧 `src/components/*` を import するだけの **ラッパー** になっている。
- これらを **Pure New** な実装へリファクタリングする。
  - 旧コンポーネントのロジック・UI を `src/src/components/page/<PageName>/*` へ移植・分解する。
  - `src/src/pages/<PageName>.tsx` は新コンポーネントのみを import する。
  - 完了後、旧 `src/components/<PageName>.tsx` は削除候補とする。

### 1.6 MSW（通信レイヤのモック）導入
目的: **UI は常に本番APIを叩いているつもり**のまま、開発/Storybook/テストで API 通信をモックする。

- MSW は `fetch` 等を **Service Worker レベルで intercept** するため、アプリ側の API 呼び出し実装（`services/api/*`）を差し替えない。
- 「JSON import / mockApi.ts / Gateway 内の自動フォールバック」と **混在させない**（乖離の温床になる）。
- マイクロサービス前提のため、handler は **Gateway のドメイン単位**で管理し、Contract-first（先に I/F を固定）で進める。

#### MSW の配置（推奨）
```text
Edumintfrontedfigma/
 ├─ public/
 │   └─ mockServiceWorker.js          # `npx msw init public/ --save` で生成
 └─ src/
     ├─ main.tsx                      # DEV かつ有効化時のみ worker.start()
     └─ src/
         └─ mocks/
             ├─ browser.ts            # setupWorker(...)
             ├─ server.ts             # setupServer(...)（Vitest 用）
             ├─ handlers/
             │   ├─ healthHandlers.ts
             │   ├─ searchHandlers.ts
             │   ├─ contentHandlers.ts
             │   ├─ generationHandlers.ts
             │   └─ userHandlers.ts
             └─ mockData/
                 ├─ health.ts
                 ├─ search.ts
                 ├─ content.ts
                 └─ generation.ts
```

#### 起動ルール（絶対）
- **本番では起動しない**（`import.meta.env.PROD` では絶対に `worker.start()` しない）。
- DEV でも常時ONにせず、`VITE_ENABLE_MSW=true`（推奨）など **明示的なフラグ**で起動する。
- UI 側は MSW を意識した分岐を書かない（API を叩くコードは常に同一）。

#### 二重モック防止ルール（必須）
- **MSW有効時は内部モック（Gateway 内の `if (USE_MOCK_DATA)` 分岐）を必ず無効化する**。
- 実装方法（推奨）:
  - `httpClient.ts` の `USE_MOCK_DATA` 定義を変更: `API_BASE_URL.includes('localhost') && import.meta.env.VITE_ENABLE_MSW !== 'true'`
  - または、起動時に警告ログを出力し、MSW有効時は内部モックを強制的に `false` にする
- 理由: MSW と内部モックが同時に有効になると、データ不整合や予期しない挙動の原因になる

#### mockData 運用ルール
- mockData は「仕様書」として、正常系だけでなく **404/401/500/空配列/境界値** を用意する。
- handler は **実 API と同一の URL/メソッド/レスポンス形**を維持する（差分が出たら契約不整合）。

詳細: `T_MSW_GUIDE.md`

---

## 2. 非スコープ（やらないこと）
- 新規画面の UI 実装やデザイン調整（FIGMAAI の担当）
- 仕様追加（API 契約変更/新規 DB 追加）やビジネスロジック変更
- 機能追加（例: 新しいフィルター項目の実装、Admin API の新規設計確定）
- 画面遷移設計の再議論（本書では既存要件に従う）

---

## 3. 現状（As-Is）で顕在化している問題
1. **UI の散在**
   - `src/src/shared/components/*`, `src/src/components/shared/*`, `src/src/components/features/*`, `src/src/features/*/components/*` に UI が散らばる。
2. **同名コンポーネント/ユーティリティの二重化**
   - `ContextHealthAlert` が複数箇所に存在し、仕様/依存が異なる。
   - `cn()` が複数箇所に存在し、参照先がぶれる。
3. **外部通信の肥大化**
   - `src/src/services/api/gateway.ts` に多ドメインの API + mock + helper が同居。
4. **旧UI/新UIの import 経路が混線**
   - alias の解釈差や、`@/src/*` のような “相対的な新旧混在パス” が増えやすい。

---

## 4. To-Be（設計ゴール）

### 4.1 フォルダ責務（破綻しにくい分離）
- `pages`: 画面定義（1ファイル）
- `components/page`: そのページ専用 UI
- `components/common`: 全ページ共通 UI
- `features`: ロジック（hooks/repository/model）
- `services/api`: 外部通信定義（Gateway client）
- `shared/utils`: React を含まない pure util

### 4.2 依存方向（ルール）
- 依存方向（レイヤ）: `pages -> components -> features -> services/api -> shared/utils, types`
- **禁止**:
  - `features -> components`（ロジックが UI を import しない）
  - `components -> services/api`（UI が fetch/client を直呼びしない）

### 4.3 互換レイヤ（移行中の安全弁）
移行フェーズでは import 修正が膨らみやすいので、以下を許可する。
- 旧パスに **re-export だけのファイル**を残す（例: `src/src/shared/components/TopMenuBar.tsx` が `src/src/components/common/TopMenuBar.tsx` を export）
- re-export の存在期間をフェーズ単位で明確化し、最終フェーズで削除する

---

## 5. Definition of Done（完了条件）
- `src/src/features/*` 配下に UI（React コンポーネント）が存在しない
- `src/src/shared/components/*` と `src/src/components/shared/*` の二重管理が解消される（いずれかに統一）
- `src/src/services/api/*` が domain 分割され、`gateway.ts` の肥大が解消される
- Vite と TypeScript の import 解釈が一致し、`npm run build` が壊れない
- 旧UI→新UIの配線（App からの参照）が段階的に新UIへ移行し、最終的に legacy ページが参照 0 になる

---

## 6. 参照
- ディレクトリ/移行方針（最新）: `F_ARCHITECTURE.md`
- 現行実装の API 一次情報: `src/src/services/api/gateway.ts`（To-Be 分割）
- Phase 設計: `O_TASK_PHASES.md`
- CodexAgent Prompt: `Q_PROMPT.md`
