/**
 * HTTP クライアント ユーティリティ
 * fetch/axios を使用する際のヘルパー関数を集約
 */

/**
 * API エラークラス
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errorCode?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * レスポンス処理（fetch用）
 */
export async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: response.statusText,
    }));
    throw new ApiError(
      response.status,
      error.message || 'API request failed',
      error.code
    );
  }
  return response.json();
}

/**
 * リクエストヘッダー生成
 */
export const getHeaders = (): HeadersInit => {
  const token =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('authToken')
      : null;

  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * MSW（Mock Service Worker）の有効化判定
 */
export const isMswEnabled = (): boolean => {
  try {
    return (
      typeof import.meta !== 'undefined' &&
      import.meta.env?.VITE_ENABLE_MSW === 'true'
    );
  } catch {
    return false;
  }
};

/**
 * モックデータの使用判定
 */
export const shouldUseMockData = (): boolean => {
  const isMock = isMswEnabled();
  const isLocal =
    typeof import.meta !== 'undefined' &&
    import.meta.env?.VITE_API_BASE_URL?.includes('localhost');

  if (isLocal && isMock) {
    console.debug('MSW enabled: using mock data');
  }

  return isMock;
};
