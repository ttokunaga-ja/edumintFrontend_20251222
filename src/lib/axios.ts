/**
 * Axios インスタンス設定
 * ガイドライン: docs/U_ERR_GUIDELINE.md
 *
 * APIエラーハンドリング（401, 403, 500等）をインターセプターで一元管理
 */

import axios, { AxiosError } from 'axios';
import { AppError, ApiErrorResponse } from '@/types/api';
import { useErrorStore } from '@/stores/errorStore';
import { env } from '@/config/env';

export const API_BASE_URL = env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * リクエストインターセプター
 * 認証トークンの自動付与
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('authToken')
        : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * レスポンスインターセプター
 *
 * HTTPエラーステータスに基づいて統一的に処理：
 * - 401 Unauthorized: ログインページへリダイレクト
 * - 403 Forbidden: エラー通知を表示
 * - 500+ Server Error: グローバル通知でユーザーに通知
 * - 400/422 Bad Request: 各コンポーネントで個別処理したいため、ここでは通知しない
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status || 0;
    const data = error.response?.data;

    // AppErrorに変換
    const appError = AppError.fromResponse(status, data);

    // 401 Unauthorized: セッション期限切れ → ログインページへリダイレクト
    if (status === 401) {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('authToken');
      }
      // 現在のURLを保存してから遷移（ログイン後に戻るため）
      const redirectUrl = `/login?redirect=${encodeURIComponent(
        window.location.pathname
      )}`;
      window.location.href = redirectUrl;
      return Promise.reject(appError);
    }

    // 403 Forbidden: アクセス権限なし
    if (status === 403) {
      const errorStore = useErrorStore.getState();
      errorStore.show(
        'このページへのアクセス権限がありません。',
        'error',
        data?.traceId,
        null // 自動閉じしない
      );
      return Promise.reject(appError);
    }

    // 500+ Server Error: サーバーエラー通知
    if (status >= 500) {
      const errorStore = useErrorStore.getState();
      let message = data?.message || AppError.getDefaultMessage(status);
      if (data?.traceId) {
        message += `\nError ID: ${data.traceId}`;
      }
      errorStore.show(message, 'error', data?.traceId, null);
      return Promise.reject(appError);
    }

    // 429 Too Many Requests: レート制限
    if (status === 429) {
      const errorStore = useErrorStore.getState();
      errorStore.show(
        'アクセスが集中しています。しばらく時間を置いてから再度お試しください。',
        'warning',
        undefined,
        6000
      );
      return Promise.reject(appError);
    }

    // 400系その他 (Bad Request, 422 Unprocessable Entity)
    // 各コンポーネントで個別処理したい場合が多いため、ここでは通知しない
    // ※ フォームバリデーションエラーなど、UI内で処理するケース
    return Promise.reject(appError);
  }
);

export default axiosInstance;
export { axiosInstance };
