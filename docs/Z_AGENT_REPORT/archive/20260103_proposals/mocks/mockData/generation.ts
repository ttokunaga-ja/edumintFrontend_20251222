import type { GenerationStatusResponse } from "@/services/api/gateway/generation";

export const generationStatuses: GenerationStatusResponse[] = [
  {
    jobId: "gen-job-1",
    status: "processing",
    progress: 45,
    currentStep: "AI解析中",
    eta: 30,
  },
  {
    jobId: "gen-job-2",
    status: "completed",
    progress: 100,
    currentStep: "完了",
    eta: 0,
    problemId: "exam-1",
  },
  {
    jobId: "gen-job-3",
    status: "queued",
    progress: 0,
    currentStep: "待機中",
    eta: 120,
  },
  {
    jobId: "gen-job-4",
    status: "processing",
    progress: 85,
    currentStep: "解答生成中",
    eta: 10,
  },
  {
    jobId: "gen-job-err",
    status: "error",
    progress: 0,
    currentStep: "failed",
    errorMessage: "アップロードに失敗しました",
  },
];
