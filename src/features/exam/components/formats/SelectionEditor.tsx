import React, { useEffect } from 'react';
import { useFieldArray, useFormContext, useWatch, Controller } from 'react-hook-form';
import {
  Box,
  TextField,
  Checkbox,
  Button,
  Typography,
  Stack,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { SQ1_SingleChoice } from '@/components/problemTypes/viewers/SQ1_SingleChoice';
import { SQ2_MultipleChoice } from '@/components/problemTypes/viewers/SQ2_MultipleChoice';
import type { ExamFormValues } from '../../schema';

interface SelectionEditorProps {
  basePath: string;
  questionTypeId: string; // '1' (single), '2' (multiple), '3' (true/false)
  isEditMode: boolean;
}

/**
 * SelectionEditor
 * ID 1: 単一選択
 * ID 2: 複数選択
 * ID 3: 正誤判定（Yes/No）
 * 
 * 既存の SQ1_SingleChoice, SQ2_MultipleChoice を活用
 * 編集・プレビュー両モードに対応
 */
export const SelectionEditor: React.FC<SelectionEditorProps> = ({
  basePath,
  questionTypeId,
  isEditMode,
}) => {
  const { control, watch } = useFormContext<ExamFormValues>();
  const options = useWatch({ control, name: `${basePath}.options` }) || [];

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${basePath}.options`,
  });

  // 正誤判定（ID 3）の場合、固定の Yes/No オプション
  const isTrueFalse = questionTypeId === '3';

  // 初期化時に ID3 の場合は Yes/No を自動生成
  useEffect(() => {
    if (isTrueFalse && fields.length === 0) {
      append({ id: `temp-true-${Date.now()}`, content: 'Yes', isCorrect: false });
      append({ id: `temp-false-${Date.now()}`, content: 'No', isCorrect: false });
    }
  }, [isTrueFalse, fields.length, append]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* 編集モード */}
      {isEditMode ? (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            選択肢を編集
          </Typography>

          <Stack spacing={1.5}>
            {fields.map((field, index) => (
              <Box
                key={field.id}
                sx={{
                  display: 'flex',
                  gap: 1,
                  p: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  alignItems: 'flex-start',
                  backgroundColor: 'action.hover',
                }}
              >
                {/* 正解チェック */}
                <Controller
                  name={`${basePath}.options.${index}.isCorrect`}
                  control={control}
                  defaultValue={false}
                  render={({ field: checkField }) => (
                    <Checkbox
                      {...checkField}
                      checked={checkField.value}
                      size="small"
                      title="正解"
                      sx={{ mt: 0.5 }}
                    />
                  )}
                />

                {/* 選択肢テキスト */}
                <Controller
                  name={`${basePath}.options.${index}.content`}
                  control={control}
                  defaultValue=""
                  render={({ field: textField, fieldState: { error } }) => (
                    <TextField
                      {...textField}
                      fullWidth
                      size="small"
                      placeholder="選択肢テキスト"
                      error={!!error}
                      helperText={error?.message}
                      multiline
                      minRows={1}
                      maxRows={2}
                    />
                  )}
                />

                {/* 削除ボタン */}
                {fields.length > (isTrueFalse ? 2 : 1) && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => remove(index)}
                    title="削除"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ))}
          </Stack>

          {/* 選択肢追加ボタン */}
          {!isTrueFalse && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() =>
                append({
                  id: `temp-opt-${Date.now()}`,
                  content: '',
                  isCorrect: false,
                })
              }
              sx={{ alignSelf: 'flex-start' }}
            >
              選択肢を追加
            </Button>
          )}
        </>
      ) : (
        /* プレビューモード */
        <Box sx={{ p: 1.5, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
            {questionTypeId === '2' ? '複数選択可:' : '単一選択:'}
          </Typography>
          {questionTypeId === '2' ? (
            <SQ2_MultipleChoice options={options} showAnswer={false} mode="preview" />
          ) : (
            <SQ1_SingleChoice options={options} showAnswer={false} mode="preview" />
          )}
        </Box>
      )}
    </Box>
  );
};

export default SelectionEditor;
