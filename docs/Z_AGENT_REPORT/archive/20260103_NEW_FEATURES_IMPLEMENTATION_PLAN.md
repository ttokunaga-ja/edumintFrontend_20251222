# 新Features 実装計画書（After Phase 0-3）

**作成日**: 2025-12-30  
**アーキテクチャバージョン**: v1.0 (Phase 0-3完了後)  
**実装基準**: F_ARCHITECTURE.md 完全準拠

---

## 1. 新Features実装戦略

### 方針

すべての新Features実装は以下のアーキテクチャに**厳密に準拠**します：

```
Pages (ルーティング定義)
  ↓
Components (UIレンダリング)
  ↓
Features (ドメインロジック)
  ├─ hooks/ (ビジネスロジック、API call)
  ├─ stores/ (Zustand - グローバル状態)
  ├─ types/ (ドメイン型定義)
  └─ components/ (Feature内UI)
  ↓
Services (API定義)
  └─ api/endpoints.ts (URL集約)
  ↓
Lib (ユーティリティ)
  ├─ httpClient.ts (API通信)
  ├─ utils.ts (ヘルパー関数)
  └─ 設定ファイル
```

### Feature実装チェックリスト

新Features作成時は以下を必須実装：

- [ ] **Feature folder structure**
  ```
  src/features/{featureName}/
    ├─ index.ts (barrel export)
    ├─ types.ts (ドメイン型)
    ├─ hooks/ (useXxx hook - ビジネスロジック)
    ├─ stores/ (Zustand store - グローバル状態)
    ├─ components/ (Feature UI components)
    └─ api.ts (Feature固有API call - 必要に応じて)
  ```

- [ ] **Types definition** (Zod schema + TypeScript)
  ```typescript
  // types.ts
  import { z } from 'zod';
  
  export const SearchQuerySchema = z.object({
    keyword: z.string().min(1),
    filters: z.record(z.unknown()).optional(),
  });
  
  export type SearchQuery = z.infer<typeof SearchQuerySchema>;
  export type SearchResult = { /* ... */ };
  ```

- [ ] **Zustand store** (グローバル状態が必要な場合)
  ```typescript
  // stores/searchStore.ts
  import { create } from 'zustand';
  
  interface SearchState {
    results: SearchResult[];
    isLoading: boolean;
    error: Error | null;
    setResults: (results: SearchResult[]) => void;
  }
  
  export const useSearchStore = create<SearchState>((set) => ({
    results: [],
    isLoading: false,
    error: null,
    setResults: (results) => set({ results }),
  }));
  ```

