import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface SelectFilterFieldProps {
  label: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  defaultValue?: string;
  onChange: (value: string) => void;
}

/**
 * 難易度、更新日時、所要時間、学問系統、言語などのプルダウン選択フィールド
 */
export function SelectFilterField({
  label,
  options,
  value,
  defaultValue,
  onChange,
}: SelectFilterFieldProps) {
  const { t } = useTranslation();

  return (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <MenuItem value="">{t('common.all')}</MenuItem>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
