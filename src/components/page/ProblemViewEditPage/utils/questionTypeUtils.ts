/**
 * questionTypeUtils.ts
 * 
 * 問題形式管理ユーティリティ
 * BlockMeta の metaOptions を生成するための関数を提供
 */

/**
 * 問題形式のローカル定義
 * 将来的には ProblemTypeRegistry から動的に取得することも可能
 */
export const questionTypeLabels: Record<number, string> = {
  1: '単一選択',
  2: '複数選択',
  3: '正誤判定',
  4: '組み合わせ',
  5: '順序並べ替え',
  10: '記述式',
  11: '証明問題',
  12: 'コード記述',
  13: '翻訳',
  14: '数値計算',
};

/**
 * 問題形式オプションを生成
 * @returns BlockMeta の metaOptions 形式（value, label）
 */
export const getQuestionTypeOptions = () =>
  Object.entries(questionTypeLabels).map(([id, label]) => ({
    value: Number(id),
    label,
  }));

/**
 * 問題形式ラベルを取得
 * @param typeId - 問題形式ID
 * @returns ラベル文字列
 */
export const getQuestionTypeLabel = (typeId: number): string => {
  return questionTypeLabels[typeId] || '不明';
};

/**
 * ProblemTypeRegistry からの取得関数（将来の拡張用）
 * 
 * 使用例：
 * ```tsx
 * // 将来的には以下のように動的に取得
 * import { getQuestionTypeOptionsFromRegistry } from './questionTypeUtils';
 * 
 * const metaOptions = await getQuestionTypeOptionsFromRegistry();
 * ```
 */
export async function getQuestionTypeOptionsFromRegistry() {
  // ProblemTypeRegistry が export する関数を使用
  // 現在は実装予定
  // import { getProblemTypeList } from '@/components/problemTypes/ProblemTypeRegistry';
  // const problemTypes = getProblemTypeList();
  // return problemTypes.map(type => ({ value: type.id, label: type.label }));
  
  // 現在は静的定義を返す
  return getQuestionTypeOptions();
}
