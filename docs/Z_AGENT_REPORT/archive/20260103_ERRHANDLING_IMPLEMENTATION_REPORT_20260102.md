# エラーハンドリング実装完了レポート

**実装日**: 2026年1月2日  
**ガイドライン参照**: [U_ERR_GUIDELINE.md](U_ERR_GUIDELINE.md)

---

## 📋 実装内容

ガイドライン `U_ERR_GUIDELINE.md` に従い、3層構造のエラーハンドリングシステムを実装しました。

### 1. **Global Level** - JavaScript実行時エラー処理

#### 📄 ファイル: [src/components/errors/ErrorBoundary.tsx](../../src/components/errors/ErrorBoundary.tsx)

**役割**: レンダリング中の予期せぬエラー（画面真っ白）を防止

**機能**:
- React Error Boundaryの実装
- 開発環境でエラー詳細をコンソール出力
- ユーザーには汎用メッセージを表示

**使用方法**:
```tsx
// App.tsx またはルートで包む
<ErrorBoundary>
  <YourApp />
</ErrorBoundary>
```

---

### 2. **Service/API Level** - HTTPエラー一元管理

#### 📄 ファイル: [src/lib/axios.ts](../../src/lib/axios.ts)

**役割**: APIレスポンスのHTTPステータスに基づいた共通エラー処理

**処理内容**:

| ステータス | 処理 |
|:---|:---|
| **401** | 認証トークン削除 → `/login?redirect=...` へリダイレクト |
| **403** | `useErrorStore` でグローバル通知を表示 |
| **429** | レート制限警告をスナックバーに表示 |
| **500+** | サーバーエラー通知（トレースID含む） |
| **400/422** | コンポーネント側で個別処理（ここでは通知しない） |

**インターセプター例**:
```typescript
// 401 Unauthorized - ログイン画面へ遷移
if (status === 401) {
  localStorage.removeItem('authToken');
  window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
}

// 500+ Server Error - グローバル通知
if (status >= 500) {
  const errorStore = useErrorStore.getState();
  errorStore.show(message, 'error', traceId, null);
}
```

#### 📄 ファイル: [src/types/api.ts](../../src/types/api.ts)

**型定義**:

- `ApiErrorResponse` - バックエンドエラーレスポンス型
- `AppError` - アプリ内部で使用するエラークラス
  - `statusCode` - HTTPステータス
  - `code` - 機械可読エラーコード
  - `traceId` - ログ照合用ID
  - `message` - ユーザー表示メッセージ

**ヘルパーメソッド**:
```typescript
// デフォルトメッセージの取得
AppError.getDefaultMessage(statusCode: number): string

// レスポンスからAppErrorを生成
AppError.fromResponse(statusCode: number, data?: ApiErrorResponse): AppError

// ネットワークエラー生成
AppError.createNetworkError(): AppError
```

#### 📄 ファイル: [src/stores/errorStore.ts](../../src/stores/errorStore.ts)

**Zustandストア**: グローバルエラー通知の状態管理

**API**:
```typescript
const { isOpen, message, severity, traceId, show, close } = useErrorStore();

// 通知を表示
show(message, severity?: 'info' | 'warning' | 'error', traceId?, autoHideDuration?)

// 通知を閉じる
close()
```

---

### 3. **Component Level** - ローカルバリデーションエラー

各コンポーネントで `react-hook-form` と MUI `TextField` (`error`, `helperText` props) を連携させて、フィールドごとのバリデーションエラーを表示します。

**実装例**:
```tsx
<TextField
  {...register('email')}
  error={!!errors.email}
  helperText={errors.email?.message}
/>
```

---

## 🎨 UI コンポーネント

### ErrorPage（ページ全体のエラー表示）

#### 📄 ファイル: [src/components/errors/ErrorPage.tsx](../../src/components/errors/ErrorPage.tsx)

**使用場面**:
- 404 Not Found
- 500 Internal Server Error
- 503 Service Unavailable（メンテナンス）
- ErrorBoundaryのフォールバック

**表示内容**:
- エラーアイコン
- タイトルとメッセージ
- トレースID（500エラー時）
- メンテナンス終了予定時刻（503時）
- 再読み込み / リトライ / ホームボタン
- ステータスページへのリンク

**使用例**:
```tsx
<ErrorPage
  title="ページが見つかりません"
  message="お探しのページは見つかりませんでした。"
  statusCode={404}
/>
```

---

### GlobalSnackbar（トースト通知）

#### 📄 ファイル: [src/components/errors/GlobalSnackbar.tsx](../../src/components/errors/GlobalSnackbar.tsx)

**使用場面**:
- APIエラー通知（401, 403, 500+, 429）
- 自動閉じ時間の制御可能

**配置**: `AppProviders.tsx` のルートレベル

```tsx
<GlobalSnackbar />
```

---

## 🔌 統合ポイント

### AppProviders.tsx に統合

#### 📄 ファイル: [src/app/AppProviders.tsx](../../src/app/AppProviders.tsx)

エラーハンドリングの3層が以下の順序で機能：

```tsx
<ErrorBoundary>                  {/* レイヤー1: JavaScriptエラー */}
  <ThemeProvider>
    <QueryClientProvider>
      <BrowserRouter>
        <GlobalSnackbar />       {/* レイヤー2: APIエラー通知 */}
        <NotificationCenter />   {/* 従来の通知 */}
        <AppLayout>
          <Router />
        </AppLayout>
      </BrowserRouter>
    </QueryClientProvider>
  </ThemeProvider>
</ErrorBoundary>
```

