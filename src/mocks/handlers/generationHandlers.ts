import { http, HttpResponse, delay } from "msw";
import { generationStatuses } from "../mockData/generation";
import type { GenerationStatusResponse, GenerationJobStatus, GenerationCurrentStep } from "@/services/api/gateway/generation";

type JobState = {
  stepIndex: number;
  status: GenerationJobStatus;
  currentStep: GenerationCurrentStep;
  progress: number;
  problemId?: string;
  errorCode?: string;
  errorMessage?: string;
  locked: boolean;
  paused: boolean;
  lastTransitionAt: number;
  nextDueAt?: number;
};

/**
 * バックエンドの生成フロー（詳細なステップ定義）
 * 実際のバックエンドの処理段階を模倣
 */
const generationFlow: Array<{
  status: GenerationJobStatus;
  currentStep: GenerationCurrentStep;
  progress: number;
  delayMs: number; // 各ステップの処理時間を模倣
}> = [
  { status: 'queued', currentStep: 'waiting_for_upload', progress: 0, delayMs: 500 },
  { status: 'processing', currentStep: 'uploading', progress: 10, delayMs: 1000 },
  { status: 'processing', currentStep: 'upload_verifying', progress: 15, delayMs: 800 },
  { status: 'processing', currentStep: 'extracting', progress: 25, delayMs: 2000 },
  { status: 'processing', currentStep: 'sectioning', progress: 35, delayMs: 1500 },
  { status: 'processing', currentStep: 'structure_detecting', progress: 45, delayMs: 2000 },
  { status: 'processing', currentStep: 'structure_review', progress: 50, delayMs: 0 }, // ユーザー確認待ち（自動進行しない）
  { status: 'processing', currentStep: 'waiting_for_slot', progress: 55, delayMs: 1000 },
  { status: 'processing', currentStep: 'generating', progress: 75, delayMs: 3000 },
  { status: 'processing', currentStep: 'postprocessing', progress: 90, delayMs: 1500 },
  { status: 'completed', currentStep: 'completed', progress: 100, delayMs: 0 },
];

const jobStates: Record<string, JobState> = {};

// 初期モックデータをシード（既存のエラーケースなど）
for (const status of generationStatuses) {
  jobStates[status.jobId] = {
    stepIndex: 0,
    status: status.status as GenerationJobStatus,
    currentStep: (status.currentStep || 'waiting_for_upload') as GenerationCurrentStep,
    progress: status.progress,
    problemId: status.problemId,
    errorCode: status.errorCode,
    errorMessage: status.errorMessage,
    locked: status.status === 'completed' || status.status === 'failed',
    paused: status.status === 'paused',
    lastTransitionAt: Date.now(),
  };
}

const apiBase =
  (import.meta.env?.VITE_API_BASE_URL as string | undefined)?.replace(
    /\/$/,
    "",
  ) ?? "";
const withBase = (path: string) => `${apiBase}${path}`;

/**
 * ジョブの状態を次のステップに進める
 */
const advanceJobState = (jobId: string): void => {
  const state = jobStates[jobId];
  if (!state || state.locked || state.paused) return;

  // structure_review は手動確認待ちなので自動進行しない
  if (state.currentStep === 'structure_review') {
    return;
  }

  // 次のステップへ
  const nextIndex = state.stepIndex + 1;
  if (nextIndex >= generationFlow.length) {
    state.locked = true;
    return;
  }

  const nextStep = generationFlow[nextIndex];
  state.stepIndex = nextIndex;
  state.status = nextStep.status;
  state.currentStep = nextStep.currentStep;
  state.progress = nextStep.progress;
  state.lastTransitionAt = Date.now();
  state.nextDueAt = state.lastTransitionAt + nextStep.delayMs;

  // 完了時に problemId を付与
  if (nextStep.status === 'completed') {
    state.problemId = `problem-${jobId}`;
    state.locked = true;
  }
};

/**
 * GET /generation/status/:jobId
 */
