import { FC } from 'react';
import { Stack, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SORT_ORDER_ENUM_OPTIONS } from '@/lib/enums/enumHelpers';

export interface SortChipGroupProps {
  sortBy: number;
  onSortChange: (sort: number) => void;
  disabled?: boolean;
}

/**
 * ソート選択チップグループ
 * HomePage の検索結果ソート選択UI
 */
export const SortChipGroup: FC<SortChipGroupProps> = ({
  sortBy,
  onSortChange,
  disabled = false,
}) => {
  const { t } = useTranslation();

  return (
    <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
      {SORT_ORDER_ENUM_OPTIONS.map((option) => (
        <Chip
          key={option.value}
          label={t(option.labelKey)}
          onClick={() => !disabled && onSortChange(option.value)}
          disabled={disabled}
          variant={sortBy === option.value ? 'filled' : 'outlined'}
          color={sortBy === option.value ? 'primary' : 'default'}
          color={sortBy === option.value ? 'primary' : 'default'}
          disabled={disabled}
        />
      ))}
    </Stack>
  );
};

export default SortChipGroup;
