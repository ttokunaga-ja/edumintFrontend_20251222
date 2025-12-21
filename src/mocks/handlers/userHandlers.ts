import { http, HttpResponse } from "msw";
import { mockExams } from "../mockData/search";
import {
  mockUser,
  mockUserStats,
  mockWalletBalance,
} from "../mockData/user";

const apiBase =
  (import.meta.env?.VITE_API_BASE_URL as string | undefined)?.replace(
    /\/$/,
    "",
  ) ?? "";
const withBase = (path: string) => `${apiBase}${path}`;

const paginate = <T>(items: T[], page: number, limit: number) => {
  const total = items.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  return {
    items: items.slice(start, end),
    total,
    hasMore: end < total,
  };
};

export const userHandlers = [
  http.get(withBase("/user/profile"), () => HttpResponse.json(mockUser)),
  http.get(withBase("/user/profile/:userId"), ({ params }) =>
    HttpResponse.json({ ...mockUser, id: params.userId }),
  ),
  http.patch(withBase("/user/profile"), async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    return HttpResponse.json({ ...mockUser, ...body });
  }),
  http.get(withBase("/user/stats"), () =>
    HttpResponse.json(mockUserStats),
  ),
  http.get(withBase("/user/stats/:userId"), ({ params }) =>
    HttpResponse.json({ ...mockUserStats, userId: params.userId }),
  ),
  http.get(withBase("/user/:userId/problems"), ({ params, request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || "1");
    const limit = Number(url.searchParams.get("limit") || "20");
    const userExams = mockExams.filter(
      (exam) => exam.userId === params.userId,
    );
    const { items, total, hasMore } = paginate(userExams, page, limit);
    return HttpResponse.json({
      exams: items,
      total,
      page,
      limit,
      hasMore,
    });
  }),
  http.get(withBase("/user/:userId/liked"), ({ params, request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || "1");
    const limit = Number(url.searchParams.get("limit") || "20");
    const { items, total, hasMore } = paginate(mockExams, page, limit);
    return HttpResponse.json({
      exams: items,
      total,
      page,
      limit,
      hasMore,
    });
  }),
  http.get(withBase("/user/:userId/commented"), ({ params, request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || "1");
    const limit = Number(url.searchParams.get("limit") || "20");
    const { items, total, hasMore } = paginate(mockExams, page, limit);
    return HttpResponse.json({
      exams: items,
      total,
      page,
      limit,
      hasMore,
    });
  }),
  http.get(withBase("/wallet/balance"), () =>
    HttpResponse.json(mockWalletBalance),
  ),
  http.post(withBase("/wallet/withdraw"), async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    const amount =
      typeof body.amount === "number"
        ? body.amount
        : Number(body.amount ?? 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      return HttpResponse.json(
        { success: false, message: "Invalid amount" },
        { status: 400 },
      );
    }
    return HttpResponse.json({
      success: true,
      message: "Withdrawal request accepted",
    });
  }),
];