const statusHandler = async ({ params }: { params: any }) => {
  const jobId = String(params.jobId);

  // 新規ジョブの場合は初期化
  if (!jobStates[jobId]) {
    jobStates[jobId] = {
      stepIndex: 0,
      status: 'queued',
      currentStep: 'waiting_for_upload',
      progress: 0,
      locked: false,
      paused: false,
      lastTransitionAt: Date.now(),
      nextDueAt: Date.now() + generationFlow[0].delayMs,
    };
  }

  const state = jobStates[jobId];

  // エラーケースのシード（モックデータから）
  const isErrorSeed = generationStatuses.find(
    (s) => s.jobId === jobId && s.status === 'failed'
  );
  if (isErrorSeed) {
    await delay(200);
    return HttpResponse.json({
      jobId,
      status: 'failed' as GenerationJobStatus,
      currentStep: state.currentStep,
      progress: state.progress,
      errorCode: isErrorSeed.errorCode || 'unknown_error',
      errorMessage: isErrorSeed.errorMessage || '生成に失敗しました',
    } satisfies GenerationStatusResponse);
  }

  // 現在のステップの遅延を模倣
  const currentFlow = generationFlow[state.stepIndex];
  await delay(Math.min(currentFlow.delayMs, 300)); // テスト高速化のため上限設定

  // 経過時間に基づいて状態を進める（ロック・ポーズ・構造確認待ちを除外）
  const now = Date.now();
  const dueAt = state.nextDueAt ?? state.lastTransitionAt + currentFlow.delayMs;
  if (!state.locked && !state.paused && state.currentStep !== 'structure_review' && now >= dueAt) {
    advanceJobState(jobId);
  }

  const response: GenerationStatusResponse = {
    jobId,
    status: state.status,
    currentStep: state.currentStep,
    progress: state.progress,
    problemId: state.problemId,
    errorCode: state.errorCode,
    errorMessage: state.errorMessage,
    message: `Processing: ${state.currentStep}`,
  };

  return HttpResponse.json(response);
};

/**
 * POST /generation/start
 */
const startHandler = async () => {
  const jobId = `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  
  // 新規ジョブを初期化
  jobStates[jobId] = {
    stepIndex: 1, // uploading から開始
    status: 'processing',
    currentStep: 'uploading',
    progress: 10,
    locked: false,
    paused: false,
    lastTransitionAt: Date.now(),
    nextDueAt: Date.now() + generationFlow[1].delayMs,
  };

  await delay(100);
  return HttpResponse.json({ jobId });
};

/**
 * POST /generation/cancel/:jobId
 */
const cancelHandler = async ({ params }: { params: any }) => {
  const jobId = String(params.jobId);
  if (jobStates[jobId]) {
    jobStates[jobId].locked = true;
    jobStates[jobId].status = 'failed';
    jobStates[jobId].errorMessage = 'ユーザーによりキャンセルされました';
  }
  await delay(100);
  return HttpResponse.text("", { status: 200 });
};

/**
 * POST /generation/confirm/:jobId
 * User confirms structure review and allows auto progression
 */
const confirmHandler = async ({ params }: { params: any }) => {
  const jobId = String(params.jobId);
  const state = jobStates[jobId];
  if (state && state.currentStep === 'structure_review') {
    // advance one step to proceed past structure_review (manual advance as advanceJobState blocks it)
    const nextIndex = state.stepIndex + 1;
    if (nextIndex < generationFlow.length) {
      const nextStep = generationFlow[nextIndex];
      state.stepIndex = nextIndex;
      state.status = nextStep.status;
      state.currentStep = nextStep.currentStep;
      state.progress = nextStep.progress;
      state.lastTransitionAt = Date.now();
      state.nextDueAt = state.lastTransitionAt + nextStep.delayMs;
    }
  }
  await delay(100);
  return HttpResponse.text("", { status: 200 });
};

/**
 * POST /generation/resume/:jobId
 */
const resumeHandler = async ({ params }: { params: any }) => {
  const jobId = String(params.jobId);
  if (jobStates[jobId] && jobStates[jobId].paused) {
    jobStates[jobId].paused = false;
    jobStates[jobId].status = 'processing';
  }
  await delay(100);
  return HttpResponse.text("", { status: 200 });
};

/**
 * POST /generation/retry/:jobId
 */
const retryHandler = async ({ params }: { params: any }) => {
  const jobId = String(params.jobId);
  const state = jobStates[jobId];
  
  if (state) {
    // エラーから再開（前のステップに戻す）
    const retryIndex = Math.max(0, state.stepIndex - 1);
    const retryStep = generationFlow[retryIndex];
    
    state.stepIndex = retryIndex;
    state.status = retryStep.status;
    state.currentStep = retryStep.currentStep;
    state.progress = retryStep.progress;
    state.locked = false;
    state.paused = false;
    state.errorCode = undefined;
    state.errorMessage = undefined;
  }
  
  await delay(100);
  return HttpResponse.text("", { status: 200 });
};

/**
 * POST /generation-settings
 */
const settingsHandler = async () => {
  await delay(100);
  return HttpResponse.text("", { status: 200 });
};

export const generationHandlers = [
  // Status endpoint
  http.get(withBase("/generation/status/:jobId"), statusHandler),
  http.get("*/generation/status/:jobId", statusHandler),

  // Control endpoints
  http.post(withBase("/generation/start"), startHandler),
  http.post(withBase("/generation/cancel/:jobId"), cancelHandler),
  http.post(withBase("/generation/confirm/:jobId"), confirmHandler),
  http.post(withBase("/generation/resume/:jobId"), resumeHandler),
  http.post(withBase("/generation/retry/:jobId"), retryHandler),
  http.post(withBase("/generation-settings"), settingsHandler),
];
