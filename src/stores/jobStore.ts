import { create } from 'zustand';

interface JobState {
  jobId: string | null;
  phase: 'idle' | 'Structure_uploading' | 'Structure_parsing' | 'Structure_confirmed' | 'Generation_creating' | 'Generation_completed' | 'Structure_failed' | 'Generation_failed';
  data: any; // 構造データや生成結果
  error: string | null;
  setJob: (jobId: string) => void;
  updatePhase: (phase: 'idle' | 'Structure_uploading' | 'Structure_parsing' | 'Structure_confirmed' | 'Generation_creating' | 'Generation_completed' | 'Structure_failed' | 'Generation_failed', data?: any) => void;
  setError: (error: string) => void;
}

export const useJobStore = create<JobState>((set) => ({
  jobId: null,
  phase: 'idle',
  data: null,
  error: null,
  setJob: (jobId) => set({ jobId, phase: 'Structure_uploading' }),
  updatePhase: (phase, data) => set({ phase, data }),
  setError: (error) => set({ error }),
}));