/**
 * Schema Mappers - DB/API ↔ Frontend ローカルデータ形式の変換
 *
 * バックエンドDB設計（Q_DATABASE.md）に準拠したマッパー関数群
 * 
 * DB スキーマ:
 * - exams.id
 * - questions: question_id, question_number, question_content, question_format, difficulty
 * - sub_questions: sub_question_id, question_id, sub_question_number, sub_question_type_id, question_content, answer_explanation
 * - keywords: keyword_id, keyword (text)
 * - question_keywords: question_id, keyword_id
 * - sub_question_keywords: sub_question_id, keyword_id
 */

import { Question, SubQuestion, Keyword } from '../types';

/**
 * フロントエンド内部形式: 大問
 */
export interface LocalQuestion {
  id: string; // question_id (backend)
  question_number: number; // from DB
  question_content: string; // from DB
  question_format: 0 | 1; // from DB (0: Markdown, 1: LaTeX)
  difficulty: number; // from DB
  keywords: Array<{ id: string; keyword: string }>; // from question_keywords + keywords
  sub_questions: LocalSubQuestion[];
}

/**
 * フロントエンド内部形式: 小問
 */
export interface LocalSubQuestion {
  id: string; // sub_question_id (backend)
  question_id: string; // foreign key to questions
  sub_question_number: number; // from DB
  sub_question_type_id: number; // from DB (ID: 1-5, 10-14)
  question_content: string; // from sub_questions.sub_question_content
  question_format: 0 | 1; // format for question (0: Markdown, 1: LaTeX)
  answer_explanation: string; // from sub_questions.answer_explanation
  answer_format: 0 | 1; // format for answer (0: Markdown, 1: LaTeX)
  keywords: Array<{ id: string; keyword: string }>; // from sub_question_keywords + keywords
  // 形式別データ（オプション）
  options?: Array<{ id: string; content: string; isCorrect: boolean }>; // For IDs 1-3
  pairs?: Array<{ id: string; question: string; answer: string }>; // For ID 4
  items?: Array<{ id: string; text: string; correctOrder: number }>; // For ID 5
  answers?: Array<{ id: string; sampleAnswer: string; gradingCriteria: string; pointValue: number }>; // For IDs 10-14
}

/**
 * ProblemEditor で使用するローカル形式（互換性用）
 * question_type_id キー名が異なるため変換が必要
 */
export interface LegacyLocalQuestion {
  id: string;
  question_number: number;
  question_content: string;
  question_format: 0 | 1;
  difficulty: number;
  keywords: Array<{ id: string; keyword: string }>;
  sub_questions: LegacyLocalSubQuestion[];
  // Legacy aliases
  questionNumber?: number;
  questionContent?: string;
  questionFormat?: 0 | 1;
  subQuestions?: LegacyLocalSubQuestion[];
}

export interface LegacyLocalSubQuestion {
  id: string;
  question_id?: string;
  sub_question_number: number;
  question_type_id: number;
  question_content: string;
  question_format: 0 | 1;
  answer_content: string;
  answer_format: 0 | 1;
  keywords?: Array<{ id: string; keyword: string }>;
  options?: Array<{ id: string; content: string; isCorrect: boolean }>;
  pairs?: Array<{ id: string; question: string; answer: string }>;
  items?: Array<{ id: string; text: string; correctOrder: number }>;
  answers?: Array<{ id: string; sampleAnswer: string; gradingCriteria: string; pointValue: number }>;
  // Legacy aliases
  subQuestionNumber?: number;
  questionTypeId?: number;
  questionContent?: string;
  questionFormat?: 0 | 1;
  answerContent?: string;
  answerFormat?: 0 | 1;
}

/**
 * Backend Question → Frontend LocalQuestion
 */
