import React from 'react';
import { Box, FormControl, FormHelperText, Typography } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { ExamEditor } from '@/components/ui/exam/ExamEditor';
import { ExamViewer } from '@/components/ui/exam/ExamViewer';

/**
 * ExamContentField
 * 
 * React Hook Formの統合を提供するアダプターコンポーネント
 * isEditModeに応じて：
 * - true: ExamEditor（入力 + プレビュー）
 * - false: ExamViewer（表示のみ、軽量）
 * 
 * 使用例:
 * <ExamContentField 
 *   name="problemText" 
 *   label="問題文"
 *   isEditMode={true}
 *   placeholder="Markdownで記述してください"
 * />
 */
interface ExamContentFieldProps {
  name: string;
  label?: string;
  isEditMode: boolean;
  placeholder?: string;
  required?: boolean;
  minEditorHeight?: number;
  initialEditorHeight?: number;
}

export const ExamContentField: React.FC<ExamContentFieldProps> = ({
  name,
  label,
  isEditMode,
  placeholder,
  required = false,
  minEditorHeight = 150,
  initialEditorHeight = 150,
}) => {
  const { control, formState: { errors } } = useFormContext();
  const fieldError = errors[name];

  return (
    <Controller
      name={name}
      control={control}
      rules={{
        required: required ? `${label || name}は必須です` : false,
      }}
      render={({ field, fieldState: { error: fieldError } }) => {
        const error = !!fieldError;
        const helperText = fieldError?.message;

        return (
          <FormControl fullWidth error={error} variant="standard">
            {label && (
              <Typography
                variant="subtitle2"
                component="label"
                htmlFor={name}
                sx={{
                  fontWeight: 600,
                  mb: 1,
                  display: 'block',
                  color: error ? 'error.main' : 'text.primary',
                }}
              >
                {label}
                {required && (
                  <span style={{ color: 'red', marginLeft: 4 }}>*</span>
                )}
              </Typography>
            )}

            <Box>
              {isEditMode ? (
                <ExamEditor
                  id={name}
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder={placeholder}
                  minEditorHeight={minEditorHeight}
                  initialEditorHeight={initialEditorHeight}
                  error={error}
                  helperText={helperText}
                />
              ) : (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <ExamViewer content={field.value || ''} />
                </Box>
              )}
            </Box>

            {error && !isEditMode && (
              <FormHelperText error>
                {helperText}
              </FormHelperText>
            )}
          </FormControl>
        );
      }}
    />
  );
};

export default ExamContentField;
