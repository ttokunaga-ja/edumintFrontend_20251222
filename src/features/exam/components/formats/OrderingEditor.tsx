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
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { SQ5_Ordering } from '@/components/problemTypes/viewers/SQ5_Ordering';
import type { ExamFormValues } from '../../schema';

interface OrderingEditorProps {
  basePath: string;
  isEditMode: boolean;
}

/**
 * OrderingEditor
 * ID 5: 順序並べ替え問題
 * 
 * 既存の SQ5_Ordering を活用
 * 編集・プレビュー両モードに対応
 */
export const OrderingEditor: React.FC<OrderingEditorProps> = ({
  basePath,
  isEditMode,
}) => {
  const { control, watch } = useFormContext<ExamFormValues>();
  const items = useWatch({ control, name: `${basePath}.items` }) || [];

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: `${basePath}.items`,
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* 編集モード */}
      {isEditMode ? (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            並び替えアイテムを編集
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
                  {/* 順序番号 */}
                  <Grid item xs={12} sm={2}>
                    <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                      順序
                    </Typography>
                    <Controller
                      name={`${basePath}.items.${index}.correctOrder`}
                      control={control}
                      defaultValue={index + 1}
                      render={({ field: orderField }) => (
                        <TextField
                          {...orderField}
                          fullWidth
                          size="small"
                          type="number"
                          inputProps={{ min: 1 }}
                        />
                      )}
                    />
                  </Grid>

                  {/* テキスト */}
                  <Grid item xs={12} sm={7}>
                    <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                      テキスト
                    </Typography>
                    <Controller
                      name={`${basePath}.items.${index}.text`}
                      control={control}
                      defaultValue=""
                      render={({ field: textField, fieldState: { error } }) => (
                        <TextField
                          {...textField}
                          fullWidth
                          size="small"
                          placeholder="順序項目"
                          error={!!error}
                          helperText={error?.message}
                          multiline
                          minRows={1}
                          maxRows={2}
                        />
                      )}
                    />
                  </Grid>

                  {/* アクション */}
                  <Grid item xs={12} sm={3}>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {index > 0 && (
                        <IconButton
                          size="small"
                          onClick={() => move(index, index - 1)}
                          title="上へ"
                        >
                          <ArrowUpwardIcon fontSize="small" />
                        </IconButton>
                      )}
                      {index < fields.length - 1 && (
                        <IconButton
                          size="small"
                          onClick={() => move(index, index + 1)}
                          title="下へ"
                        >
                          <ArrowDownwardIcon fontSize="small" />
                        </IconButton>
                      )}
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
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Stack>

          {/* アイテム追加ボタン */}
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() =>
              append({
                id: `temp-item-${Date.now()}`,
                text: '',
                correctOrder: fields.length + 1,
              })
            }
            sx={{ alignSelf: 'flex-start' }}
          >
            アイテムを追加
          </Button>
        </>
      ) : (
        /* プレビューモード */
        <Box sx={{ p: 1.5, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
            順序並べ替え:
          </Typography>
          <SQ5_Ordering items={items} showAnswer={false} mode="preview" />
        </Box>
      )}
    </Box>
  );
};

export default OrderingEditor;
