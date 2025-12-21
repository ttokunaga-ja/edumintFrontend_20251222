# MSW（Mock Service Worker）運用ガイド（Frontend）

目的: マイクロサービス前提のフロントエンド開発で、**本番コードを変えずに** API 通信を安定モックできるようにする。

参照:
- Refactor v2 要件: `Y_REFACTOR2_REQUIREMENTS.md`
- フェーズ/タスク: `O_TASK_PHASES.md`（R7）
- CodexAgent プロンプト: `Q_PROMPT.md`（R7）

---

## 1. MSW とは何か（本質）

MSW = API を「実装ごと差し替える」のではなく、`fetch` 等の通信を **Service Worker/Node レベルで intercept** して **“本物の API のふり”**をする仕組み。

- UI/Hook/Repository は **常に本番 API を叩いているつもり**で実装する
- モックは「データの import」ではなく **通信のモック**
- 本番コードに `if (mock)` のような分岐を入れない

### 他手法との違い（要点）
| 方法 | 破綻しやすい点 |
| --- | --- |
| JSON import | 同期化されず実APIと乖離しやすい |
| `mockApi.ts` | 実装が分岐し、差分が増える |
| MSW | 実API I/F を維持しやすい（Contract-firstに向く） |

---

## 2. どんなときに MSW が効くか

- バックエンド未完成
- マイクロサービス多数（Gateway 経由で多ドメイン）
- Contract-first（先に I/F を決めて UI を進める）
- Storybook / テスト / CI を安定させたい

---

## 3. 推奨ディレクトリ構造（このリポジトリ）

```text
Edumintfrontedfigma/
 ├─ public/
 │   └─ mockServiceWorker.js          # `npx msw init public/ --save` で生成
 └─ src/
     ├─ main.tsx                      # DEV かつフラグ有効時のみ MSW 起動
     └─ src/
         └─ mocks/
             ├─ browser.ts            # Service Worker 起動（DEV/Storybook）
             ├─ server.ts             # Node サーバ（Vitest）
             ├─ handlers/             # API 単位のハンドラ（Gateway ドメイン単位）
             │   ├─ healthHandlers.ts
             │   ├─ searchHandlers.ts
             │   ├─ contentHandlers.ts
             │   ├─ generationHandlers.ts
             │   └─ userHandlers.ts
             └─ mockData/             # レスポンスデータ（正常/異常/境界値）
                 ├─ health.ts
                 ├─ search.ts
                 ├─ content.ts
                 └─ generation.ts
```

> `services/api` 側に mock 実装を入れない（MSW に隔離する）。

---

## 4. 導入手順（Vite + React）

### 4.1 インストール

```bash
cd Edumintfrontedfigma
npm install -D msw
npx msw init public/ --save
```

### 4.2 `mocks/browser.ts`（Service Worker）

```ts
import { setupWorker } from 'msw/browser';
import { healthHandlers } from './handlers/healthHandlers';
import { searchHandlers } from './handlers/searchHandlers';

export const worker = setupWorker(
  ...healthHandlers,
  ...searchHandlers,
);
```

### 4.3 `src/main.tsx`（DEV のみ起動）

```ts
if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true') {
  const { worker } = await import('@/mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}
```

---

## 5. ハンドラの書き方（Gateway と同一 I/F）

### `mocks/handlers/searchHandlers.ts`（例）

```ts
import { rest } from 'msw';
import { mockSearchResponse } from '../mockData/search';

export const searchHandlers = [
  rest.get('*/search/exams', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockSearchResponse));
  }),
];
```

> URL は `*/search/exams` のようにワイルドカードにすると、`VITE_API_BASE_URL` の差分を吸収しやすい。
>
> なお MSW のバージョンによって API が異なる。最新版で `rest` が使えない場合は MSW の公式ドキュメントに従い `http` API へ読み替える。

---

## 6. テスト連携（Vitest）

- `src/src/mocks/server.ts` を用意し、`vitest.setup.ts` で `server.listen()` を行う。
- Unit テストはネットワークに依存しない（CI を安定化）。

---

## 7. 実務で破綻しない運用ルール

### ルール 1: Contract-first（mocks → api）
- まず MSW の handler/mockData で I/F を固定
- バックエンドとすり合わせ
- `services/api` の DTO/型へ反映（UI を直さない）

### ルール 2: mockData は「仕様書」
- 正常系だけでなく **404/401/500/空配列/境界値** を明示的に用意
- 画面のエラーパス（再試行/中断/Coming Soon）を安定検証できる状態にする

### ルール 3: 本番では絶対に起動しない
- `import.meta.env.PROD` で `worker.start()` を呼ばない
- `.env.production` では `VITE_ENABLE_MSW=false` を固定（推奨）

### ルール 4: 混在禁止
- `mockApi.ts` / JSON import / `services/api` 内の mock fallback と混在しない
- `VITE_ENABLE_MSW=true` のときは内部モック（`USE_MOCK_DATA`）を自動的に無効化し、MSW のみをモック手段とする（本番/DEV で二重モックを防ぐ）。抑制が発生した場合は `console.warn('MSW enabled: internal mock suppressed')` で通知。Gateway 内のモック分岐は撤去済み。

---

## 8. よくある失敗（回避策）

- 成功ケースしかない → 失敗/空/境界値を mockData に追加する
- 実APIとレスポンス構造が違う → handler と `services/api` 型を揃える（契約違反）
- 本番で worker を起動 → `DEV && VITE_ENABLE_MSW` を必須条件にする
