import type { GenerationStatusResponse, GenerationCurrentStep } from '@/services/api/gateway/generation';

/**
 * フロントエンドの表示用フェーズ（大カテゴリ）
 * バックエンドの currentStep を集約した表示状態
 */
export type GenerationPhase =
  | 'queued' // ジョブ登録済み、ファイル待ち
  | 'uploading' // ファイルアップロード中/検証中
  | 'analyzing' // OCR/テキスト抽出/セクション分割
  | 'structure-review' // 構造検出/ユーザー確認待ち
  | 'generating' // AI生成中（スロット待ち含む）
  | 'postprocessing' // 出力検証/正規化
  | 'complete' // 正常完了
  | 'paused' // 一時停止
  | 'error'; // エラー

export type GenerationMachineState = {
  phase: GenerationPhase;
  currentStep: GenerationCurrentStep;
  progress: number;
  problemId?: string;
  errorCode?: string;
  errorMessage?: string;
  lastUpdated?: number;
};

/**
 * currentStep からフロントエンドの phase を決定
 */
const mapStepToPhase = (
  status: GenerationStatusResponse['status'],
  currentStep: GenerationCurrentStep,
): GenerationPhase => {
  // ステータスが完了/一時停止/失敗の場合は優先
  if (status === 'completed') return 'complete';
  if (status === 'paused') return 'paused';
  if (status === 'failed') return 'error';

  // currentStep から phase を判定
  switch (currentStep) {
    case 'waiting_for_upload':
      return 'queued';
    case 'uploading':
    case 'upload_verifying':
      return 'uploading';
    // Phase 1 & 2を'analyzing'にマッピング（UIは変更しない）
    case 'phase1_markdown_generating':
    case 'phase2_structure_analyzing':
      return 'analyzing';
    case 'structure_review':
      return 'structure-review';
    // Phase 3を'generating'にマッピング
    case 'phase3_content_generating':
      return 'generating';
    case 'postprocessing':
      return 'postprocessing';
    case 'completed':
      return 'complete';
    default:
      return status === 'queued' ? 'queued' : 'generating';
  }
};

/**
 * progress の範囲を phase に応じて調整
 */
const computeProgress = (phase: GenerationPhase, raw: number): number => {
  const safeRaw = Math.max(0, Math.min(100, raw));

  switch (phase) {
    case 'queued':
      return Math.min(safeRaw, 5);
    case 'uploading':
      return Math.max(5, Math.min(safeRaw, 20));
    case 'analyzing':
      return Math.max(20, Math.min(safeRaw, 40));
    case 'structure-review':
      return Math.max(40, Math.min(safeRaw, 50));
    case 'generating':
      return Math.max(50, Math.min(safeRaw, 85));
    case 'postprocessing':
      return Math.max(85, Math.min(safeRaw, 95));
    case 'complete':
      return 100;
    case 'paused':
    case 'error':
      return safeRaw;
    default:
      return safeRaw;
  }
};

/**
 * バックエンドのレスポンスから次の状態を計算
 */
export const nextGenerationState = (
  current: GenerationMachineState,
  status: GenerationStatusResponse,
): GenerationMachineState => {
  const phase = mapStepToPhase(status.status, status.currentStep);
  const progress = computeProgress(phase, status.progress);

  if (phase === 'error') {
    return {
      phase: 'error',
      currentStep: status.currentStep,
      progress,
      problemId: current.problemId,
      errorCode: status.errorCode,
      errorMessage: status.errorMessage || status.message || '生成に失敗しました',
      lastUpdated: Date.now(),
    };
  }

  return {
    phase,
    currentStep: status.currentStep,
    progress,
    problemId: status.problemId ?? current.problemId,
    errorCode: undefined,
    errorMessage: undefined,
    lastUpdated: Date.now(),
  };
};

export const initialGenerationState: GenerationMachineState = {
  phase: 'queued',
  currentStep: 'waiting_for_upload',
  progress: 0,
};

export const seedAfterStart: GenerationMachineState = {
  phase: 'uploading',
  currentStep: 'uploading',
  progress: 10,
};