- [ ] **Custom hooks** (ビジネスロジック)
  ```typescript
  // hooks/useSearch.ts
  import { useState } from 'react';
  import { ENDPOINTS } from '@/services/api/endpoints';
  import { getHeaders, handleResponse } from '@/lib/httpClient';
  
  export function useSearch() {
    const [results, setResults] = useState<SearchResult[]>([]);
    
    const search = async (query: SearchQuery) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}${ENDPOINTS.search.problems}?q=${query.keyword}`,
          { headers: getHeaders() }
        );
        const data = await handleResponse<SearchResult[]>(response);
        setResults(data);
      } catch (error) {
        // handle error
      }
    };
    
    return { results, search };
  }
  ```

- [ ] **Components** (Feature内UI)
  ```typescript
  // components/SearchResults.tsx
  export function SearchResults({ results, isLoading }: Props) {
    if (isLoading) return <Skeleton />;
    return <div>{/* render results */}</div>;
  }
  ```

- [ ] **Tests** (vitest)
  ```
  tests/features/{featureName}/
    ├─ {featureName}.test.ts
    ├─ hooks.test.ts (custom hooks)
    └─ store.test.ts (Zustand store)
  ```

- [ ] **Documentation**
  - Feature概要 (README.mdまたはコード内docstring)
  - APIエンドポイント参照
  - ユースケース (R_USE_CASES.md に追記)

---

## 2. 推奨実装順序（優先度順）

### Phase 4: Core Business Features

#### 4.1 **Search Feature の拡張** (優先度: HIGH)

**現状**: 
- `src/features/search/` 存在
- models.ts, repository.ts のみ
- hooks や components なし

**実装内容**:
1. **Types & Schema**
   - `SearchQuery` (keyword, filters, pagination)
   - `SearchResult` (exam, reading等複数型対応)

2. **Custom Hooks**
   - `useSearch()` - キーワード検索
   - `useSearchFilters()` - フィルタ管理
   - `useSearchPagination()` - ページネーション

3. **Zustand Store**
   - `useSearchStore` - 検索結果のグローバル状態

4. **Components**
   - `SearchBar.tsx` - 入力フィールド
   - `SearchResults.tsx` - 結果表示
   - `SearchFilters.tsx` - フィルタUI

5. **Endpoints**
   - `ENDPOINTS.search.problems(query, filters, page)` 確認
   - `ENDPOINTS.search.readings(query, page)` 確認

**依存**: 
- D_INTERFACE_SPEC.md (API仕様)
- useHealthCheck() (health status確認)

**期間**: 4-6時間

---

#### 4.2 **Problem/Content Listing** (優先度: HIGH)

**現状**:
- `src/features/content/` 存在
- `HomePage.tsx` でハードコード表示

**実装内容**:
1. **Types**
   - `Problem` (問題カード情報)
   - `ProblemListQuery` (pagination, sorting, filtering)

2. **Hooks**
   - `useProblems()` - 問題一覧取得
   - `useProblemDetail()` - 問題詳細取得

3. **Store**
   - `useContentStore` - 問題キャッシュ + pagination state

4. **Components**
   - `ProblemCard.tsx` - 単一問題表示
   - `ProblemList.tsx` - リスト表示
   - `ProblemDetail.tsx` - 詳細ページ

**依存**:
- D_INTERFACE_SPEC.md (GET /exams等)

**期間**: 3-5時間

---

#### 4.3 **User Profile & Stats** (優先度: MEDIUM)

**現状**:
- `src/features/user/` 存在
- 実装なし

**実装内容**:
1. **Types**
   - `UserProfile`
   - `UserStats` (問題数、いいね数、etc)

2. **Hooks**
   - `useUserProfile(userId?)`
   - `useUserStats(userId?)`
   - `useUpdateProfile()`

3. **Store**
   - `useUserStore` - ユーザー情報キャッシュ

4. **Components**
   - `UserProfileCard.tsx`
   - `UserStatsPanel.tsx`
   - `ProfileEditForm.tsx`

**依存**:
- D_INTERFACE_SPEC.md (GET /user/profile等)
- useAuth() hook

**期間**: 4-6時間

---

### Phase 5: Enhanced Features

#### 5.1 **Advanced Search Filters** (優先度: MEDIUM)

構築: マスターデータ (大学, 学部, 科目) の取得と Filter UI

#### 5.2 **Bookmarks & Likes** (優先度: MEDIUM)

構築: Like/Bookmark トグル機能、ユーザー保存済み問題の表示

#### 5.3 **Comments System** (優先度: LOW)

構築: コメント投稿、表示、削除機能

---

## 3. 第1実装対象: Search Feature 拡張

### 実装スケジュール

| 時間 | タスク | アウトプット |
|------|--------|-----------|
| 0.5h | Types & Schema 実装 | `src/features/search/types.ts` |
| 0.5h | Custom hooks 実装 | `src/features/search/hooks/` |
| 0.5h | Zustand store 実装 | `src/features/search/stores/` |
| 0.5h | Components 実装 | `src/features/search/components/` |
| 0.5h | Tests 実装 | `tests/features/search/` |
| 1h | Integration & Validation | Build + Test + Visual check |

**合計**: 3-4時間

---

## 4. 実装ガイドライン

### 依存関係チェック（実装前）

```bash
# 1. アーキテクチャ依存チェック
grep -r "import.*from.*[path]" src/features/[newFeature]
  # → Pages/Components からのみ参照可能か確認

# 2. API endpoint 確認
grep -r "ENDPOINTS\." src/features/[newFeature]
  # → すべてのエンドポイントが endpoints.ts で定義されているか確認

# 3. Types チェック
grep -r "as unknown as\|any" src/features/[newFeature]
  # → TypeScript型が完全か確認（any使用なし）
```

### コード品質チェック（実装後）

```bash
# 1. TypeScript check
npm run typecheck

# 2. Build
npm run build

# 3. Test
npm run test -- tests/features/[newFeature]

# 4. Lint (eslint setup後)
npm run lint -- src/features/[newFeature]
```

### API統合パターン

```typescript
// 推奨パターン
import { ENDPOINTS, API_BASE_URL } from '@/services/api/endpoints';
import { getHeaders, handleResponse, ApiError } from '@/services/api/httpClient';

