import { Fragment } from 'react';
import type { FC, ReactNode, SyntheticEvent, FormEvent } from 'react';
import {
  Box,
  CircularProgress,
  Alert,
  Grid,
  Stack,
  Button,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ProblemCard, ProblemCardItem } from '@/components/common/ProblemCard';
import ExamCardCompact, { ExamCompactItem, mapProblemToCompactItem } from '@/components/common/ExamCardCompact';

export interface SearchResultsGridProps {
  data?: {
    data: ProblemCardItem[];
    total: number;
    hasMore: boolean;
  };
  isLoading: boolean;
  error?: Error | null;
  page: number;
  onCardClick: (problemId: string, examName: string) => void;
  onPageChange: (page: number) => void;
}

/**
 * 検索結果グリッド表示
 * HomePage の検索結果表示UI
 * Loading, Error, Empty, Data の各状態に対応
 */
export const SearchResultsGrid: FC<SearchResultsGridProps> = ({
  data,
  isLoading,
  error,
  page,
  onCardClick,
  onPageChange,
}) => {
  const { t } = useTranslation();

  // エラー状態
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {t('search.search_error')}
      </Alert>
    );
  }

  // ローディング状態
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // データ表示
  if (data) {
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('search.search_results', { count: data.total })}
        </Typography>

        {data.data.length === 0 ? (
          // 空状態
          <Alert severity="info">
            {t('search.no_search_results')}
          </Alert>
        ) : (
          <>
            {/* グリッド */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {data.data.map((problem) => (
                <Grid item xs={12} sm={6} md={4} key={problem.id}>
                  <ExamCardCompact
                    item={mapProblemToCompactItem(problem)}
                    onView={(id) => onCardClick(id, problem.title || problem.examName || '')}
                    onGood={() => {/* noop for now */ }}
                  />
                </Grid>
              ))}
            </Grid>

            {/* ページネーション */}
            {data.total > 12 && (
              <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', mt: 4 }}>
                <Button
                  disabled={page === 1 || isLoading}
                  onClick={() => onPageChange(page - 1)}
                >
                  前へ
                </Button>
                <Typography sx={{ alignSelf: 'center', px: 2 }}>
                  ページ {page}
                </Typography>
                <Button
                  disabled={!data.hasMore || isLoading}
                  onClick={() => onPageChange(page + 1)}
                >
                  次へ
                </Button>
              </Stack>
            )}
          </>
        )}
      </Box>
    );
  }

  return null;
};

export default SearchResultsGrid;
