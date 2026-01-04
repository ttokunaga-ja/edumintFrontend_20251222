/**
 * Question validation utilities
 *
 * 大問のバリデーション関数
 */

import { Question, QuestionValidation } from '../types';

/**
 * バリデーション結果オブジェクト
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

/**
 * 大問のバリデーション
 *
 * @param question - バリデーション対象の大問
 * @returns バリデーション結果
 */
export function validateQuestion(question: Question): ValidationResult {
  const errors: Record<string, string[]> = {};

  // contentの検証
  if (!question.content || question.content.trim().length === 0) {
    errors.content = ['問題文は必須です'];
  } else if (question.content.length > 10000) {
    errors.content = ['問題文は10000文字以下である必要があります'];
  }

  // formatの検証
  // format の値は将来的に自動解析されるため、厳密な値チェックは行いません

  // difficultyの検証
  if (question.difficulty) {
    if (!Number.isInteger(question.difficulty.level) || question.difficulty.level < 1 || question.difficulty.level > 5) {
      errors.difficulty = ['難易度は1～5の整数である必要があります'];
    }
  }

  // keywordsの検証
  if (question.keywords && Array.isArray(question.keywords)) {
    const keywordErrors: string[] = [];
    question.keywords.forEach((kw, index) => {
      if (!kw.keyword || kw.keyword.trim().length === 0) {
        keywordErrors.push(`キーワード${index + 1}は空にできません`);
      } else if (kw.keyword.length > 100) {
        keywordErrors.push(`キーワード${index + 1}は100文字以下である必要があります`);
      }
    });
    if (keywordErrors.length > 0) {
      errors.keywords = keywordErrors;
    }
  }

  // subQuestionsの検証
  if (!question.subQuestions || question.subQuestions.length === 0) {
    errors.subQuestions = ['最低1つ以上の小問が必要です'];
  } else if (question.subQuestions.length > 100) {
    errors.subQuestions = ['小問は100個以下である必要があります'];
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * 大問のフォームデータバリデーション
 *
 * @param content - 問題文
 * @returns バリデーション結果
 */
export function validateQuestionForm(
  content: string
): ValidationResult {
  const errors: Record<string, string[]> = {};

  if (!content || content.trim().length === 0) {
    errors.content = ['問題文は必須です'];
  } else if (content.length > 10000) {
    errors.content = ['問題文は10000文字以下である必要があります'];
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * LaTeX構文の検証（数式部分）
 *
 * @param text - 検証対象テキスト
 * @returns LaTeX構文が有効な場合true
 */
export function validateLatexSyntax(text: string): boolean {
  // 基本的なLaTeX検証：$で囲まれた部分をチェック
  const dollarMatches = text.match(/\$\$?/g);
  if (!dollarMatches) return true; // LaTeX記号がない場合はOK

  // $の数が偶数か確認
  const singleDollar = text.match(/(?<!\$)\$(?!\$)/g);
  const doubleDollar = text.match(/\$\$/g);

  const singleCount = singleDollar ? singleDollar.length : 0;
  const doubleCount = doubleDollar ? doubleDollar.length : 0;

  // インライン数式と表示数式が正しくペアになっているか
  return singleCount % 2 === 0 && doubleCount % 2 === 0;
}

/**
 * キーワードの重複チェック
 *
 * @param keywords - キーワード配列
 * @returns 重複がない場合true
 */
export function validateKeywordsDuplicate(keywords: string[]): boolean {
  const uniqueKeywords = new Set(keywords.map((kw) => kw.toLowerCase().trim()));
  return uniqueKeywords.size === keywords.length;
}

/**
 * 大問の複合バリデーション（型安全版）
 *
 * @param question - 検証対象の大問
 * @param checkLatex - LaTeX検証を実施するか（デフォルト: true）
 * @returns 拡張バリデーション結果
 */
export function validateQuestionComprehensive(
  question: Question,
  checkLatex: boolean = true
): ValidationResult & { warnings: string[] } {
  const baseResult = validateQuestion(question);
  const warnings: string[] = [];

  // LaTeX構文の検証は、本文上の数式表記の有無にかかわらず実施する
  if (checkLatex && !validateLatexSyntax(question.content)) {
    warnings.push('LaTeX数式の構文に問題がある可能性があります');
  }

  // キーワード重複チェック
  if (question.keywords && question.keywords.length > 1) {
    const keywordTexts = question.keywords.map((kw) => kw.keyword);
    if (!validateKeywordsDuplicate(keywordTexts)) {
      warnings.push('キーワードに重複があります');
    }
  }

  return {
    ...baseResult,
    warnings,
  };
}
