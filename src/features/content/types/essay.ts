/**
 * Essay question type (ID: 10-14)
 *
 * 10: 記述式
 * 11: 証明問題
 * 12: コード記述
 * 13: 翻訳
 * 14: 数値計算
 */

import { SubQuestion } from './problem';

export interface EssayAnswer {
  id: string;
  sampleAnswer: string; // LaTeX/Markdown対応
  gradingCriteria: string; // LaTeX/Markdown対応
  pointValue?: number;
}

export interface EssaySubQuestion extends SubQuestion {
  questionTypeId: 10 | 11 | 12 | 13 | 14;
  answers: EssayAnswer[];
  isAutoGradable?: boolean;
}

export interface EssayFormData {
  id: string;
  content: string;
  answers: EssayAnswer[];
} 

export interface EssayValidation {
  isValid: boolean;
  errors: {
    content?: string[];
    answers?: {
      [answerId: string]: {
        sampleAnswer?: string[];
        gradingCriteria?: string[];
      };
    };
  };
}
