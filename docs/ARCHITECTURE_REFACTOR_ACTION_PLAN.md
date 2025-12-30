# アーキテクチャ・リファクタリング実行計画（Action Plan）

**作成日**: 2025-12-30  
**対象**: edumintFrontend  
**参照ドキュメント**: `docs/F_ARCHITECTURE.md`, `docs/G_TECH_STACK_CONSTRAINTS.md`

---

## 1. 違反・問題点の特定

### A. 違反レベル 🔴 **Critical** (必須修正)

#### A1. `src/hooks/` の配置ミス
**現状**:
- `src/hooks/useGenerationPhase.ts`
- `src/hooks/useStructurePhase.ts`
- `src/hooks/useWebSocket.ts`
- `src/hooks/useServiceHealth.ts`

**問題**:
- これらのフックは `generation` ドメインロジックを含む（API呼び出し、状態遷移）
- F_ARCHITECTURE.md では「Features の Hooks 内に実装」と規定
- **依存違反**: `Components/Pages` → `Hooks` → `Features` (逆向き)

**正すべき状態**:
- `src/features/generation/hooks/` に移動
- ドメイン固有フック (`useGenerationPhase`, `useStructurePhase`, `useWebSocket`) を統合
- 汎用フック (`useServiceHealth`) は `src/hooks/` に残す

---

#### A2. `src/features/generation/` の構造混乱
**現状**:
- `store.ts` (useReducer ベース)
- `stores/generationStore.ts` (Zustand ベース)
- 両方存在 → **重複・混乱**

**問題**:
- 状態管理ライブラリの統一欠如
- どちらを使うかが不明確
- テスト設定が複雑化

**正すべき状態**:
- Zustand を選定（既存: `stores/generationStore.ts` が採用されている）
- `store.ts` を削除し、`stores/generationStore.ts` に統一
- `stores/` の直下のすべての Store ファイルを一元化

---

#### A3. Pages の責務超過
**現状**:
- `src/pages/StructureConfirmPage.tsx` 
- `src/pages/ProfileSetupPage.tsx`
  - これらは「暫定実装」で、ロジック部分を `./StructureConfirmPage/hooks/` のような局所フックに依存

**問題**:
- Pages 配下に hooks ディレクトリを作成 → 階層構造混乱
- ロジックが Features に統合されていない
- Pages がフラット構造でないと、ルーティングが複雑化する

**正すべき状態**:
- ロジック (`useStructureConfirm`, `useProfileSetupForm`) を `src/features/user/hooks/` に移動
- Pages はロジックに依存せず、純粋なルーティング定義のみ
- `src/pages/` は全てフラット `.tsx` ファイルのみ

---

### B. 違反レベル 🟡 **Moderate** (推奨修正)

#### B1. Services/API の役割不明確
**現状**:
- `src/services/api/httpClient.ts` - Axios 設定ユーティリティ
- `src/services/api/index.ts` - 不明確（内容確認が必要）
- 実際の API 定義は `features/*/hooks/` で宣言的に実装

**問題**:
- F_ARCHITECTURE.md では「API定義は `services/api/endpoints.ts`」と規定
- 現状は `features` 内 hooks で直接 API 呼び出し
- Endpoints の集約定義がない

**推奨修正**:
- `src/services/api/endpoints.ts` を作成し、全 API エンドポイント定数を一元化
- `src/services/api/httpClient.ts` → `src/lib/httpClient.ts` に移動（ライブラリ設定層）
- Features のフックから参照する

---

#### B2. Theme ファイルの重複/混乱
**現状**:
- `src/theme/createTheme.ts` - 最新版（正しい実装）
- `src/theme/theme.ts` - 古い実装？重複?
- `src/theme/ThemeProvider.tsx` - 古い実装?
- `src/theme/tokens.ts` - グローバル色定義?

**問題**:
- ファイルの役割分担が不明確
- 複数の theme 初期化パターンが存在

**推奨修正**:
- `createTheme.ts` を主流とする
- `theme.ts`, `ThemeProvider.tsx`, `tokens.ts` が冗長な場合は削除
- 色定義は `createTheme.ts` 内に統合

---

#### B3. 未使用ページの存在
**現状**:
- `src/pages/StructureConfirmPage.tsx` - ルーティングに登録されていない？
- `src/pages/ProfileSetupPage.tsx` - ルーティングに登録されていない?
- router.tsx で確認が必要

**推奨修正**:
- ルーティング登録がない場合は削除
- または LocalStorage などで暫定として保留

---

### C. 違反レベル 🟢 **Minor** (オプション)

#### C1. Styles / CSS の最小化
**現状**:
- `src/styles/globals.css` - グローバルスタイル（MUI Theme で代替可能）

**推奨修正**:
- CSS の内容を確認し、MUI Theme オーバーライドに統合
- CSS ファイルが不要なら削除

---

## 2. 実行計画（順序重要）

### Phase 1: 依存関係の整理 (Critical)

#### Step 1.1: `src/features/generation/` の Store 統一
```
【Action】
1. src/features/generation/store.ts の内容を確認
2. src/features/generation/stores/generationStore.ts と比較
3. Zustand を採用し、store.ts 削除
4. generationStore.ts が全ロジックを含むことを確認

【影響範囲】
- src/features/generation/ 内の全 hooks
- テスト: tests/ で「store」「Store」「generationStore」を検索し、パスを更新
```

