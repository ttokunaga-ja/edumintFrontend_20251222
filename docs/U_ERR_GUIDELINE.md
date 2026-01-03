大問1# Webアプリケーション エラーハンドリング・表示ガイドライン

## 1. 基本原則とセキュリティポリシー

エラー設計において、以下の3つの原則を遵守します。

### 1.1 情報漏洩の防止（Security First）
攻撃者にシステムの内部構造を推測させる情報は**絶対に表示しません**。
*   **NG表示**: スタックトレース、SQL文、データベースのテーブル名、ライブラリのバージョン、サーバーの内部パス（`/var/www/...`）。
*   **OK表示**: 一般的なエラーメッセージ、相関ID（Correlation ID）、カスタマーサポートへの導線。

### 1.2 具体的なアクションの提示（Actionable Feedback）
ユーザーに「エラーが起きた事実」だけを伝えるのではなく、「次にどうすればよいか」を提示します。
*   例：「再読み込みしてください」「入力を見直してください」「しばらく待ってからアクセスしてください」

### 1.3 コンテキストに応じた表示（Context Awareness）
*   **初期ロード時のエラー**: 画面全体（Full Page）でエラーを表示。
*   **操作時のエラー（保存ボタン押下など）**: 現在の画面を維持し、トースト（Snackbar）やダイアログで通知。

---

## 2. エラーコード別 メッセージ・挙動定義テーブル

各HTTPステータスコードに応じた、ユーザー向け文言とアプリケーションの挙動定義です。

| HTTPステータス | エラー種別 | ユーザー向けメッセージ（文言案） | 推奨される挙動・遷移 | セキュリティ/実装の注意点 |
| :--- | :--- | :--- | :--- | :--- |
| **400** | Bad Request | 「入力内容に誤りがあります。再度ご確認の上、操作してください。」 | **画面遷移なし**<br>該当フォーム下部にエラー詳細を表示（MUI `helperText`） | バリデーションエラーの詳細（「メール形式が不正」等）は出して良いが、JSONパースエラー等のシステム的な400は「不正なリクエスト」と丸める。 |
| **401** | Unauthorized | 「セッションの有効期限が切れました。再度ログインしてください。」 | **ログイン画面へリダイレクト**<br>（リダイレクト前に現在のURLを保存し、ログイン後に戻れるようにする） | ログイン画面自体では「ログインしてください」とは言わず、静かにフォームを表示するのが一般的。 |
| **403** | Forbidden | 「このページへのアクセス権限がありません。」 | **専用エラー画面（Full Page）**<br>またはトップページへ誘導 | **重要**: URLを知られたくない機密リソース（例：非公開プロファイル）の場合は、存在を隠すために**あえて404として振る舞う**ことが推奨されます。 |
| **404** | Not Found | 「お探しのページは見つかりませんでした。<br>URLが変更されたか、削除された可能性があります。」 | **専用エラー画面（Full Page）**<br>ヘッダー・フッターは残し、トップへのリンクを設置 | ブラウザのURLバーは変更せず、コンポーネントのみエラー画面に差し替える。 |
| **422** | Unprocessable Entity | （各フィールドごとの具体的なエラー文言） | **画面遷移なし**<br>フォームの各フィールドをハイライト | 400と同様だが、Laravel/Rails等のバックエンドでよく使われるバリデーションエラー用コード。 |
| **429** | Too Many Requests | 「アクセスが集中しています。しばらく時間を置いてから再度お試しください。」 | **トースト表示 / 画面維持**<br>または専用エラー画面 | 攻撃的なスクレイピング対策。Botに対しては`Retry-After`ヘッダーを返す。 |
| **500** | Internal Server Error | 「システムエラーが発生しました。<br>大変申し訳ありませんが、しばらく時間を置いてから再度お試しください。<br>（エラーID: XXXXX）」 | **専用エラー画面（Full Page）**<br>または操作時ならダイアログ | **絶対にスタックトレースを出さない**。<br>ログ調査用にランダムな「エラーID」を表示し、問い合わせ時に伝えてもらう運用がベスト。 |
| **503** | Service Unavailable | 「現在、システムメンテナンスを行っております。<br>終了予定時刻：202X年X月X日 XX:XX」 | **専用メンテナンス画面（Full Page）** | 外部のステータスページ（Statuspage.io等）へのリンクを貼ると親切。 |
| **Network**| 通信エラー | 「サーバーに接続できません。インターネット接続をご確認ください。」 | **トースト（Snackbar）**<br>リトライボタンを表示 | オフライン検知時の対応。 |

---

## 3. 認証・認可におけるセキュリティ詳細

### ログイン時のエラーメッセージ（アカウント列挙攻撃対策）
*   **NG**: 「このメールアドレスは登録されていません」「パスワードが間違っています」
    *   攻撃者に「どのアドレスが登録済みか」を教えてしまうため。
*   **OK**: **「メールアドレスまたはパスワードが正しくありません」**
    *   登録有無にかかわらず、同じメッセージ、同じ応答時間（可能な限り）で返すのがベストプラクティスです。

### 外部サービス・リンクの扱い
500/503エラー時、自社インフラ自体がダウンしている可能性があるため、以下の対応を検討します。
1.  **外部ステータスページへのリンク**:
    *   AWSや自社サーバーが落ちている場合、アプリ内でお知らせが出せません。
    *   「現在の稼働状況を確認する」というリンクをエラー画面に設置し、外部ホスティング（NotionやStatuspage.ioなど）のお知らせページへ誘導します。
2.  **公式SNSへの誘導**:
    *   「障害情報は公式X（Twitter）をご確認ください」等の案内を併記します。

