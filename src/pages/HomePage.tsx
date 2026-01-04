import {
  Container,
  Box,
} from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSearch } from '@/features/content/hooks/useContent';
import { AdvancedSearchPanel, SearchFilters } from '@/components/page/HomePage/AdvancedSearchPanel';
import { SortChipGroup } from '@/components/page/HomePage/SortChipGroup';
import { SearchResultsGrid } from '@/components/page/HomePage/SearchResultsGrid';

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Slug generation function
  const generateSlug = useCallback((examName: string) => {
    return examName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  }, []);

  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'recommended' | 'views'>(
    (searchParams.get('sort') as any) || 'recommended'
  );
  const [filters, setFilters] = useState<SearchFilters>(() => {
    const f: SearchFilters = {};
    for (const [key, value] of searchParams.entries()) {
      if (key !== 'q' && key !== 'sort' && key !== 'page') {
        f[key] = value;
      }
    }
    return f;
  });
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (keyword) params.set('q', keyword);
    if (sortBy !== 'recommended') params.set('sort', sortBy);
    if (page > 1) params.set('page', page.toString());
    Object.entries(filters).forEach(([key, value]) => {
      if (value && key !== 'keyword') params.set(key, value);
    });
    setSearchParams(params, { replace: true });
  }, [keyword, sortBy, page, filters, setSearchParams]);

  // Sync keyword with filters
  useEffect(() => {
    setFilters(prev => ({ ...prev, keyword }));
  }, [keyword]);

  // useSearch フックで検索を実行
  const { data, isLoading, error } = useSearch({
    keyword,
    page,
    sortBy,
    limit: 12,
    ...filters,
  });

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleCardClick = (problemId: string, examName: string) => {
    const slug = generateSlug(examName);
    navigate(`/exam/${problemId}/${slug}`);
  };

  const handleSortChange = (newSort: 'newest' | 'popular' | 'recommended' | 'views') => {
    setSortBy(newSort);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          {/* 詳細検索パネル */}
          <Box sx={{ mb: 3 }}>
            <AdvancedSearchPanel
              filters={filters}
              onFiltersChange={handleFiltersChange}
              isOpen={Object.keys(filters).length > 0}
            />
          </Box>

          {/* ソート選択 */}
          <SortChipGroup
            sortBy={sortBy}
            onSortChange={handleSortChange}
          />

          {/* 検索結果 */}
          <SearchResultsGrid
            data={data}
            isLoading={isLoading}
            error={error}
            page={page}
            onCardClick={handleCardClick}
            onPageChange={handlePageChange}
          />
        </Box>
      </Container>
    </Box>
  );
}
