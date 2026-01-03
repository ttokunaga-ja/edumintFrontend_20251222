/**
 * difficultyUtils.ts
 * 
 * 難易度管理ユーティリティ
 * BlockMeta の metaOptions と metaLabels を生成するための関数を提供
 */

/**
 * 難易度のラベルと色の定義
 */
export const difficultyLabels: Record<number, { label: string; color: string }> = {
  1: { label: '基礎', color: 'success' },
  2: { label: '応用', color: 'warning' },
  3: { label: '発展', color: 'error' },
};

/**
 * 難易度オプションを生成
 * @returns BlockMeta の metaOptions 形式（value, label）
 */
export const getDifficultyOptions = () =>
  Object.entries(difficultyLabels).map(([id, label]) => ({
    value: Number(id),
    label: label.label,
  }));

/**
 * 難易度ラベルを取得
 * @param difficultyId - 難易度ID
 * @returns { label: string; color: string }
 */
export const getDifficultyLabel = (difficultyId: number) => {
  return difficultyLabels[difficultyId] || { label: '未設定', color: 'default' };
};

/**
 * 難易度のテキストのみを取得
 * @param difficultyId - 難易度ID
 * @returns ラベル文字列
 */
export const getDifficultyText = (difficultyId: number): string => {
  return difficultyLabels[difficultyId]?.label || '未設定';
};
