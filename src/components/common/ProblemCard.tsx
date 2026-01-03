import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Stack,
  Avatar,
  Box,
  Typography,
  Chip,
  IconButton,
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityIcon from '@mui/icons-material/Visibility';

export interface ProblemCardItem {
  id: string;
  title: string;
  authorName?: string;
  university?: string;
  examName?: string;
  subjectName?: string;
  difficulty?: string;
  content?: string;
  views?: number;
  likes?: number;
}

export interface ProblemCardProps {
  problem: ProblemCardItem;
  onCardClick?: (problemId: string, examName: string) => void;
  variant?: 'compact' | 'full';
}

/**
 * 問題カード（再利用可能なコンポーネント）
 * HomePage と MyPage で使用される共通UI
 * 
 * @param problem - 問題データ
 * @param onCardClick - カードをクリック時のコールバック
 * @param variant - 表示バリアント（compact: minWidth小, full: 通常）
 */
export const ProblemCard: React.FC<ProblemCardProps> = ({
  problem,
  onCardClick,
  variant = 'full',
}) => {
  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(problem.id, problem.examName || '');
    }
  };

  const isDifficultyAdvanced = problem.difficulty === 'advanced';
  const isDifficultyStandard = problem.difficulty === 'standard';

  return (
    <Card
      onClick={handleCardClick}
      sx={{
        minWidth: variant === 'compact' ? '280px' : 'auto',
        flexShrink: variant === 'compact' ? 0 : undefined,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: onCardClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onCardClick ? {
          transform: 'translateY(-4px)',
          boxShadow: 3,
        } : undefined,
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* 著者情報 */}
        <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
          <Avatar sx={{ width: 32, height: 32 }}>
            {problem.authorName?.charAt(0) || 'U'}
          </Avatar>
          <Box>
            <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
              {problem.authorName || 'Unknown'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {problem.university || 'University'}
            </Typography>
          </Box>
        </Stack>

        {/* タイトル（2行省略） */}
        <Typography
          variant="h6"
          sx={{
            mb: 1,
            fontWeight: 600,
            minHeight: '48px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {problem.title}
        </Typography>

        {/* 試験情報 */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {problem.examName && `試験: ${problem.examName}`}
        </Typography>

        {/* メタデータチップ */}
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
          {problem.subjectName && (
            <Chip label={problem.subjectName} size="small" variant="outlined" />
          )}
          {problem.difficulty && (
            <Chip
              label={problem.difficulty}
              size="small"
              color={
                isDifficultyAdvanced
                  ? 'error'
                  : isDifficultyStandard
                    ? 'warning'
                    : 'default'
              }
              variant="outlined"
            />
          )}
        </Stack>

        {/* 問題プレビュー（2行省略） */}
        <Typography
          variant="body2"
          sx={{
            mt: 2,
            color: 'text.secondary',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {problem.content?.substring(0, 120)}...
        </Typography>
      </CardContent>

      {/* 統計情報 */}
      <CardActions disableSpacing>
        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <VisibilityIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {problem.views || 0}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <FavoriteBorderIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {problem.likes || 0}
            </Typography>
          </Stack>
        </Stack>
        <IconButton size="small">
          <FavoriteBorderIcon fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default ProblemCard;