#### Step 1.2: Hooks の Features へ移動
```
【Action】
1. src/hooks/ の以下を src/features/generation/hooks/ へ移動:
   - useGenerationPhase.ts
   - useStructurePhase.ts
   - useWebSocket.ts

2. src/hooks/ に残す:
   - useServiceHealth.ts （ドメイン独立）

【依存関係更新】
- Components / Pages から の imports:
  `src/hooks/useGenerationPhase` → `src/features/generation/hooks/useGenerationPhase`
  他同様

【テスト更新】
- tests/ 内の import path を更新
```

#### Step 1.3: Pages の純粋化
```
【Action】
1. StructureConfirmPage, ProfileSetupPage から locals hooks を削除

2. ロジックを Features に統合:
   - useStructureConfirm → src/features/generation/hooks/ へ
   - useProfileSetupForm → src/features/user/hooks/ へ

3. Pages を機能コンポーネントに:
   - ロジックの依存を削除
   - Features hooks を直接利用するように修正

【ファイル操作】
- DELETE: src/pages/StructureConfirmPage/hooks/
- DELETE: src/pages/ProfileSetupPage/hooks/
- UPDATE: src/pages/StructureConfirmPage.tsx
- UPDATE: src/pages/ProfileSetupPage.tsx
```

---

### Phase 2: サービス層の整理 (Moderate)

#### Step 2.1: API Endpoints の一元化
```
【Action】
1. CREATE: src/services/api/endpoints.ts
   - 全 API endpoint URLs を定数化
   - 例:
     export const ENDPOINTS = {
       auth: { login: '/auth/login', register: '/auth/register' },
       content: { list: '/problems', detail: (id) => `/problems/${id}` },
       ...
     }

2. Features hooks の修正:
   - import { ENDPOINTS } from '@/services/api/endpoints'
   - fetch(`${API_BASE_URL}${ENDPOINTS.content.detail(id)}`, ...)
```

#### Step 2.2: httpClient のライブラリ化
```
【Action】
1. src/services/api/httpClient.ts → src/lib/httpClient.ts へ移動

2. src/services/api/ を簡潔化:
   - index.ts: endpoints export のみ
   - endpoints.ts: API definitions のみ

3. Import path 更新:
   他ファイルで import する場合、src/lib/httpClient から参照
```

---

### Phase 3: Theme の統一 (Minor)

#### Step 3.1: Theme ファイル整理
```
【Action】
1. src/theme/theme.ts, ThemeProvider.tsx, tokens.ts の内容を確認
2. 以下いずれかを実施:
   a) createTheme.ts に統合 → 不要なファイルは削除
   b) 役割分担が明確な場合 → 現状維持

3. components.ts/palette.ts など、細分化した定義がある場合:
   - createTheme 内に統合するか
   - 現状維持するか（で性能・保守性が向上）を判定
```

---

### Phase 4: テスト修正 (All phases)

#### Step 4.1: Import Path 修正
```
【Action】
1. tests/ 配下全ファイルを検索:
   - '@/hooks/useGeneration' → '@/features/generation/hooks/useGeneration'
   - '@/features/generation/store' → '@/features/generation/stores/generationStore'
   - '@/services/api/httpClient' → '@/lib/httpClient' (移動した場合)

2. テスト実行:
   npm run test → 全テスト通過確認
```

#### Step 4.2: 新規テスト追加
```
【Action】
1. Features に移動したロジックのテスト確認:
   - useStructureConfirm.test.ts (ない場合は作成)
   - useProfileSetupForm.test.ts (ない場合は作成)

2. Store 統一後:
   - generationStore.test.ts 作成
```

---

## 3. 依存関係マップ（修正後のイメージ）

```
Pages (ルーティング定義のみ)
  ↓
Components (UIレンダリング)
  ↓
Features (ドメインロジック, Hooks)
  ├─ hooks/ (API call, state)
  ├─ stores/ (Zustand state)
  ├─ types/ (ドメイン型)
  └─ api.ts (Feature固有API定義)
  ↓
Services (API endpoint definitions)
  ├─ api/endpoints.ts
  └─ api/types.ts
  ↓
Lib (ライブラリ設定)
  ├─ axios.ts
  ├─ httpClient.ts ← 移動
  ├─ query-client.ts
  └─ i18n.ts
```

---

## 4. リスク評価

| フェーズ | リスク | 対策 |
|---------|--------|------|
| Phase 1 (Store統一) | 既存コードとの不整合 | Git branch で実施、テスト必須 |
| Phase 1 (Hooks移動) | Import path 漏れ | grep で全検索確認 |
| Phase 2 (Endpoints化) | 中規模変更 | 段階的に実施 |
| Phase 3 (Theme統一) | UI崩れ | ビルド後ビジュアル確認 |
| Phase 4 (テスト修正) | テスト漏れ | 全テスト通過確認 |

---

## 5. 実行予定

### 実施順序
1. **Phase 1** (Critical, 高優先度) → **本日中**
2. **Phase 2** (Moderate, 中優先度) → **翌日**
3. **Phase 3** (Minor, 低優先度) → **要検証後**
4. **Phase 4** (テスト全体) → **各フェーズ後に逐次**

### 各フェーズの目安時間
- Phase 1: 1-2時間（移動、import修正）
- Phase 2: 1時間（endpoints化、httpClient移動）
- Phase 3: 0.5時間（theme整理）
- Phase 4: 1時間（テスト修正・実行）

---

## 6. 成功条件

- ✅ `npm run typecheck` 0 errors
- ✅ `npm run build` 成功（サイズ増加なし）
- ✅ `npm run test` 全テスト合格 (15/15)
- ✅ F_ARCHITECTURE.md の依存ルール遵守確認
- ✅ 各フェーズの変更内容を IMPLEMENTATION_REPORT に記録

---

**次ステップ**: 本実行計画の承認を得た後、Phase 1 より着手します。

