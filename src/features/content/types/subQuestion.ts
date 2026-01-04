/**
 * SubQuestion domain types - Extension
 */

import { SubQuestion, Difficulty, Keyword } from './problem';

/**
 * SubQuestionEditState - 小問編集状態
 */
export interface SubQuestionEditState {
  subQuestion: SubQuestion;
  isDirty: boolean;
  unsavedFields: Set<string>;
}

/**
 * SubQuestionFormData - フォーム用データ
 */
export interface SubQuestionFormData {
  id: string;
  questionTypeId: number;
  content: string;
  difficulty?: Difficulty;
  keywords: Keyword[];
}

/**
 * SubQuestionValidation - バリデーション結果
 */
export interface SubQuestionValidation {
  isValid: boolean;
  errors: {
    content?: string[];
    questionTypeId?: string[];
    difficulty?: string[];
    keywords?: string[];
  };
}
