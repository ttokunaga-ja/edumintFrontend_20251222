import { Fragment } from 'react';
import type { FC, ReactNode, SyntheticEvent, FormEvent } from 'react';
import { Box, Typography } from '@mui/material';

export interface ComingSoonProps {
  /** タイトルテキスト */
  title?: string;
  /** 説明テキスト */
  description?: string;
  /** ボックスの最小高さ（デフォルト: 200px） */
  minHeight?: string | number;
}

/**
 * Coming Soon プレースホルダーコンポーネント
 * 
 * 開発中の機能を表示する統一されたコンポーネント
 * 複数のセクション（学習済、高評価、コメント、ステータス、ウォレット等）で使用
 * 
 * @param title - 機能名（例: "学習済み"）
 * @param description - 説明テキスト（デフォルト: "機能は開発中です"）
 * @param minHeight - ボックスの高さ
 */
export const ComingSoon: FC<ComingSoonProps> = ({
  title = 'Coming Soon',
  description = '機能は開発中です',
  minHeight = '200px',
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        padding: 2,
      }}
    >
      <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
        Coming Soon...
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {title}
        {description}
      </Typography>
    </Box>
  );
};

export default ComingSoon;
