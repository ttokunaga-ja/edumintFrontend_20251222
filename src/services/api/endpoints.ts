/**
 * API Endpoints Definition
 * 
 * 全API endpoint URLs を一元化した定義ファイル
 * Features の hooks から参照する
 */

// ===============================
// 認証エンドポイント
// ===============================
export const AUTH_ENDPOINTS = {
  login: '/auth/login',
  register: '/auth/register',
  logout: '/auth/logout',
  refresh: '/auth/refresh',
  profile: '/auth/profile',
} as const;

// ===============================
// コンテンツ（問題）エンドポイント
// ===============================
export const CONTENT_ENDPOINTS = {
  list: '/problems',
  detail: (id: string) => `/problems/${id}`,
  create: '/problems',
  update: (id: string) => `/problems/${id}`,
  delete: (id: string) => `/problems/${id}`,
  search: '/problems/search',
} as const;

// ===============================
// ファイル操作エンドポイント
// ===============================
export const FILE_ENDPOINTS = {
  createUploadJob: '/files/upload/create-job',
  notifyUploadComplete: (jobId: string) => `/files/upload/${jobId}/complete`,
  getUploadUrl: (jobId: string) => `/files/upload/${jobId}/url`,
} as const;

// ===============================
// 生成エンドポイント
// ===============================
export const GENERATION_ENDPOINTS = {
  startStructure: '/generation/structure',
  getStatus: (jobId: string) => `/generation/status/${jobId}`,
  confirmStructure: (jobId: string) => `/generation/${jobId}/confirm`,
  cancelJob: (jobId: string) => `/generation/${jobId}/cancel`,
  publishProblem: (jobId: string) => `/generation/${jobId}/publish`,
} as const;

// ===============================
// ユーザーエンドポイント
// ===============================
export const USER_ENDPOINTS = {
  profile: '/users/profile',
  stats: '/users/stats',
  wallet: '/users/wallet',
  updateProfile: '/users/profile/update',
} as const;

// ===============================
// 検索エンドポイント
// ===============================
export const SEARCH_ENDPOINTS = {
  problems: '/search/problems',
  universities: '/search/universities',
  departments: '/search/departments',
  subjects: '/search/subjects',
} as const;

// ===============================
// 通知エンドポイント
// ===============================
export const NOTIFICATION_ENDPOINTS = {
  list: '/notifications',
  mark_read: '/notifications/mark-read',
  delete: (id: string) => `/notifications/${id}`,
} as const;

// ===============================
// ヘルスチェックエンドポイント
// ===============================
export const HEALTH_ENDPOINTS = {
  status: '/health/status',
  services: '/health/services',
} as const;

/**
 * 統合エンドポイントオブジェクト
 * 使用例:
 *   import { ENDPOINTS } from '@/services/api/endpoints'
 *   const url = ENDPOINTS.content.detail('problem-123')
 */
export const ENDPOINTS = {
  auth: AUTH_ENDPOINTS,
  content: CONTENT_ENDPOINTS,
  file: FILE_ENDPOINTS,
  generation: GENERATION_ENDPOINTS,
  user: USER_ENDPOINTS,
  search: SEARCH_ENDPOINTS,
  notification: NOTIFICATION_ENDPOINTS,
  health: HEALTH_ENDPOINTS,
} as const;

/**
 * API ベース URL
 * 環境変数から読み込み、デフォルトは localhost:3000/api
 */
export const getApiBaseUrl = (): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
  } catch {
    // import.meta が利用できない環境
  }
  return 'http://localhost:3000/api';
};

export const API_BASE_URL = getApiBaseUrl();
