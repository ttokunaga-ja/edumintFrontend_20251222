import { http, HttpResponse } from "msw";
import { uploadJob } from "../mockData/files";

const apiBase =
  (import.meta.env?.VITE_API_BASE_URL as string | undefined)?.replace(
    /\/$/,
    "",
  ) ?? "";
const withBase = (path: string) => `${apiBase}${path}`;

export const filesHandlers = [
  http.post(withBase("/files/upload-job"), async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as
      | Record<string, unknown>
      | undefined;
    const fileName =
      typeof body === "object" && body && "fileName" in body
        ? (body as Record<string, unknown>).fileName
        : "mockfile.pdf";
    return HttpResponse.json({
      ...uploadJob,
      jobId: `${uploadJob.jobId}-${Math.random().toString(36).slice(2, 6)}`,
      uploadUrl: `${uploadJob.uploadUrl}/${fileName}`,
    });
  }),
  http.post(withBase("/files/upload-complete"), () =>
    HttpResponse.text("", { status: 200 }),
  ),
];
