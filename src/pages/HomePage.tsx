import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
  Alert,
  Avatar,
  CardActions,
  IconButton,
} from '@mui/material';
import { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useSearch } from '@/features/content/hooks/useContent';
import { SearchSection } from '@/components/page/HomePage/SearchSection';
import { AdvancedSearchPanel, SearchFilters } from '@/components/page/HomePage/AdvancedSearchPanel';

export function HomePage() {
  const [keyword, setKeyword] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'recommended' | 'views'>('newest');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [page, setPage] = useState(1);
  
  // useSearch フックで検索を実行
  const { data, isLoading, error } = useSearch({
    keyword,
    page,
    sortBy,
    limit: 12,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <Box>
      {/* ヒーロー/検索セクション */}
      <SearchSection />

      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          {/* 検索フォーム */}
          <Box component="form" onSubmit={handleSearch} sx={{ mb: 4 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
              <TextField
                fullWidth
                placeholder="キーワードで検索 (例: 微分積分、線形代数)"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                disabled={isLoading}
              />
              <Button
                variant="contained"
                endIcon={<SearchIcon />}
                type="submit"
                disabled={isLoading}
                sx={{ minWidth: 120 }}
              >
                検索
              </Button>
            </Stack>

            {/* ソート選択 */}
            <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
              {(['recommended', 'newest', 'popular', 'views'] as const).map((sort) => (
                <Chip
                  key={sort}
                  label={
                    sort === 'newest'
                      ? '最新'
                      : sort === 'popular'
                        ? '人気'
                        : sort === 'views'
                          ? '閲覧数'
                          : 'おすすめ'
                  }
                  onClick={() => {
                    setSortBy(sort);
                    setPage(1);
                  }}
                  variant={sortBy === sort ? 'filled' : 'outlined'}
                  color={sortBy === sort ? 'primary' : 'default'}
                />
              ))}
            </Stack>

            {/* 詳細検索パネル */}
            <AdvancedSearchPanel
              filters={filters}
              onFiltersChange={handleFiltersChange}
              isOpen={Object.keys(filters).length > 0}
            />
          </Box>

          {/* エラー表示 */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              検索中にエラーが発生しました。もう一度お試しください。
            </Alert>
          )}

          {/* ローディング */}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* 検索結果 */}
          {data && !isLoading && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                検索結果: {data.total} 件
              </Typography>

              {data.data.length === 0 ? (
                <Alert severity="info">
                  検索結果が見つかりませんでした。別のキーワードで試してください。
                </Alert>
              ) : (
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  {data.data.map((problem) => (
                    <Grid item xs={12} sm={6} md={4} key={problem.id}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          cursor: 'pointer',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 3,
                          },
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

                          {/* タイトル */}
                          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                            {problem.title}
                          </Typography>

                          {/* 試験情報 */}
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {problem.examName && `試験: ${problem.examName}`}
                          </Typography>

                          {/* メタデータチップ */}
                          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                            {problem.subjectName && (
                              <Chip label={problem.subjectName} size="small" variant="outlined" />
                            )}
                            {problem.difficulty && (
                              <Chip
                                label={problem.difficulty}
                                size="small"
                                color={
                                  problem.difficulty === 'advanced'
                                    ? 'error'
                                    : problem.difficulty === 'standard'
                                      ? 'warning'
                                      : 'default'
                                }
                                variant="outlined"
                              />
                            )}
                          </Stack>

                          {/* 問題プレビュー */}
                          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                            {problem.content?.substring(0, 100)}...
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
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* ページネーション */}
              {data.total > 12 && (
                <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', mt: 4 }}>
                  <Button
                    disabled={page === 1 || isLoading}
                    onClick={() => setPage(page - 1)}
                  >
                    前へ
                  </Button>
                  <Typography sx={{ alignSelf: 'center', px: 2 }}>
                    ページ {page}
                  </Typography>
                  <Button
                    disabled={!data.hasMore || isLoading}
                    onClick={() => setPage(page + 1)}
                  >
                    次へ
                  </Button>
                </Stack>
              )}
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}

export default HomePage;
