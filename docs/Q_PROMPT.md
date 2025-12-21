# Q_PROMPT（Refactor v2 / CodexAgent）

本ファイルは CodexAgent が **Refactor v2（ディレクトリ再編・旧UI→新UI移行の配線整理）** を実行するためのプロンプト集。

- 要件/方針（何を直すか）: `Y_REFACTOR2_REQUIREMENTS.md`
- タスク/フェーズ（何をいつやるか）: `O_TASK_PHASES.md`
- 実装レポート: `P_IMPLEMENT_REPORT_FMT.md`

> 注意: UI の実装・デザイン変更は FIGMAAI 担当。CodexAgent は **移動・import整備・互換レイヤ・設定整備・配線** のみ行う。

---

## 0. 使い方

- 1フェーズ=1プロンプトで実行する（R1→R2→…の順）。
- 各フェーズ完了時に `Edumintfrontedfigma/src/reports/phase_R<no>_report.md` を `P_IMPLEMENT_REPORT_FMT.md` 形式で出力する。
- フェーズ途中で方針変更が必要になったら、まず `Y_REFACTOR2_REQUIREMENTS.md` と `O_TASK_PHASES.md` を更新してから実装する。

---

## 1. 共通ルール（全フェーズ共通）

- 原則: **小さく安全に**（1フェーズのPRは「移動 + import修正 + shim」まで）
- ファイル移動は `git mv` を使う（履歴保持・差分最小化）
- 互換のため、移動直後は旧パスに **re-export shim** を残す（最終フェーズで削除）
- レイヤ依存（強制）: `pages -> components -> features -> services/api -> shared/utils, types`
  - 禁止: `features -> components`、`components -> services/api`（UIがclient直呼びしない）
- UI 変更禁止: 見た目/挙動の変更・新UI追加は行わない（必要なら stub のみ）
- 検証: 各フェーズで少なくとも `npm -C Edumintfrontedfigma run build` を通す

---

## 2. 共通検証コマンド（推奨）

- `npm -C Edumintfrontedfigma run build`
- `npm -C Edumintfrontedfigma/src run build`（tsc を含む検証が必要な場合）
- `rg -n "<pattern>" Edumintfrontedfigma/src`（import 置換の漏れ検出）

---

## 3. フェーズ別プロンプト

---

### Prompt: P0（二重モック防止：最小安全策）

```markdown
あなたは CodexAgent です。Refactor v2 の Phase P0 を実装してください。目的は「MSW有効時に内部モック（`USE_MOCK_DATA`）を強制OFFにし、混在によるデータ不整合を防ぐ」ことです。

## 目的
- MSW と内部モック（Gateway 内の `if (USE_MOCK_DATA)` 分岐）が同時に有効になることを防ぐ
- 開発環境で MSW を使う場合、内部モックは無条件で無効化する

## 制約
- 本番コードに悪影響を与えない（MSW 無効時は従来通り動作）
- Gateway の実装を大きく変更しない（P1 で本格的に撤去する）

## タスク（ID）
- P0-1: `src/src/services/api/httpClient.ts` の `USE_MOCK_DATA` 定義を修正する:
  - 現状: `export const USE_MOCK_DATA = API_BASE_URL.includes('localhost');`
  - 修正後: `export const USE_MOCK_DATA = API_BASE_URL.includes('localhost') && import.meta.env.VITE_ENABLE_MSW !== 'true';`
  - または: MSW有効時に警告ログを出力する（`console.warn('MSW enabled: internal mock disabled')`）
- P0-2: 動作確認:
  - `VITE_ENABLE_MSW=true` 時に `USE_MOCK_DATA` が `false` になることをログ出力で確認
  - Gateway 内の `if (USE_MOCK_DATA)` ブロックが実行されないことを確認
- P0-3: ドキュメント更新:
  - `T_MSW_GUIDE.md` に「MSW有効時は内部モック自動無効化」のルールを追記
  - `J_ENV_VARS_REGISTRY.md` の `VITE_USE_MOCK_DATA` の説明を更新（「MSW導入後は非推奨」等）

## 完了条件（DoD）
- `VITE_ENABLE_MSW=true` 時に `USE_MOCK_DATA` が `false` になる
- `npm -C /mnt/c/Users/is0732hk/develop/Edumintfrontedfigma run build` が通る
- DEV環境で動作確認し、MSW の handler が優先されることを確認

## 検証
- `npm -C /mnt/c/Users/is0732hk/develop/Edumintfrontedfigma run build`
- DEV環境で `.env.local` に `VITE_ENABLE_MSW=true` を設定し、ブラウザコンソールでログ確認

## 出力
- `Edumintfrontedfigma/src/reports/phase_P0_report.md` を `P_IMPLEMENT_REPORT_FMT.md` 形式で作成する
```

