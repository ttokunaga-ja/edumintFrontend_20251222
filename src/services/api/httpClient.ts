/**
 * HTTP クライアント フォワード
 * lib/ から再エクスポート（後方互換性維持）
 */

export {
  ApiError,
  handleResponse,
  getHeaders,
  isMswEnabled,
  shouldUseMockData,
} from '@/lib/httpClient';
export * from './endpoints';
