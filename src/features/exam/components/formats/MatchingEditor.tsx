import React from 'react';
import { useFieldArray, useFormContext, useWatch, Controller } from 'react-hook-form';
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  IconButton,
  Grid,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { SQ4_Matching } from '@/components/problemTypes/viewers/SQ4_Matching';
import type { ExamFormValues } from '../../schema';

interface MatchingEditorProps {
  basePath: string;
  isEditMode: boolean;
}

/**
 * MatchingEditor
 * ID 4: 組み合わせ問題（マッチング）
 * 
 * 既存の SQ4_Matching を活用
 * 編集・プレビュー両モードに対応
 */
export const MatchingEditor: React.FC<MatchingEditorProps> = ({
  basePath,
  isEditMode,
}) => {
  const { control, watch } = useFormContext<ExamFormValues>();
  const pairs = useWatch({ control, name: `${basePath}.pairs` }) || [];

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${basePath}.pairs`,
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* 編集モード */}
      {isEditMode ? (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            マッチングペアを編集
          </Typography>

          <Stack spacing={1.5}>
            {fields.map((field, index) => (
              <Paper
                key={field.id}
                elevation={0}
                sx={{
                  p: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  backgroundColor: '#fafafa',
                }}
              >
                <Grid container spacing={1} alignItems="flex-start">
                  {/* 左側（問） */}
                  <Grid item xs={12} sm={5}>
                    <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                      問
                    </Typography>
                    <Controller
                      name={`${basePath}.pairs.${index}.question`}
                      control={control}
                      defaultValue=""
                      render={({ field: questionField, fieldState: { error } }) => (
                        <TextField
                          {...questionField}
                          fullWidth
                          size="small"
                          placeholder="左側（問）"
                          error={!!error}
                          helperText={error?.message}
                          multiline
                          minRows={1}
                          maxRows={2}
                        />
                      )}
                    />
                  </Grid>

                  {/* 接続部 */}
                  <Grid item xs={12} sm={2} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', pt: 2 }}>
                    <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                      ↔
                    </Typography>
                  </Grid>

                  {/* 右側（答） */}
                  <Grid item xs={12} sm={5}>
                    <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                      答
                    </Typography>
                    <Controller
                      name={`${basePath}.pairs.${index}.answer`}
                      control={control}
                      defaultValue=""
                      render={({ field: answerField, fieldState: { error } }) => (
                        <TextField
                          {...answerField}
                          fullWidth
                          size="small"
                          placeholder="右側（答）"
                          error={!!error}
                          helperText={error?.message}
                          multiline
                          minRows={1}
                          maxRows={2}
                        />
                      )}
                    />
                  </Grid>

                  {/* 削除ボタン */}
                  <Grid item xs={12}>
                    {fields.length > 1 && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => remove(index)}
                        title="削除"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Stack>

          {/* ペア追加ボタン */}
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() =>
              append({
                id: `temp-pair-${Date.now()}`,
                question: '',
                answer: '',
              })
            }
            sx={{ alignSelf: 'flex-start' }}
          >
            ペアを追加
          </Button>
        </>
      ) : (
        /* プレビューモード */
        <Box sx={{ p: 1.5, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
            マッチング問題:
          </Typography>
          <SQ4_Matching pairs={pairs} showAnswer={false} mode="preview" />
        </Box>
      )}
    </Box>
  );
};

export default MatchingEditor;
