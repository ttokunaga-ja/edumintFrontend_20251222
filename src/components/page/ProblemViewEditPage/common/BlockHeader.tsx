import React from 'react';
import { Box, Typography, Stack } from '@mui/material';

export interface BlockHeaderProps {
  level: 'major' | 'minor'; // 大門 or 小門
  number: number; // 問題番号
}

/**
 * BlockHeader
 * 
 * 統合ヘッダーコンポーネント（大問・小問共通）
 * 図形内に問題番号を表示（ラベルテキストは表示しない）
 * 
 * level プロップで形を切り替え：
 * - 'major': 四角形（大門用）
 * - 'minor': 円形（小門用）
 * 
 * 注意: 削除ボタンはBlockMetaで統一的に制御されます
 */
export const BlockHeader: React.FC<BlockHeaderProps> = ({
  level,
  number,
}) => {
  const isCircle = level === 'minor';
  const bgColor = level === 'major' ? 'primary.main' : 'secondary.main';

  return (
    <Box
      sx={{
        width: isCircle ? 28 : 32,
        height: isCircle ? 28 : 32,
        borderRadius: isCircle ? '50%' : '4px',
        bgcolor: bgColor,
        color: `${bgColor === 'primary.main' ? 'primary' : 'secondary'}.contrastText`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: isCircle ? '0.875rem' : '1rem',
      }}
    >
      {number}
    </Box>
  );
};

export default BlockHeader;
