import { Fragment } from 'react';
import type { FC, ReactNode, SyntheticEvent, FormEvent } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import ExamCardCompact, { ExamCompactItem } from '@/components/common/ExamCardCompact';

export interface HorizontalScrollSectionProps {
  title: string;
  items: ExamCompactItem[];
  isLoading?: boolean;
  onViewAll?: () => void;
  onView?: (id: string) => void;
  onGood?: (id: string) => void;
  emptyMessage?: string;
  viewAllLabel?: string;
}

/**
 * 横スクロール セクション（再利用可能なコンポーネント）
 * MyPage の「学習済」「高評価」「コメント」「投稿」などの
 * ExamCardCompact を表示する共通UI
 * 
 * @param title - セクションタイトル
 * @param items - 表示アイテムの配列（ExamCompactItem[]）
 * @param isLoading - ローディング状態
 * @param onViewAll - 「すべて表示」クリック時のコールバック
 * @param onView - カード クリック時のコールバック
 * @param onGood - いいね ボタン クリック時のコールバック
 * @param emptyMessage - 空状態のメッセージ
 */
export const HorizontalScrollSection: FC<HorizontalScrollSectionProps> = ({
  title,
  items,
  isLoading = false,
  onViewAll,
  onView,
  onGood,
  emptyMessage = 'データがありません',
  viewAllLabel = 'すべて表示',
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        {onViewAll && (
          <Typography
            variant="caption"
            sx={{
              color: 'primary.main',
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
            onClick={onViewAll}
          >
            {viewAllLabel}
          </Typography>
        )}
      </Box>

      {/* ローディング状態 */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : items.length > 0 ? (
        /* 横スクロールコンテナ */
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            overflowY: 'hidden',
            pb: 1,
            alignItems: 'stretch',
            '&::-webkit-scrollbar': {
              height: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#ccc',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#999',
            },
          }}
        >
          {items.map((item, index) => (
            <Box key={item.id || index} sx={{ flexShrink: 0, minWidth: 320 }}>
              <ExamCardCompact
                item={item}
                onView={onView}
                onGood={onGood}
              />
            </Box>
          ))}
        </Box>
      ) : (
        /* 空状態 */
        <Card sx={{ py: 10 }}>
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
              データがありません
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {emptyMessage}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default HorizontalScrollSection;
