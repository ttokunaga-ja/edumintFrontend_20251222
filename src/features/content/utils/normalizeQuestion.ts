/**
 * Question normalization utilities
 *
 * 大問のデータ正規化関数
 */

import { Question, Keyword } from '../types';

/**
 * テキストの正規化（共通処理）
 *
 * @param text - 正規化対象テキスト
 * @returns 正規化済みテキスト
 */
function normalizeText(text: string): string {
  return (
    text
      // 前後の空白を削除
      .trim()
      // 複数連続した改行を2行に統一
      .replace(/\n\n+/g, '\n\n')
      // Windows行末をUnix行末に統一
      .replace(/\r\n/g, '\n')
      // 末尾の空白を削除
      .replace(/[ \t]+$/gm, '')
      // 複数スペースを1スペースに（LaTeX数式部分を除外）
      .replace(/([^\$])\s{2,}([^\$])/g, '$1 $2')
  );
}

/**
 * 簡易LaTeX検出
 * - $...$ または $$...$$ を含む場合に true を返す
 */
function containsLatex(text: string): boolean {
  if (!text) return false;
  return /\$\$?[\s\S]*?\$\$?/.test(text);
}

/**
 * LaTeX形式テキストの正規化
 *
 * @param text - LaTeXテキスト
 * @returns 正規化済みLaTeXテキスト
 */
function normalizeLatex(text: string): string {
  let result = normalizeText(text);

  // $ の前後のスペースを整理
  result = result.replace(/\$\s+/g, '$');
  result = result.replace(/\s+\$/g, '$');

  // インライン数式周辺のスペースを調整
  result = result.replace(/\s(\$[^$\n]+\$)\s/g, ' $1 ');

  // 連続した$の整理
  result = result.replace(/(\$\$)\s+/g, '$1');
  result = result.replace(/\s+(\$\$)/g, '$1');

  return result;
}

/**
 * Markdown形式テキストの正規化
 *
 * @param text - Markdownテキスト
 * @returns 正規化済みMarkdownテキスト
 */
function normalizeMarkdown(text: string): string {
  let result = normalizeText(text);

  // `で囲まれたコード部分の空白を調整
  result = result.replace(/`\s+/g, '`');
  result = result.replace(/\s+`/g, '`');

  // Markdownのリスト記号後の空白を統一
  result = result.replace(/^(\s*)([-*+])\s+/gm, '$1$2 ');

  // Markdownの見出しの正規化
  result = result.replace(/^(#+)\s+/gm, '$1 ');

  return result;
}

/**
 * キーワードの正規化
 *
 * @param keyword - キーワードテキスト
 * @returns 正規化済みキーワード
 */
function normalizeKeyword(keyword: string): string {
  return (
    keyword
      .trim()
      // 複数スペースを1スペースに
      .replace(/\s+/g, ' ')
      // 全角スペースを半角スペースに
      .replace(/　+/g, ' ')
  );
}

/**
 * 大問データの正規化
 *
 * @param question - 正規化対象の大問
 * @returns 正規化済み大問
 */
export function normalizeQuestion(question: Question): Question {
  return {
    ...question,
    content: containsLatex(question.content) ? normalizeLatex(question.content) : normalizeMarkdown(question.content),
    keywords: question.keywords.map((kw) => ({
      ...kw,
      keyword: normalizeKeyword(kw.keyword),
    })),
    subQuestions: question.subQuestions.map((sq) => ({
      ...sq,
      content: containsLatex(sq.content) ? normalizeLatex(sq.content) : normalizeMarkdown(sq.content),
    })),
  };
}

/**
 * 大問フォームデータの正規化
 *
 * @param content - 問題文
 * @returns 正規化済みコンテンツ
 */
export function normalizeQuestionContent(content: string): string {
  return containsLatex(content) ? normalizeLatex(content) : normalizeMarkdown(content);
}

/**
 * キーワード配列の正規化と重複排除
 *
 * @param keywords - キーワード配列
 * @param removeDuplicates - 重複排除するか（デフォルト: true）
 * @returns 正規化済みキーワード配列
 */
export function normalizeKeywords(
  keywords: Keyword[],
  removeDuplicates: boolean = true
): Keyword[] {
  const normalized = keywords.map((kw) => ({
    ...kw,
    keyword: normalizeKeyword(kw.keyword),
  }));

  if (!removeDuplicates) {
    return normalized;
  }

  // 大文字小文字を区別せずに重複排除
  const seen = new Set<string>();
  return normalized.filter((kw) => {
    const lower = kw.keyword.toLowerCase();
    if (seen.has(lower)) {
      return false;
    }
    seen.add(lower);
    return true;
  });
}

/**
 * 大問の完全な正規化（バリデーション後の処理用）
 *
 * @param question - 正規化対象の大問
 * @param options - オプション
 * @returns 正規化済み大問
 */
export function normalizeQuestionComprehensive(
  question: Question,
  options: {
    removeDuplicateKeywords?: boolean;
    trimSubQuestions?: boolean;
  } = {}
): Question {
  const {
    removeDuplicateKeywords = true,
    trimSubQuestions = false,
  } = options;

  const normalized = normalizeQuestion(question);

  // キーワード重複排除
  normalized.keywords = normalizeKeywords(
    normalized.keywords,
    removeDuplicateKeywords
  );

  // 空の小問を削除（オプション）
  if (trimSubQuestions) {
    normalized.subQuestions = normalized.subQuestions.filter(
      (sq) => sq.content && sq.content.trim().length > 0
    );
  }

  return normalized;
}

/**
 * 大問の差分抽出
 *
 * @param original - オリジナルデータ
 * @param updated - 更新後データ
 * @returns 変更があったフィールド名の配列
 */
export function getQuestionDifferences(
  original: Question,
  updated: Question
): string[] {
  const differences: string[] = [];

  if (original.content !== updated.content) differences.push('content');
  if (original.difficulty?.id !== updated.difficulty?.id)
    differences.push('difficulty');
  if (JSON.stringify(original.keywords) !== JSON.stringify(updated.keywords))
    differences.push('keywords');
  if (original.subQuestions.length !== updated.subQuestions.length)
    differences.push('subQuestions');

  return differences;
}
