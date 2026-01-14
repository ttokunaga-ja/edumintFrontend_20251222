import { axiosInstance } from '@/lib/axios';

export type GenerationCurrentStep =
  | 'waiting_for_upload'
  | 'uploading'
  | 'upload_verifying'
  // Phase 1: Raw to Markdown
  | 'phase1_markdown_generating'
  // Phase 2: Structure Analysis
  | 'phase2_structure_analyzing'
  | 'structure_review'          // ユーザー確認待ち
  // Phase 3: Content Generation
  | 'phase3_content_generating'
  | 'postprocessing'
  | 'completed';

export type GenerationJobStatus = 'queued' | 'processing' | 'paused' | 'completed' | 'failed';

export interface GenerationStatusResponse {
  jobId: string;
  status: GenerationJobStatus;
  currentStep: GenerationCurrentStep;
  phase: 1 | 2 | 3;  // 現在のPhase番号
  progress: number;
  data?: any;
  problemId?: string;
  errorCode?: string;
  errorMessage?: string;
  message?: string;
  updatedAt: string;
}

import { ENDPOINTS } from '../endpoints';

export const startStructureGeneration = async (payload: any) => {
  const { data } = await axiosInstance.post(ENDPOINTS.generation.startStructure, payload);
  return data;
};

export const getGenerationStatus = async (jobId: string): Promise<GenerationStatusResponse> => {
  const { data } = await axiosInstance.get(ENDPOINTS.generation.getStatus(jobId));
  return data;
};

export const confirmStructure = async (jobId: string, structureData?: any) => {
  const { data } = await axiosInstance.post(ENDPOINTS.generation.confirmStructure(jobId), { structureData });
  return data;
};
