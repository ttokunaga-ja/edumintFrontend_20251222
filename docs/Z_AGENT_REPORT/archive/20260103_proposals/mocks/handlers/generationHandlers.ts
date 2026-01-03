import { http, HttpResponse, delay } from "msw";
import { generationStatuses } from "../mockData/generation";

const apiBase =
  (import.meta.env?.VITE_API_BASE_URL as string | undefined)?.replace(
    /\/$/,
    "",
  ) ?? "";
const withBase = (path: string) => `${apiBase}${path}`;

export const generationHandlers = [
  http.get(withBase("/generation/status/:jobId"), async ({ params }) => {
    const status =
      generationStatuses.find((item) => item.jobId === params.jobId) ??
      generationStatuses[0];
    await delay(200);
    return HttpResponse.json({
      ...status,
      jobId: params.jobId,
      progress: status.progress ?? 50,
    });
  }),

  http.post(withBase("/generation-settings"), () =>
    HttpResponse.text("", { status: 200 }),
  ),

  http.post(withBase("/generation/cancel/:jobId"), () =>
    HttpResponse.text("", { status: 200 }),
  ),
  http.post(withBase("/generation/resume/:jobId"), () =>
    HttpResponse.text("", { status: 200 }),
  ),
  http.post(withBase("/generation/retry/:jobId"), () =>
    HttpResponse.text("", { status: 200 }),
  ),
  http.post(withBase("/generation/start"), () =>
    HttpResponse.json({
      jobId: `gen-job-${Math.random().toString(36).slice(2, 8)}`,
    }),
  ),
];
