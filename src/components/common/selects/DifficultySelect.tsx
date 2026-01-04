import { Fragment } from 'react';
import type { FC, ReactNode, SyntheticEvent, FormEvent } from 'react';
import { FormControl, InputLabel, Select, SelectProps, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface DifficultySelectProps extends Omit<SelectProps, 'children'> {
  /** オプションのラベル（デフォルト: 標準） */
  labels?: {
    [key: number]: string;
  };
}

const defaultLabels = {
  1: '基礎',
  2: '応用',
  3: '発展',
};

/**
 * 難易度プルダウンコンポーネント
 * 
 * QuestionBlock/SubQuestionBlock で使用される共通コンポーネント
 * 難易度を選択（基礎、応用、発展）
 * 
 * 注：value が undefined の場合は自動的に 1 (基礎) にデフォルト設定される
 */
export const DifficultySelect = React.forwardRef<HTMLInputElement, DifficultySelectProps>(
  ({ labels, label, size = 'small', fullWidth = true, id, name, ...props }, ref) => {
    const generatedId = React.useId();
    const actualId = id || `difficulty-select-${generatedId}`;
    const labelId = `${actualId}-label`;
    const { t } = useTranslation();

    const resolvedLabels = labels ?? {
      1: t('enum.difficulty.basic'),
      2: t('enum.difficulty.standard'),
      3: t('enum.difficulty.advanced'),
    };

    const resolvedLabel = label ?? t('filters.level');

    // value が undefined の場合は 1 (基礎) にデフォルト設定
    const actualValue = props.value ?? 1;

    return (
      <FormControl size={size} sx={{ minWidth: '140px' }}>
        <InputLabel id={labelId}>{resolvedLabel}</InputLabel>
        <Select
          ref={ref}
          labelId={labelId}
          id={actualId}
          name={name || actualId}
          label={resolvedLabel}
          size={size}
          {...props}
          value={actualValue}
        >
          {Object.entries(resolvedLabels).map(([value, labelText]) => (
            <MenuItem key={value} value={Number(value)}>
              {labelText}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }
);

DifficultySelect.displayName = 'DifficultySelect';

export default DifficultySelect;
