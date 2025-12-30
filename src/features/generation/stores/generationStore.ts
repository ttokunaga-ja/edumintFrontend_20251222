import { create } from 'zustand';

/**
 * 生成フェーズの状態遷移（3フェーズに統合）:
 * - start: 生成開始（ファイルアップロード・オプション設定）
 * - analyzing: 解析中（OCR/構造解析）
 * - structure_confirmed: 構造解析完了・確認ページ
 * - generating: 生成中
 * - completed: 生成完了・編集可能
 */
export type GenerationPhase = 'start' | 'analyzing' | 'structure_confirmed' | 'generating' | 'completed';

export type GenerationMode = 'exercise' | 'document';

export interface GenerationOptions {
  difficulty?: 'auto' | 'basic' | 'standard' | 'advanced' | 'expert';
  count?: number; // 問題数（資料から生成時）
  includeCharts?: boolean; // 図表を使用
  checkStructure?: boolean; // 問題構造を確認
  isPublic?: boolean; // 生成問題を公開
  formats?: string[]; // 問題形式
  autoFormat?: boolean; // 形式を自動設定
}

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  file: File;
}

export interface GenerationState {
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
      difficulty: string;
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
  phase: 'start' as GenerationPhase,
  mode: 'exercise' as GenerationMode,
  files: [],
  inputText: '',
  options: {
    difficulty: 'auto' as const,
    count: 10,
    includeCharts: true,
    checkStructure: false,
    isPublic: true, // デフォルトで自動公開
    formats: [],
    autoFormat: true,
  },
};

export const useGenerationStore = create<GenerationState>((set) => ({
  ...initialState,

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
