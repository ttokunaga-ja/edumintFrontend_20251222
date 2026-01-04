/**
 * Problem domain types
 *
 * Problem, Question, SubQuestion の基本型定義
 */

export interface Difficulty {
  id: number;
  label: string;
  level: number; // 1-5
}

export interface Keyword {
  id: string;
  keyword: string;
  createdAt?: string;
}

/**
 * Problem（試験）全体
 */
export interface Problem {
  id: string;
  title: string;
  subject: string;
  year: number;
  university: string;
  creatorId: string;
  creatorName: string;
  isPublic: boolean;
  status: 'draft' | 'published' | 'archived';
  difficulty?: Difficulty;
  keywords: Keyword[];
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Question（大問）
 */
export interface Question {
  id: string;
  problemId: string;
  questionNumber: number;
  content: string;
  difficulty?: Difficulty;
  keywords: Keyword[];
  subQuestions: SubQuestion[];
  createdAt: string;
  updatedAt: string;
}

/**
 * SubQuestion（小問）基本インターフェース
 */
export interface SubQuestion {
  id: string;
  questionId: string;
  subQuestionNumber: number;
  questionTypeId: number; // 1-5, 10-14
  content: string;
  format?: 0 | 1; // 0: Markdown, 1: LaTeX (legacy - kept for validators)
  difficulty?: Difficulty;
  keywords: Keyword[];
  createdAt: string;
  updatedAt: string;
} 

/**
 * ProblemEditorState - エディタ用の状態管理
 */
export interface ProblemEditorState {
  problem: Problem;
  isDirty: boolean;
  unsavedChanges: Set<string>; // changed field IDs
  lastSavedAt?: string;
}
