import { create } from 'zustand';

/**
 * 生成フェーズの状態遷移（数値ID管理）:
 * Structure Phase (0-9)
 * - 0: structure_uploading
 * - 1: structure_queued
 * - 2: structure_analysing
 * - 3: structure_confirmed (User Action Required)
 * - 4: structure_completed
 * - 8: structure_failed
 * - 9: structure_retry
 * 
 * Generation Phase (10-19)
 * - 10: generation_preparing
 * - 11: generation_queued
 * - 12: generation_creating
 * - 13: generation_confirmed (User Action Required)
 * - 14: generation_completed
 * - 18: generation_failed
 * - 19: generation_retry
 * 
 * Publication Phase (20-29)
 * - 20: publication_saving
 * - 21: publication_publishing
 */
export type GenerationPhase =
  | 0 | 1 | 2 | 3 | 4 | 8 | 9
  | 10 | 11 | 12 | 13 | 14 | 18 | 19
  | 20 | 21;

export type GenerationMode = 'exercise' | 'document';

export interface GenerationOptions {
  level?: 'auto' | 'basic' | 'standard' | 'advanced';
  count?: number; // 問題数（資料から生成時）
  includeCharts?: boolean; // 図表を使用
  checkStructure?: boolean; // 問題構造を確認
  isPublic?: boolean; // 生成問題を公開
  questionType?: (string | number)[]; // 問題形式（数値 ID または文字列）
  autoFormat?: boolean; // 形式を自動設定
}

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  file: File;
}

export interface GenerationState {
  // ジョブID
  jobId: string | null;
  setJobId: (id: string | null) => void;

  // 生成された試験ID (リダイレクト用)
  examId: string | null;
  setExamId: (id: string | null) => void;

  // フェーズ
  phase: GenerationPhase;
  setPhase: (phase: GenerationPhase) => void;

  // 生成モード
  mode: GenerationMode;
  setMode: (mode: GenerationMode) => void;

  // アップロードファイル（複数対応）
  files: UploadedFile[];
  setFiles: (files: UploadedFile[]) => void;
  addFiles: (files: UploadedFile[]) => void;
  removeFile: (fileName: string) => void;

  // テキスト入力（直接入力時）
  inputText: string;
  setInputText: (text: string) => void;

  // 生成オプション
  options: GenerationOptions;
  setOptions: (options: Partial<GenerationOptions>) => void;

  // 生成結果（構造確定フェーズで使用）
  structureData?: {
    title: string;
    subjects: string[];
    problems: Array<{
      id: string;
      type: string;
      level: string;
    }>;
  };
  setStructureData: (data: any) => void;

  // 生成結果（完了フェーズで使用）
  generatedProblems?: any[];
  setGeneratedProblems: (problems: any[]) => void;

  // リセット
  reset: () => void;
}

const initialState = {
  jobId: null,
  examId: null,
  phase: 0 as GenerationPhase, // 0: structure_uploading
  mode: 'exercise' as GenerationMode,
  files: [],
  inputText: '',
  options: {
    level: 'auto' as const,
    count: 10,
    includeCharts: true,
    checkStructure: false,
    isPublic: true, // デフォルトで自動公開
    questionType: [],
    autoFormat: true,
  },
};

export const useGenerationStore = create<GenerationState>((set) => ({
  ...initialState,

  setJobId: (jobId) => set({ jobId }),
  setExamId: (examId) => set({ examId }),

  setPhase: (phase) => set({ phase }),

  setMode: (mode) => set({ mode }),

  setFiles: (files) => set({ files }),

  addFiles: (newFiles) =>
    set((state) => ({
      files: [...state.files, ...newFiles],
    })),

  removeFile: (fileName) =>
    set((state) => ({
      files: state.files.filter((f) => f.name !== fileName),
    })),

  setInputText: (text) => set({ inputText: text }),

  setOptions: (options) =>
    set((state) => ({
      options: { ...state.options, ...options },
    })),

  setStructureData: (data) => set({ structureData: data }),

  setGeneratedProblems: (problems) => set({ generatedProblems: problems }),

  reset: () => set(initialState),
}));
