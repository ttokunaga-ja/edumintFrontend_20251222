/**
 * Ordering question type (ID: 5)
 *
 * 順序並べ替え形式
 */

import { SubQuestion } from './problem';

export interface OrderingItem {
  id: string;
  text: string; // LaTeX/Markdown対応
  correctOrder?: number;
}

export interface OrderingSubQuestion extends SubQuestion {
  questionTypeId: 5;
  items: OrderingItem[];
}

export interface OrderingFormData {
  id: string;
  content: string;
  items: OrderingItem[];
} 

export interface OrderingValidation {
  isValid: boolean;
  errors: {
    content?: string[];
    items?: {
      [itemId: string]: string[];
    };
  };
}
