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
    // フォームデータとして受け取る場合とJSONの場合があるため両対応
    let fileName = "mockfile.pdf";
    try {
      const contentType = request.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const body = await request.json() as any;
        if (body && body.fileName) fileName = body.fileName;
      } else {
        // フォームデータの読み取りは複雑なため、デフォルト値を使用するか
        // 必要であれば request.formData() を試みる
        // const formData = await request.formData();
        // const file = formData.get('file');
      }
    } catch (e) {
      console.warn("Mock upload-job parse error", e);
    }

    return HttpResponse.json({
      ...uploadJob,
      jobId: `${uploadJob.jobId}-${Math.random().toString(36).slice(2, 6)}`,
      uploadUrl: withBase(`/files/storage/${fileName}`),
    });
  }),
  http.post(withBase("/files/upload-complete"), () =>
    HttpResponse.text("", { status: 200 }),
  ),
  // Handle the mocked storage PUT request to prevent external fetch errors
  http.put(withBase("/files/storage/:fileName"), () =>
    HttpResponse.text("", { status: 200 })
  ),
];
