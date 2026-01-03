import { http, HttpResponse } from 'msw';
import { nanoid } from 'nanoid';
import { mockUser as defaultMockUser } from '../mockData/user';

const apiBase = (import.meta.env?.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? 'http://localhost:3000/api';
const withBase = (path: string) => `${apiBase}${path}`;

const mockUser = defaultMockUser;

export const authHandlers = [
  // ログインエンドポイント
  http.post(withBase('/auth/login'), async ({ request }) => {
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    const email = body.email as string;

    if (!email) {
      return HttpResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      token: 'mock-jwt-token-' + Date.now(),
      user: { ...mockUser, email },
    });
  }),

  // 新規登録エンドポイント
  http.post(withBase('/auth/register'), async ({ request }) => {
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    const email = body.email as string;
    const username = body.username as string;

    // バリデーション
    if (!email || !username) {
      return HttpResponse.json(
        { success: false, message: 'Email and username are required' },
        { status: 400 }
      );
    }

    // ユーザー名とメールアドレスの重複チェック（モック）
    if (username === 'testuser' || email === 'test@example.com') {
      return HttpResponse.json(
        { success: false, message: 'Email or username already in use' },
        { status: 409 }
      );
    }

    return HttpResponse.json({
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: nanoid(16),
        email,
        username,
        displayName: username,
      },
    });
  }),

  // ログアウトエンドポイント
  http.post(withBase('/auth/logout'), () => {
    return HttpResponse.json({ success: true, message: 'Logged out' });
  }),

  // 現在のユーザー情報取得
  http.get(withBase('/auth/me'), () => {
    return HttpResponse.json(mockUser);
  }),
];
