/**
 * Matching question type (ID: 4)
 *
 * ペアマッチング形式
 */

import { SubQuestion } from './problem';

export interface MatchingPair {
  id: string;
  question: string; // LaTeX/Markdown対応
  answer: string; // LaTeX/Markdown対応
  order?: number;
}

export interface MatchingSubQuestion extends SubQuestion {
  questionTypeId: 4;
  pairs: MatchingPair[];
}

export interface MatchingFormData {
  id: string;
  content: string;
  pairs: MatchingPair[];
} 

export interface MatchingValidation {
  isValid: boolean;
  errors: {
    content?: string[];
    pairs?: {
      [pairId: string]: {
        question?: string[];
        answer?: string[];
      };
    };
  };
}
