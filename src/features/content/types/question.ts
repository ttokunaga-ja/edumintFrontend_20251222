/**
 * Question domain types - Extension
 */

import { Question, Difficulty, Keyword } from './problem';

/**
 * QuestionEditState - 大問編集状態
 */
export interface QuestionEditState {
  question: Question;
  isDirty: boolean;
  unsavedFields: Set<string>;
}

/**
 * QuestionFormData - フォーム用データ
 */
export interface QuestionFormData {
  id: string;
  content: string;
  difficulty?: Difficulty;
  keywords: Keyword[];
}

/**
 * QuestionValidation - バリデーション結果
 */
export interface QuestionValidation {
  isValid: boolean;
  errors: {
    content?: string[];
    difficulty?: string[];
    keywords?: string[];
  };
}
