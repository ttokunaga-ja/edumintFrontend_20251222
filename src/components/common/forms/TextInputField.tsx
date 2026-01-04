import { Fragment } from 'react';
import type { FC, ReactNode, SyntheticEvent, FormEvent } from 'react';
import { TextField, TextFieldProps } from '@mui/material';

/**
 * テキスト入力フィールドコンポーネント
 * 
 * 統一されたテキスト入力フォーム
 * ProblemType の各フォーム内で使用される共通コンポーネント
 */
export const TextInputField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ variant = 'outlined', size = 'small', fullWidth = true, ...props }, ref) => {
    return (
      <TextField
        ref={ref}
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        {...props}
      />
    );
  }
);

TextInputField.displayName = 'TextInputField';

export default TextInputField;