// ❌ 避けるパターン
import axios from 'axios';  // services層で集約すべき
const API_BASE = process.env.VITE_API_BASE_URL;  // endpoints.ts使用
```

### Error Handling パターン

```typescript
// i18n + traceId
try {
  const response = await fetch(url, { headers: getHeaders() });
  const data = await handleResponse<T>(response);
  return data;
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`[${error.status}] ${error.message}`, { errorCode: error.errorCode });
    // UI: i18n('errors.' + error.errorCode) で表示
    throw error;
  }
  throw error;
}
```

---

## 5. 実装テンプレート

### Feature フォルダ構造

```
src/features/search/
├─ index.ts                    # Barrel export
├─ types.ts                    # Zod schema + TS types
├─ api.ts                      # Feature固有API call (optional)
├─ hooks/
│  ├─ useSearch.ts            # メインhook
│  ├─ useSearchFilters.ts
│  └─ useSearchPagination.ts
├─ stores/
│  └─ searchStore.ts           # Zustand store
└─ components/
   ├─ SearchBar.tsx
   ├─ SearchResults.tsx
   └─ SearchFilters.tsx
```

### index.ts テンプレート

```typescript
// Barrel export - ドメイン型と hooks/stores のみ
export * from './types';
export * from './hooks';
export * from './stores';
```

### types.ts テンプレート

```typescript
import { z } from 'zod';

// Zod Schema（バリデーション用）
export const SearchQuerySchema = z.object({
  keyword: z.string().min(1).max(255),
  filters: z.record(z.unknown()).optional(),
  page: z.number().min(1).optional(),
});

// TypeScript Types
export type SearchQuery = z.infer<typeof SearchQuerySchema>;

export interface SearchResult {
  id: string;
  title: string;
  type: 'exam' | 'reading';
  createdAt: string;
}

export interface SearchState {
  results: SearchResult[];
  isLoading: boolean;
  error: ApiError | null;
  total: number;
  page: number;
}
```

### hooks テンプレート

```typescript
// hooks/useSearch.ts
import { useState, useCallback } from 'react';
import { ENDPOINTS, API_BASE_URL } from '@/services/api/endpoints';
import { getHeaders, handleResponse, ApiError } from '@/services/api/httpClient';
import { SearchQuery, SearchResult, SearchQuerySchema } from '../types';
import { useSearchStore } from '../stores/searchStore';

export function useSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { results, setResults } = useSearchStore();

  const search = useCallback(async (query: SearchQuery) => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate input
      const validated = SearchQuerySchema.parse(query);

      // API call
      const response = await fetch(
        `${API_BASE_URL}${ENDPOINTS.search.problems}?q=${validated.keyword}`,
        { headers: getHeaders() }
      );
      const data = await handleResponse<SearchResult[]>(response);
      setResults(data);
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(500, 'Unknown error');
      setError(apiError);
      console.error('[Search] Error:', apiError);
    } finally {
      setIsLoading(false);
    }
  }, [setResults]);

  return { results, isLoading, error, search };
}
```

### store テンプレート

```typescript
// stores/searchStore.ts
import { create } from 'zustand';
import { SearchResult } from '../types';

interface SearchStoreState {
  results: SearchResult[];
  total: number;
  page: number;
  setResults: (results: SearchResult[]) => void;
  setPage: (page: number) => void;
  reset: () => void;
}

export const useSearchStore = create<SearchStoreState>((set) => ({
  results: [],
  total: 0,
  page: 1,
  
  setResults: (results) => set({ results }),
  setPage: (page) => set({ page }),
  reset: () => set({ results: [], total: 0, page: 1 }),
}));
```

---

## 6. 検証・テストスケジュール

各Phase完了後:

```bash
# Phase 4.1 (Search Feature)
npm run typecheck        # ✅ 0 errors
npm run build           # ✅ < 650 kB (gzip < 210 kB)
npm run test            # ✅ 15+ tests passing
npm run test -- --coverage  # ✅ カバレッジ確認

# Visual test (manual)
npm run dev             # ✅ HomePage/Search ページ動作確認
```

---

## 7. 今後の更新手順

**新Features追加時の手順**:

1. ユースケース定義 (R_USE_CASES.md に追記)
2. API エンドポイント確認 (endpoints.ts に追記)
3. Feature フォルダ作成 + types.ts
4. Hooks + Stores 実装
5. Components 実装
6. Tests 実装
7. Build + Test + Visual check
8. ドキュメント更新 (README等)

---

**ステータス**: 実装準備完了 🚀

次のステップ: Phase 4.1 (Search Feature 拡張) の実装開始