---

## 📊 動作フロー

### APIエラーの処理フロー

```
APIリクエスト
  ↓
[axios インターセプター]
  ├─ 401 → ローカルストレージ削除 → ログイン画面へリダイレクト
  ├─ 403 → useErrorStore.show() → GlobalSnackbar表示
  ├─ 429 → useErrorStore.show('レート制限') → スナックバー表示
  ├─ 500+ → useErrorStore.show(message, traceId) → スナックバー表示
  └─ 400/422 → Promise.reject(AppError) → コンポーネントで処理
```

### JavaScriptエラーの処理フロー

```
React コンポーネント レンダリング
  ↓
[エラー発生]
  ↓
[ErrorBoundary]
  ├─ getDerivedStateFromError() → hasError = true
  ├─ componentDidCatch() → 開発環境でログ出力
  └─ エラー画面を表示
```

---

## 🔒 セキュリティ考慮事項

### ✅ 実装済み

1. **スタックトレース非表示**
   - 本番環境ではエラー詳細を隠蔽
   - 開発環境のみコンソール出力

2. **トレースID連携**
   - ユーザーに表示するエラーIDでサーバーログを追跡可能
   - 「Error ID: xxxxx」形式でUIに表示

3. **認証セキュリティ**
   - 401時の統一メッセージ（詳細を分からない設計）
   - ログイン後の現在ページへのリダイレクト

4. **機密情報の隠蔽**
   - SQL文、テーブル名、サーバーパス等の非表示
   - ユーザー向けには一般的なメッセージのみ

5. **アカウント列挙攻撃対策**
   - ログイン失敗メッセージは「メールアドレスまたはパスワードが正しくありません」
   - 登録有無を判定させない

---

## 📚 ガイドラインとの整合性

### ✅ チェックリスト

- [x] **機密情報の隠蔽**: エラー画面にSQL文やスタックトレースが表示されていない
- [x] **ユーザー導線**: 404/エラーページからトップへ戻るボタン配置
- [x] **認証セキュリティ**: ログイン失敗時に「登録なし」と判定できないメッセージ
- [x] **ログ紐付け**: 500エラー発生時、トレースIDでサーバーログ照合可能
- [x] **モバイル対応**: MUI `Container`/`Stack` で レスポンシブ対応

---

## 🚀 使用方法

### 1. **APIエラーの自動処理**

Axiosインターセプターが自動処理するため、開発者の追加実装は不要。

```typescript
// APIコール - エラーは自動で処理
try {
  const response = await axiosInstance.get('/api/problems');
} catch (error) {
  if (error instanceof AppError) {
    // 400/422など、コンポーネント側で個別処理したい場合
    console.error(error.message);
  }
}
```

### 2. **手動でエラー通知を表示**

```typescript
import { useErrorStore } from '@/stores/errorStore';

const { show } = useErrorStore();

// エラー通知を表示
show(
  'ファイルアップロードに失敗しました。',
  'error',
  'TRACE_123',
  6000
);
```

### 3. **ページ全体のエラー表示**

```tsx
import { ErrorPage } from '@/components/errors';

<ErrorPage
  title="データ取得エラー"
  message="問題の取得に失敗しました。"
  statusCode={500}
  traceId="xxxxx"
  onRetry={() => refetch()}
/>
```

---

## 🧪 テスト例

### ErrorBoundary のテスト

```tsx
// エラー投げるコンポーネント
const ThrowError = () => {
  throw new Error('Test error');
};

// テスト
<ErrorBoundary>
  <ThrowError />
</ErrorBoundary>
// → エラー画面が表示される
```

### APIエラーのテスト

```typescript
// 401エラーのモック
msw.use(
  http.get('/api/problems', () =>
    HttpResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 })
  )
);

// 実行 → ログイン画面へリダイレクト
```

---

## 📦 ファイル一覧

| ファイル | 用途 |
|:---|:---|
| [src/types/api.ts](../../src/types/api.ts) | エラー型定義 |
| [src/components/errors/ErrorBoundary.tsx](../../src/components/errors/ErrorBoundary.tsx) | JavaScriptエラー処理 |
| [src/components/errors/ErrorPage.tsx](../../src/components/errors/ErrorPage.tsx) | エラーページUI |
| [src/components/errors/GlobalSnackbar.tsx](../../src/components/errors/GlobalSnackbar.tsx) | グローバル通知UI |
| [src/components/errors/index.ts](../../src/components/errors/index.ts) | エクスポート |
| [src/stores/errorStore.ts](../../src/stores/errorStore.ts) | 状態管理（Zustand） |
| [src/lib/axios.ts](../../src/lib/axios.ts) | Axiosインターセプター |
| [src/app/AppProviders.tsx](../../src/app/AppProviders.tsx) | 統合ポイント |

---

## 🔮 今後の拡張

1. **i18n対応**
   - エラーメッセージの多言語化
   - `i18next` を活用した国際化

2. **Sentry連携**
   - ErrorBoundaryで `Sentry.captureException()` を呼び出し
   - 本番環境でのエラー監視

3. **カスタムエラーハンドラー**
   - 特定のエラーコードに対するカスタムロジック
   - リトライ機構の自動実装

4. **オフライン対応**
   - ネットワークエラー検知
   - 自動リトライ機構

---

## ✨ 完了

すべての実装がガイドラインに準拠し、本番環境での運用に耐えうるエラーハンドリングシステムが構築されました。
