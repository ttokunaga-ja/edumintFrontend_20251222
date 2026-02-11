# Frontend Implementation Review & Improvement Report

**Date:** 2026-01-13
**Target:** `eduanimaFrontend_20251222`
**Reviewer:** GitHub Copilot (Gemini 3 Pro)

## 1. 概要
本ドキュメントは、eduanimaFrontend の現状の実装コードをレビューし、バックエンド (eduanimaGateway / eduanimaContent) との不整合を修正した内容、および今後の開発における推奨ベストプラクティスをまとめたものです。

---

## 2. 即時改修指示書 (Required Immediate Changes)

以下のコード修正をソースコードに適用してください。これらはバックエンドとの通信を正常に行うために必須です。

### 2.1 API エンドポイントの定義変更
**対象ファイル**: `src/services/api/endpoints.ts`

**変更内容**: `CONTENT_ENDPOINTS` のパスを `/problems` から `/exams` に変更してください。

```typescript
// ===============================
// コンテンツ（問題）エンドポイント
// ===============================
export const CONTENT_ENDPOINTS = {
  // ▼ 変更前 (Remove)
  // list: '/problems',
  // detail: (id: string) => `/problems/${id}`,
  // create: '/problems',
  // update: (id: string) => `/problems/${id}`,
  // delete: (id: string) => `/problems/${id}`,
  // search: '/problems/search',

  // ▼ 変更後 (Add)
  list: '/exams',
  detail: (id: string) => `/exams/${id}`,
  create: '/exams',
  update: (id: string) => `/exams/${id}`,
  delete: (id: string) => `/exams/${id}`,
  search: '/exams/search',
} as const;
```

### 2.2 型定義の具体化
**対象ファイル**: `src/types/index.ts`

**変更内容**: `any` 型で定義されている主要エンティティを、以下のインターフェース定義に差し替えてください。

```typescript
// ... existing code ...

export type SourceType = 'lecture-notes' | 'past-exam';

// ▼ 変更前 (Remove)
// export type Question = any;
// export type Exam = any;
// export type Notification = any;

// ▼ 変更後 (Add)
export interface Question {
  id: string;
  examId: string;
  content: string;
  difficulty?: number;
  format?: 'multiple_choice' | 'text' | 'code';
}

export interface Exam {
  id: string;
  title: string;
  subjectId?: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  questions?: Question[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export * from './health';
```

---

## 3. 推奨される改善事項 (Recommended Improvements)

以下の項目は、コードの品質、保守性、およびスケーラビリティを向上させるための推奨事項です。次回のリファクタリングまたは機能追加時に実施することを強く推奨します。

### 3.1 マジックストリングの排除と定数利用の徹底
**現状**:
`src/services/api/gateway/content.ts` などの API サービスファイル内で、エンドポイント URL (例: `/exams/${id}`) がハードコードされています。

**推奨する実装**:
`src/services/api/endpoints.ts` で定義した定数およびヘルパー関数を使用するように書き換えてください。

**修正例**:
```typescript
// src/services/api/gateway/content.ts

import { axiosInstance } from '@/lib/axios'; // Import path needs to be consistent
import { CONTENT_ENDPOINTS } from '@/services/api/endpoints';
import { Exam } from '@/types';

export const getExam = async (id: string): Promise<Exam> => {
  // Before: axios.get(`/exams/${id}`)
  // After:
  const response = await axiosInstance.get<Exam>(CONTENT_ENDPOINTS.detail(id));
  return response.data;
};
```

### 3.2 OpenAPI Generator による型定義の自動生成
**現状**:
フロントエンド (`src/types/index.ts`) とバックエンド (`openapi.yaml`, `interfaces.proto`) の型定義が手動で管理されており、同期漏れのリスクがあります。

**推奨する実装**:
`openapi-generator-cli` または `orval` を導入し、Gateway が提供する `openapi.yaml` から TypeScript の型定義と API クライアントを自動生成してください。

**手順**:
1. `openapi.yaml` を `docs/` またはルートに配置。
2. 以下の依存パッケージをインストール:
   ```bash
   npm install -D @openapitools/openapi-generator-cli
   ```
3. `package.json` にスクリプトを追加:
   ```json
   "scripts": {
     "gen:api": "openapi-generator-cli generate -i ../eduanimaGateway_docs/openapi.yaml -g typescript-axios -o src/services/api/generated"
   }
   ```

### 3.3 環境変数のバリデーション (Zod)
**現状**:
`VITE_API_BASE_URL` が未設定の場合にハードコードされた `localhost:3000` にフォールバックしていますが、警告が出ません。

**推奨する実装**:
アプリケーション起動時 (`main.tsx` または専用の設定ファイル) で環境変数を検証し、設定ミスがあれば即座にエラーを出力するようにします。

**実装例**:
```typescript
// src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
});

export const env = envSchema.parse(import.meta.env);
```

### 3.4 API クライアントの集約
**現状**:
`src/lib/axios.ts` (Axios設定), `src/lib/httpClient.ts` (Fetchラッパー) が並存しています。

**推奨する実装**:
プロジェクト全体で **Axios** (または Fetch) のどちらか一方に統一してください。現状の実装を見る限り Axios の利用頻度が高いため、Axios に統一し、Interceptor (Token 付与、エラーハンドリング) の設定を一箇所 (`src/lib/axios.ts`) に集約することを推奨します。

---

## 4. 実行計画 (Action Plan)

1. **Phase 1 (完了)**:
   - `endpoints.ts` のパス修正。
   - `types/index.ts` の `any` 排除。

2. **Phase 2 (要実施)**:
   - `src/services/api/gateway/*.ts` 内のハードコードされた URL を `endpoints.ts` 参照に置換。
   - Component 内で直接 `axios.get()` などを呼んでいる箇所を `src/services/api` 経由に変更。

3. **Phase 3 (将来)**:
   - CI/CD パイプラインへの OpenAPI コード生成の組み込み。