---

### Prompt: P1（VITE_USE_MOCK_DATA 分岐の撤去/無害化）

```markdown
あなたは CodexAgent です。Refactor v2 の Phase P1 を実装してください。目的は「Gateway 内の `USE_MOCK_DATA` 分岐を削除し、モックは MSW のみに一本化する」ことです。

## 目的
- Gateway から内部モック実装を完全に削除する
- Gateway は常に実 API を叩く実装にする（モックは MSW が通信レイヤで intercept）
- `USE_MOCK_DATA` 変数を廃止または `false` 固定にする

## 制約
- MSW handlers に不足がある場合は、先に handler を追加する（Gateway から削除したロジックを移植）
- 削除は段階的に行い、各 domain ごとにコミットを分ける（rollback しやすくする）

## タスク（ID）
- P1-1: MSW handlers の網羅性を確認する:
  - Gateway で実装されているモックロジック（`if (USE_MOCK_DATA)` 内）を全て抽出
  - MSW handlers に対応する endpoint が存在するか確認
  - 不足している場合は `src/src/mocks/handlers/*Handlers.ts` と `mockData/*` に追加
- P1-2: Gateway から `USE_MOCK_DATA` 分岐を削除する:
  - 削除対象ファイル: `gateway/generation.ts` (6箇所)、`gateway/search.ts` (2箇所)、`gateway/notifications.ts` (5箇所)、`gateway/user.ts` (3箇所)、`gateway/health.ts`、`gateway/content.ts`、`gateway/files.ts`
  - 各ファイルから `if (USE_MOCK_DATA) { ... }` ブロックを削除
  - `mockDelay()`, `getMockExams()`, `getMockComments()` の呼び出しも削除
- P1-3: `src/src/services/api/httpClient.ts` から `USE_MOCK_DATA` 関連を削除:
  - `export const USE_MOCK_DATA = ...` の行を削除
  - `mockDelay()`, `getMockExams()`, `getMockComments()` の関数定義を削除（または別ファイルへ移動）
  - `import { mockExamData, mockComments } from '@/lib/mockExamData';` を削除
- P1-4: 環境変数ドキュメントを更新:
  - `J_ENV_VARS_REGISTRY.md` の `VITE_USE_MOCK_DATA` を「廃止」または「互換用・将来削除予定」に変更

## 完了条件（DoD）
- Gateway ファイルに `USE_MOCK_DATA` の参照が存在しない
- `npm -C /mnt/c/Users/is0732hk/develop/Edumintfrontedfigma run build` が通る
- DEV環境で `VITE_ENABLE_MSW=true` 時に、ブラウザの Network タブで API リクエストが発行され、MSW が intercept していることを確認

## 検証
- `npm -C /mnt/c/Users/is0732hk/develop/Edumintfrontedfigma run build`
- `grep -rn "USE_MOCK_DATA" /mnt/c/Users/is0732hk/develop/Edumintfrontedfigma/src/src/services/api/gateway/` が 0 件であること
- `grep -rn "mockDelay\|getMockExams\|getMockComments" /mnt/c/Users/is0732hk/develop/Edumintfrontedfigma/src/src/services/api/gateway/` が 0 件であること
- DEV環境で MSW を有効にし、ブラウザで API 通信が正常に動作することを確認

## Rollback
- git revert で P1 のコミットを取り消す
- MSW handlers に不足があった場合は、該当 handler を追加してから再実行

## 出力
- `Edumintfrontedfigma/src/reports/phase_P1_report.md` を `P_IMPLEMENT_REPORT_FMT.md` 形式で作成する
```

---

### Prompt: R0（現状棚卸し / 移動マップ確定）

```markdown
あなたは CodexAgent です。`Y_REFACTOR2_REQUIREMENTS.md` と `O_TASK_PHASES.md` を根拠に、Refactor v2 の「移動マップ」を実装可能な状態まで確定してください。

## 目的
- 実装を壊さずに進めるため、移動対象・重複実体・import パターンを確定する。

## 制約
- コードの挙動変更は禁止（調査・ドキュメント更新のみ可）。
- ここではファイル移動や alias 変更は行わない。

## タスク
1. `src/src/` 内の以下を棚卸しし、`O_TASK_PHASES.md` の移動マップが現状と一致するか確認する:
   - `src/src/shared/components/*`
   - `src/src/components/shared/*`
   - `src/src/components/features/*`
   - `src/src/features/*/components/*`
2. 重複実体（同名/同責務）を検出し、どれを正にするか判断する（例: `ContextHealthAlert`, `FileUploadQueue`, `ui/*`）。
3. 「どの `vite.config.ts` / `package.json` が実際に使われているか」を確認し、以後フェーズの検証コマンドを確定する。

## 完了条件
- `O_TASK_PHASES.md` の移動マップが最新の現状に合っている（必要なら更新済み）。
- 重複実体の「正」を決め、次フェーズで shim 化できる状態。

## 出力
- `Edumintfrontedfigma/src/reports/phase_R0_report.md` を `P_IMPLEMENT_REPORT_FMT.md` 形式で作成する（Status は COMPLETED か BLOCKED）。
```

---

### Prompt: R1（import/alias 整合：`@` と `@app` の導入）

```markdown
あなたは CodexAgent です。Refactor v2 の Phase R1 を実装してください。目的は「TypeScript と Vite の import 解釈を一致させ、`@`/`@app` を安全に使い分ける」ことです。

## 目的
- `@/*` は `Edumintfrontedfigma/src/*`（legacy を含むルート）へ統一する
- 新実装ルート（`Edumintfrontedfigma/src/src/*`）は `@/*` で参照できるようにする
- 既存の `@/src/*` は引き続き動く状態にする

## 制約
- UI 変更禁止（import/設定/型解決のみ）。
- 破壊的変更は禁止（段階移行。必要なら shim を追加）。

## タスク（ID）
- R1-1: `Edumintfrontedfigma/src/tsconfig.json` の `compilerOptions.paths` を調整する。
  - 期待する形（例）:
    - `@/*` → `./*`（= `Edumintfrontedfigma/src/*`）
    - `@/*` → `./src/*`（= `Edumintfrontedfigma/src/src/*`）
- R1-2: `Edumintfrontedfigma/vite.config.ts` に `@app` alias を追加する（`Edumintfrontedfigma/src/src` を指す）。
- R1-3: `src/src` 配下の import を段階置換する。
  - `@/types/*`, `@/contexts/*`, `@/hooks/*`, `@/services/*`, `@/shared/*`, `@/features/*`, `@/pages/*` など「新実装を指していた `@`」は `@/*` へ置換する
  - `@/components/ui/*` のように「legacy ルートの共有UI」を指すものは `@/*` のまま維持する

## 完了条件
- IDE/tsc と Vite が同一の実体ファイルを参照する（alias mismatch がない）
- `npm -C Edumintfrontedfigma run build` が通る

## 検証
- `npm -C Edumintfrontedfigma run build`
- `rg -n \"@/types|@/contexts|@/hooks|@/services|@/shared|@/features|@/pages\" Edumintfrontedfigma/src/src` で置換漏れがないこと

## 出力
- `Edumintfrontedfigma/src/reports/phase_R1_report.md` を `P_IMPLEMENT_REPORT_FMT.md` 形式で作成する
```

---

### Prompt: R2（UI を `src/src/components/` に集約：common / page）

```markdown
あなたは CodexAgent です。Refactor v2 の Phase R2 を実装してください。目的は「UI を `src/src/components/common` と `src/src/components/page/*` に集約し、旧パスは re-export shim にする」ことです。

## 目的
- UI の実体を `src/src/components/common/*` と `src/src/components/page/<PageName>/*` に集約する
- 旧配置（`src/src/shared/components`, `src/src/components/shared`, `src/src/components/features`, `src/src/features/*/components`）は互換のため re-export shim にする

## 制約
- UI の見た目/挙動は変えない（移動と import 修正のみ）。
- ファイル移動は `git mv` を使う。

## タスク（ID）
- R2-1: `O_TASK_PHASES.md` の「移動マップ」に従い、common 対象を `src/src/components/common/*` へ `git mv` する。
- R2-2: page 対象を `src/src/components/page/<PageName>/*` へ `git mv` する（HomePage / ProblemCreatePage / ProblemViewEditPage / MyPage）。
- R2-3: 移動元には re-export shim を残す（例: `export * from '...'; export { default } from '...';`）。
- R2-4: import を新パスへ修正する（可能なら `@/components/...` を使用）。

## 完了条件
- UI 実体は `components/common` と `components/page/*` に集約される
- 旧パスは shim のみ（実体を持たない）
- `npm -C Edumintfrontedfigma run build` が通る

## 出力
- `Edumintfrontedfigma/src/reports/phase_R2_report.md` を `P_IMPLEMENT_REPORT_FMT.md` 形式で作成する
```

---

### Prompt: R3（features から UI を排除：hook/repository/model 化）

```markdown
あなたは CodexAgent です。Refactor v2 の Phase R3 を実装してください。目的は「`features` から UI を排除し、ロジック層（hooks/repository/models）に限定する」ことです。

## 目的
- `src/src/features/**` から React UI コンポーネント（`.tsx` の UI）を排除する
- UI は `src/src/components/**` へ置く
- UI が API client を直呼びしない構造（repository/hooks 経由）にする

## 制約
- UI の見た目/挙動は変えない（依存方向の整理のみ）。
- 大きなリネームは避ける（移動 + export + import 修正）。

## タスク（ID）
- R3-1: `src/src/features/*/components` に残った UI を `src/src/components/page/*` または `src/src/components/common/*` へ移動する（R2 で漏れた分の回収）。
- R3-2: `features/<domain>/repository.ts`（API 呼び出しの薄い層）と `features/<domain>/hooks/*`（UI から使う hook）を整備する。
- R3-3: 依存方向違反がない状態にする（`features -> components`、`components -> services/api` を禁止）。

## 完了条件
- `find Edumintfrontedfigma/src/src/features -name '*.tsx'` で UI コンポーネントが残っていない（hooks の ts/tsx は許容するが UI は不可）
- `npm -C Edumintfrontedfigma run build` が通る

## 出力
- `Edumintfrontedfigma/src/reports/phase_R3_report.md` を `P_IMPLEMENT_REPORT_FMT.md` 形式で作成する
```

---

### Prompt: R4（services/api 分割：gateway.ts → httpClient + domain modules）

```markdown
あなたは CodexAgent です。Refactor v2 の Phase R4 を実装してください。目的は「`services/api/gateway.ts` を domain 別 client に分割し、互換のために barrel を残す」ことです。

## 目的
- `src/src/services/api/httpClient.ts` を新設し、fetch の共通処理を集約する
- `src/src/services/api/gateway/<domain>.ts` に domain 別 API を分離する
- `src/src/services/api/index.ts` を公開窓口にし、既存 import を壊さない

## 制約
- API 契約の変更は禁止（構造整理のみ）。
- 既存 import を壊さないため、当面 `gateway.ts` は re-export で残す。

## タスク（ID）
- R4-1: `httpClient.ts` を作成（baseUrl/headers/timeout/retry/ApiError をここへ）。
- R4-2: `gateway/health.ts`, `gateway/search.ts`, `gateway/files.ts`, `gateway/generation.ts`, `gateway/content.ts`, `gateway/user.ts`（必要なら他も）を作成し、既存 `gateway.ts` の関数を移設する。
- R4-3: `services/api/index.ts` から re-export する。互換のため `services/api/gateway.ts` は barrel にする。

## 完了条件
- `gateway.ts` が肥大していない（thin barrel）
- `npm -C Edumintfrontedfigma run build` が通る

## 出力
- `Edumintfrontedfigma/src/reports/phase_R4_report.md` を `P_IMPLEMENT_REPORT_FMT.md` 形式で作成する
```

---

### Prompt: R5（utils/types 重複排除：参照ルール固定）

```markdown
あなたは CodexAgent です。Refactor v2 の Phase R5 を実装してください。目的は「utils/types の二重化を解消し、参照ルールを固定する」ことです。

## 目的
- `cn()` 等の pure util を `src/src/shared/utils/*` に統一する
- 型の参照ルールを固定し、旧UI・新UIの混線を防ぐ（例: 新実装は `@/types/*`）

## 制約
- 挙動変更は禁止（参照先の統一のみ）。
- 大量リネームは避ける（shim を使う）。

## タスク（ID）
- R5-1: `src/src/shared/utils/*` に正の util を置き、`src/src/lib/utils.ts` / `src/src/components/ui/utils.ts` の重複実体を shim 化または削除する。
- R5-2: 型の import を `@/types/*`（新実装）と `@/types/*`（legacy）で整理する。

## 完了条件
- `rg -n \"function cn\\(|export function cn\\(\" Edumintfrontedfigma/src` で実体が 1 箇所に統一される
- `npm -C Edumintfrontedfigma run build` が通る

## 出力
- `Edumintfrontedfigma/src/reports/phase_R5_report.md` を `P_IMPLEMENT_REPORT_FMT.md` 形式で作成する
```

---

### Prompt: R6（App 配線の段階移行：旧UI参照 0 へ & Wrapper 解消）
 
 ```markdown
 あなたは CodexAgent です。Refactor v2 の Phase R6 を実装してください。目的は「App の参照先を新UIへ寄せ、Wrapper 状態のページをリファクタリングして旧UIを退役できる状態にする」ことです。
 
 ## 目的
 - Legacy Wrapper（`src/components/*` を import している新ページ）を解消する
 - `MyPage`, `LoginRegisterPage`, `ProblemCreatePage` を Pure New な実装にする
 - `GeneratingPage` を `ProblemCreatePage` に統合する
 
 ## 制約
 - UI の見た目/挙動は変えない（ロジックの移植・分解のみ）。
 - 一度に全部やらず、ページ単位でコミット/検証を行うこと。
 
 ## タスク（ID）
 - R6-1: `src/App.tsx` の import を点検し、全て `@/pages/*` 経由になっているか確認する（なってなければ直す）。
 - R6-2: **MyPage の Wrapper 解消**:
   - `src/components/MyPage.tsx` の内容を読み解き、`src/src/components/page/MyPage/` 配下にコンポーネントを分解・移植する。
   - `src/src/pages/MyPage.tsx` を書き換え、新コンポーネントを組み合わせて実装する。
 - R6-3: **LoginRegisterPage の Wrapper 解消**:
   - `src/components/LoginPage.tsx` の内容を `src/src/components/page/LoginRegisterPage/` 配下に移植する。
   - `src/src/pages/LoginRegisterPage.tsx` を書き換える。
 - R6-4: **ProblemCreatePage の Wrapper 解消（難易度高）**:
   - `src/components/ProblemCreatePage.tsx` と `src/components/GeneratingPage.tsx` のロジックを統合する。
   - 入力フェーズと生成中フェーズを管理する state を `src/src/pages/ProblemCreatePage.tsx` に持ち、表示コンポーネントを切り替える。
 - R6-5: 参照がなくなった旧ファイル（`src/components/MyPage.tsx` 等）を削除する。
 
 ## 完了条件
 - `src/src/pages/*` ファイル内で `../../components` (Legacy) への import が存在しない
 - `npm -C Edumintfrontedfigma run build` が通る
 - アプリの主要フロー（ログイン、マイページ、作成）が動作する
 
 ## 出力
 - `Edumintfrontedfigma/src/reports/phase_R6_report.md` を `P_IMPLEMENT_REPORT_FMT.md` 形式で作成する
 ```

---

### Prompt: R7（MSW 導入：通信レイヤのモック）

```markdown
あなたは CodexAgent です。Refactor v2 の Phase R7 を実装してください。目的は「本番コードを変えずに、DEV/Storybook/Vitest で API 通信を安定モックできる状態」を作ることです。

## 目的
- MSW により `fetch` を Service Worker/Node レベルで intercept し、UI は常に本番APIを叩いているつもりで動く
- `mockApi.ts` / JSON import / Gateway 内の自動フォールバックと混在させない（差分の温床）
- handler は Gateway のドメイン単位（health/search/content/generation/user...）で管理する

## 制約
- 本番では絶対に MSW を起動しない（`import.meta.env.PROD` で `worker.start()` 禁止）。
- UI 側にモック用分岐を追加しない（MSW は通信横取りのみ）。

## タスク（ID）
- R7-1: `msw` を devDependency に追加する（必要なら lockfile も更新）。
- R7-2: `public/mockServiceWorker.js` を生成する（`npx msw init public/ --save` をプロジェクトルートで実行）。
- R7-3: `src/src/mocks/` を新設し、最低限の骨格を作る:
  - `src/src/mocks/browser.ts`（`setupWorker(...handlers)`）
  - `src/src/mocks/server.ts`（`setupServer(...handlers)`：Vitest 用）
  - `src/src/mocks/handlers/*Handlers.ts`
  - `src/src/mocks/mockData/*`（正常系/異常系/境界値）
- R7-4: `src/main.tsx` で **DEV かつ明示フラグ有効時のみ** worker を起動する。
  - 推奨: `if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true') { ... }`
- R7-5: 主要 endpoint の handler を先に定義し、Contract-first を回す（`services/api` の I/F と一致させる）。
- R7-6: Vitest で `server.listen/close/resetHandlers` が走るようにセットアップする（`vitest.setup.ts` 等に統合）。

## 完了条件
- DEV で `VITE_ENABLE_MSW=true` のときだけ MSW が起動し、API がモックされる
- PROD では MSW が起動しない
- `npm -C Edumintfrontedfigma run build` が通る
- テスト（ある場合）が安定する（ネットワーク依存が消える）

## 出力
- `Edumintfrontedfigma/src/reports/phase_R7_report.md` を `P_IMPLEMENT_REPORT_FMT.md` 形式で作成する
```
