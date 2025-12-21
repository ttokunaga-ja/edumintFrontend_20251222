import {
  API_BASE_URL,
  getHeaders,
  handleResponse,
  ApiError,
} from '../httpClient';

export interface GenerationSettings {
  autoGenerateQuestions: boolean;
  questionCount?: number;
  includeAnswers: boolean;
  includeSolutions: boolean;
  difficultyLevel: number;
  questionTypes: number[];
  extractKeywords: boolean;
  isPublic: boolean;
  useAdvancedAI: boolean;
  preserveFormatting: boolean;
  detectDiagrams: boolean;
  splitBySection: boolean;
  generatePracticeTests: boolean;
  optimizeForMobile: boolean;
}

export const updateGenerationSettings = async (
  jobId: string,
  settings: GenerationSettings
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/generation-settings`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ jobId, settings }),
  });

  if (!response.ok) {
    throw new ApiError(response.status, 'Failed to update generation settings');
  }
};

export interface GenerationStatusResponse {
  jobId: string;
  status: 'pending' | 'queued' | 'processing' | 'paused' | 'completed' | 'error' | 'failed';
  progress: number;
  currentStep?: string;
  eta?: number;
  problemId?: string;
  errorMessage?: string;
  message?: string;
  estimatedTime?: number;
  data?: { problemId?: string };
}

export const getGenerationStatus = async (jobId: string): Promise<GenerationStatusResponse> => {
  const response = await fetch(`${API_BASE_URL}/generation/status/${jobId}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  return handleResponse<GenerationStatusResponse>(response);
};

export const cancelGenerationJob = async (jobId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/generation/cancel/${jobId}`, {
    method: 'POST',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new ApiError(response.status, 'Failed to cancel generation job');
  }
};

export const resumeGenerationJob = async (jobId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/generation/resume/${jobId}`, {
    method: 'POST',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new ApiError(response.status, 'Failed to resume generation job');
  }
};

export const retryGenerationJob = async (jobId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/generation/retry/${jobId}`, {
    method: 'POST',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new ApiError(response.status, 'Failed to retry generation job');
  }
};

export const startStructureGeneration = async (structureId: string): Promise<{ jobId: string }> => {
  const response = await fetch(`${API_BASE_URL}/generation/start`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ structureId }),
  });

  if (!response.ok) {
    throw new ApiError(response.status, 'Failed to start structure generation');
  }

  return handleResponse<{ jobId: string }>(response);
};
