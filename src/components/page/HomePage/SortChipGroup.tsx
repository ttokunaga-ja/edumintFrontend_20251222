import { Fragment } from 'react';
import type { FC, ReactNode, SyntheticEvent, FormEvent } from 'react';
import { Stack, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface SortChipGroupProps {
  sortBy: 'newest' | 'popular' | 'recommended' | 'views';
  onSortChange: (sort: 'newest' | 'popular' | 'recommended' | 'views') => void;
}

/**
 * ソート選択チップグループ
 * HomePage の検索結果ソート選択UI
 */
export const SortChipGroup: FC<SortChipGroupProps> = ({
  sortBy,
  onSortChange,
}) => {
  const { t } = useTranslation();

  const sortOptions = [
    { value: 'recommended' as const, label: t('search.recommended') },
    { value: 'newest' as const, label: t('search.latest') },
    { value: 'popular' as const, label: t('search.popular') },
    { value: 'views' as const, label: t('search.most_viewed') },
  ];

  return (
    <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
      {sortOptions.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          onClick={() => onSortChange(option.value)}
          variant={sortBy === option.value ? 'filled' : 'outlined'}
          color={sortBy === option.value ? 'primary' : 'default'}
        />
      ))}
    </Stack>
  );
};

export default SortChipGroup;
