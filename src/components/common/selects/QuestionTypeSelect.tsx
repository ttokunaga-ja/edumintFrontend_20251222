import { Fragment } from 'react';
import type { FC, ReactNode, SyntheticEvent, FormEvent } from 'react';
import { FormControl, InputLabel, Select, SelectProps, MenuItem } from '@mui/material';

export interface QuestionTypeSelectProps extends Omit<SelectProps, 'children'> {
  /** オプション */
  options?: Array<{ value: number; label: string }>;
}

const defaultOptions = [
  { value: 1, label: '単一選択' },
  { value: 2, label: '複数選択' },
  { value: 3, label: '正誤判定' },
  { value: 4, label: '組み合わせ' },
  { value: 5, label: '順序並べ替え' },
  { value: 10, label: '記述式' },
  { value: 11, label: '証明問題' },
  { value: 12, label: 'コード記述' },
  { value: 13, label: '翻訳' },
  { value: 14, label: '数値計算' },
];

/**
 * 問題形式プルダウンコンポーネント
 * 
 * SubQuestionBlock で使用される共通コンポーネント
 * 問題形式を選択（単一選択、複数選択、正誤判定など）
 */
export const QuestionTypeSelect = React.forwardRef<HTMLInputElement, QuestionTypeSelectProps>(
  ({ options = defaultOptions, label = '問題形式', size = 'small', fullWidth = true, id, name, ...props }, ref) => {
    const generatedId = React.useId();
    const actualId = id || `question-type-select-${generatedId}`;
    const labelId = `${actualId}-label`;

    return (
      <FormControl fullWidth={fullWidth} size={size}>
        <InputLabel id={labelId}>{label}</InputLabel>
        <Select
          ref={ref}
          labelId={labelId}
          id={actualId}
          name={name || actualId}
          label={label}
          size={size}
          {...props}
        >
          {options.map(({ value, label: labelText }) => (
            <MenuItem key={value} value={value}>
              {labelText}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }
);

QuestionTypeSelect.displayName = 'QuestionTypeSelect';

export default QuestionTypeSelect;
