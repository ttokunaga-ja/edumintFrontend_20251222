import type { UploadJobResponse } from "@/services/api/gateway/files"; export const uploadJob: UploadJobResponse = { jobId: "mock-upload-job", uploadUrl: "https://storage.example.com/upload/mock", expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
};
