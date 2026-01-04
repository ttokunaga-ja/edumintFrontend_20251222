/**
 * Selection question type (ID: 1, 2, 3)
 *
 * 1: Single choice
 * 2: Multiple choice
 * 3: True/False
 */

import { SubQuestion } from './problem';

export interface SelectionOption {
  id: string;
  content: string; // LaTeX/Markdown対応
  isCorrect: boolean;
  order?: number;
}

export interface SelectionSubQuestion extends SubQuestion {
  questionTypeId: 1 | 2 | 3;
  options: SelectionOption[];
}

export interface SelectionFormData {
  id: string;
  content: string;
  options: SelectionOption[];
} 

export interface SelectionValidation {
  isValid: boolean;
  errors: {
    content?: string[];
    options?: {
      [optionId: string]: string[];
    };
    correctAnswers?: string[];
  };
}