---

## 4. 実装ガイドライン (React + TypeScript + MUI)

Webでのモダンな実装パターンに基づいた技術選定と実装方針です。

### 4.1 エラーハンドリングの3層構造
アプリケーション全体で漏れなくエラーを捕捉するため、以下の3層で設計します。

1.  **Global Level (React Error Boundary)**
    *   **役割**: JavaScriptの実行時エラー（レンダリングエラー）による「画面真っ白」を防ぐ。
    *   **実装**: `react-error-boundary` ライブラリの使用を推奨。
    *   **表示**: 画面全体を使った「予期せぬエラー」ページ。

2.  **Service/API Level (Axios Interceptors / TanStack Query)**
    *   **役割**: HTTPステータスコードに基づいた共通処理。
    *   **実装**:
        *   `401` ならログインページへリダイレクト。
        *   `500` 系ならグローバルな通知State（Snackbar）を更新。
        *   共通のエラー型定義（TypeScript）を作成。

3.  **Component Level (Local State)**
    *   **役割**: バリデーションエラー（400/422）の表示。
    *   **実装**: `react-hook-form` とMUIの `TextField` (`error`, `helperText` props) を連携。

### 4.2 ディレクトリ構成と型定義 (TypeScript)

**型定義 (`src/types/api.ts`)**
```typescript
// バックエンドの共通エラーレスポンス形式に合わせる
export interface ApiErrorResponse {
  code: string;       // 機械可読コード (例: 'INVALID_INPUT')
  message: string;    // ユーザー表示用メッセージ (開発環境では詳細含む場合も)
  details?: Record<string, string[]>; // フィールドごとのバリデーションエラー
  traceId?: string;   // ログ照合用のID
}

// アプリケーション内部で扱うエラー型
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code?: string,
    public traceId?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

### 4.3 MUIコンポーネント活用例

#### A. ページ全体のエラー (500, 404, ErrorBoundary)
`Container`, `Typography`, `Button` を使用し、中央揃えで配置します。

```tsx
// src/components/errors/ErrorPage.tsx
import { Box, Typography, Button, Container } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface ErrorPageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  traceId?: string;
}

export const ErrorPage = ({ 
  title = "システムエラーが発生しました", 
  message = "予期せぬエラーが発生しました。しばらく待ってから再読み込みしてください。",
  onRetry,
  traceId 
}: ErrorPageProps) => {
  return (
    <Container maxWidth="sm">
      <Box display="flex" flexDirection="column" alignItems="center" mt={8} textAlign="center">
        <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" component="h1" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {message}
        </Typography>
        {traceId && (
          <Typography variant="caption" display="block" sx={{ mb: 2, fontFamily: 'monospace' }}>
            Error ID: {traceId}
          </Typography>
        )}
        <Box mt={2}>
          <Button variant="contained" onClick={() => window.location.reload()} sx={{ mr: 1 }}>
            再読み込み
          </Button>
          {onRetry && (
            <Button variant="outlined" onClick={onRetry}>
              もう一度試す
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};
```

#### B. トースト通知 (APIエラー等の通知)
`Snackbar` と `Alert` を組み合わせます。

```tsx
// src/components/ui/GlobalSnackbar.tsx
import { Snackbar, Alert } from '@mui/material';
import { useErrorStore } from '@/stores/errorStore'; // Zustand等のState管理を想定

export const GlobalSnackbar = () => {
  const { isOpen, message, severity, close } = useErrorStore();

  return (
    <Snackbar 
      open={isOpen} 
      autoHideDuration={6000} 
      onClose={close}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={close} severity={severity || 'error'} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};
```

### 4.4 APIクライアントの実装 (Axios Interceptor)

API通信層でエラーを一元管理し、共通の変換処理を行います。

```typescript
// src/lib/axios.ts
import axios from 'axios';
import { useErrorStore } from '@/stores/errorStore'; // 通知用ストア

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status, data } = error.response || {};
    const errorStore = useErrorStore.getState(); // フック外からのStoreアクセス

    // 401 Unauthorized: ログイン画面へ強制遷移
    if (status === 401) {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return Promise.reject(error);
    }

    // 403 Forbidden
    if (status === 403) {
      errorStore.show('アクセス権限がありません。管理者にお問い合わせください。');
      return Promise.reject(error);
    }

    // 500 Server Error
    if (status >= 500) {
      // 開発環境では詳細をログに出すが、ユーザーには汎用メッセージ
      console.error('Server Error:', data);
      errorStore.show(
        `システムエラーが発生しました。時間をおいて再度お試しください。(ID: ${data?.traceId ?? 'N/A'})`
      );
      return Promise.reject(error);
    }

    // 400系 (Bad Request) は各コンポーネントで個別処理したい場合が多いので
    // ここでは通知を出さず、そのままthrowしてコンポーネント側のcatchに任せる
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 5. まとめ：チェックリスト

開発完了時に以下の項目を確認してください。

*   [ ] **機密情報の隠蔽**: エラー画面にSQL文やスタックトレースが表示されていないか？
*   [ ] **ユーザー導線**: 404ページやエラーページからトップへ戻れるか？
*   [ ] **認証セキュリティ**: ログイン失敗時に「登録なし」と判定できる文言になっていないか？
*   [ ] **ログ紐付け**: 500エラー発生時、ユーザーが見ている画面のIDとサーバーログを照合できる仕組み（Correlation ID）があるか？
*   [ ] **モバイル対応**: エラー画面はスマホでも崩れずに表示されるか（MUI `Grid`/`Container`の使用）？