export function fromBackendQuestion(backendQuestion: any): LocalQuestion {
  return {
    id: backendQuestion.id || backendQuestion.question_id,
    question_number: backendQuestion.question_number || backendQuestion.questionNumber || 0,
    question_content: backendQuestion.question_content || backendQuestion.questionContent || '',
    question_format: backendQuestion.question_format ?? backendQuestion.questionFormat ?? 0,
    difficulty: backendQuestion.difficulty ?? 1,
    keywords: backendQuestion.keywords || [],
    sub_questions: (backendQuestion.sub_questions || backendQuestion.subQuestions || []).map(
      fromBackendSubQuestion
    ),
  };
}

/**
 * Backend SubQuestion → Frontend LocalSubQuestion
 */
export function fromBackendSubQuestion(backendSubQuestion: any): LocalSubQuestion {
  const questionTypeId = backendSubQuestion.sub_question_type_id ?? backendSubQuestion.questionTypeId ?? 1;
  
  return {
    id: backendSubQuestion.id || backendSubQuestion.sub_question_id,
    question_id: backendSubQuestion.question_id || backendSubQuestion.questionId || '',
    sub_question_number: backendSubQuestion.sub_question_number || backendSubQuestion.subQuestionNumber || 0,
    sub_question_type_id: questionTypeId,
    question_content: backendSubQuestion.question_content || backendSubQuestion.questionContent || '',
    question_format: backendSubQuestion.question_format ?? backendSubQuestion.questionFormat ?? 0,
    answer_explanation: backendSubQuestion.answer_explanation || backendSubQuestion.answerContent || backendSubQuestion.answer_content || '',
    answer_format: backendSubQuestion.answer_format ?? backendSubQuestion.answerFormat ?? 0,
    keywords: backendSubQuestion.keywords || [],
    // 形式別データ
    options: backendSubQuestion.options,
    pairs: backendSubQuestion.pairs,
    items: backendSubQuestion.items,
    answers: backendSubQuestion.answers,
  };
}

/**
 * Frontend LocalQuestion → Backend Question (API送信用)
 */
export function toBackendQuestion(localQuestion: LocalQuestion | LegacyLocalQuestion): any {
  const q = localQuestion as any;
  return {
    id: q.id,
    question_number: q.question_number || q.questionNumber || 0,
    question_content: q.question_content || q.questionContent || '',
    question_format: q.question_format ?? q.questionFormat ?? 0,
    difficulty: q.difficulty ?? 1,
    keywords: q.keywords || [],
    sub_questions: (q.sub_questions || q.subQuestions || []).map(toBackendSubQuestion),
  };
}

/**
 * Frontend LocalSubQuestion → Backend SubQuestion (API送信用)
 */
export function toBackendSubQuestion(localSubQuestion: LocalSubQuestion | LegacyLocalSubQuestion): any {
  const sq = localSubQuestion as any;
  const typeId = sq.sub_question_type_id ?? sq.questionTypeId ?? 1;
  
  return {
    id: sq.id,
    question_id: sq.question_id || sq.questionId || '',
    sub_question_number: sq.sub_question_number || sq.subQuestionNumber || 0,
    sub_question_type_id: typeId,
    question_content: sq.question_content || sq.questionContent || '',
    question_format: sq.question_format ?? sq.questionFormat ?? 0,
    answer_explanation: sq.answer_explanation || sq.answerContent || sq.answer_content || '',
    answer_format: sq.answer_format ?? sq.answerFormat ?? 0,
    keywords: sq.keywords || [],
    // 形式別データ
    options: sq.options,
    pairs: sq.pairs,
    items: sq.items,
    answers: sq.answers,
  };
}

/**
 * Backend Question → LegacyLocalQuestion (ProblemEditor用互換性)
 * 
 * ProblemEditor では camelCase が使用されるため、変換が必要
 */
export function toLegacyQuestion(localQuestion: LocalQuestion): LegacyLocalQuestion {
  return {
    id: localQuestion.id,
    question_number: localQuestion.question_number,
    questionNumber: localQuestion.question_number, // Alias
    question_content: localQuestion.question_content,
    questionContent: localQuestion.question_content, // Alias
    question_format: localQuestion.question_format,
    questionFormat: localQuestion.question_format, // Alias
    difficulty: localQuestion.difficulty,
    keywords: localQuestion.keywords,
    sub_questions: localQuestion.sub_questions.map(toLegacySubQuestion),
    subQuestions: localQuestion.sub_questions.map(toLegacySubQuestion), // Alias
  };
}

