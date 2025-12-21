export const getApiBaseUrl = () => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
  } catch (e) {
    // import.meta が利用できない環境
  }
  return 'http://localhost:3000/api';
};

export const API_BASE_URL = getApiBaseUrl();

const isMswEnabled =
  typeof import.meta !== 'undefined' &&
  import.meta.env?.VITE_ENABLE_MSW === 'true';
const isLocalMockPreferred = API_BASE_URL.includes('localhost');

export const USE_MOCK_DATA = false;

if (isLocalMockPreferred && isMswEnabled) {
  // MSW 起動時は内部モックを無効化して二重モックを防ぐ
  console.warn('MSW enabled: internal mock suppressed');
}

export const getHeaders = (): HeadersInit => {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new ApiError(response.status, error.message || 'API request failed');
  }
  return response.json();
}