/**
 * Backend SubQuestion → LegacyLocalSubQuestion (ProblemEditor用互換性)
 */
export function toLegacySubQuestion(localSubQuestion: LocalSubQuestion): LegacyLocalSubQuestion {
  return {
    id: localSubQuestion.id,
    question_id: localSubQuestion.question_id,
    sub_question_number: localSubQuestion.sub_question_number,
    subQuestionNumber: localSubQuestion.sub_question_number, // Alias
    question_type_id: localSubQuestion.sub_question_type_id,
    questionTypeId: localSubQuestion.sub_question_type_id, // Alias
    question_content: localSubQuestion.question_content,
    questionContent: localSubQuestion.question_content, // Alias
    question_format: localSubQuestion.question_format,
    questionFormat: localSubQuestion.question_format, // Alias
    answer_content: localSubQuestion.answer_explanation,
    answerContent: localSubQuestion.answer_explanation, // Alias
    answer_format: localSubQuestion.answer_format,
    answerFormat: localSubQuestion.answer_format, // Alias
    keywords: localSubQuestion.keywords,
    options: localSubQuestion.options,
    pairs: localSubQuestion.pairs,
    items: localSubQuestion.items,
    answers: localSubQuestion.answers,
  };
}

/**
 * LegacyLocalQuestion → LocalQuestion 統一形式に変換
 * ProblemEditor のデータを統一形式に変換
 */
export function fromLegacyQuestion(legacyQuestion: LegacyLocalQuestion): LocalQuestion {
  return {
    id: legacyQuestion.id,
    question_number: legacyQuestion.question_number,
    question_content: legacyQuestion.question_content,
    question_format: legacyQuestion.question_format,
    difficulty: legacyQuestion.difficulty,
    keywords: legacyQuestion.keywords,
    sub_questions: legacyQuestion.sub_questions.map(fromLegacySubQuestion),
  };
}

/**
 * LegacyLocalSubQuestion → LocalSubQuestion 統一形式に変換
 */
export function fromLegacySubQuestion(legacySubQuestion: LegacyLocalSubQuestion): LocalSubQuestion {
  return {
    id: legacySubQuestion.id,
    question_id: legacySubQuestion.question_id || '',
    sub_question_number: legacySubQuestion.sub_question_number,
    sub_question_type_id: legacySubQuestion.question_type_id,
    question_content: legacySubQuestion.question_content,
    question_format: legacySubQuestion.question_format,
    answer_explanation: legacySubQuestion.answer_content,
    answer_format: legacySubQuestion.answer_format,
    keywords: legacySubQuestion.keywords || [],
    options: legacySubQuestion.options,
    pairs: legacySubQuestion.pairs,
    items: legacySubQuestion.items,
    answers: legacySubQuestion.answers,
  };
}

/**
 * 統一形式データをProblemEditorが期待する形式に変換
 * （互換性のため両方のキー名を保持）
 */
export function toEditorFormat(data: any): any {
  const result = { ...data };
  
  // 大問の場合
  if (data.question_number !== undefined && !data.questionNumber) {
    result.questionNumber = data.question_number;
    result.questionContent = data.question_content;
    result.questionFormat = data.question_format;
  }
  
  // 小問の場合
  if (data.sub_question_number !== undefined && !data.subQuestionNumber) {
    result.subQuestionNumber = data.sub_question_number;
    result.questionTypeId = data.question_type_id || data.sub_question_type_id;
    result.questionContent = data.question_content;
    result.questionFormat = data.question_format;
    result.answerContent = data.answer_explanation || data.answer_content;
    result.answerFormat = data.answer_format;
  }
  
  return result;
}
