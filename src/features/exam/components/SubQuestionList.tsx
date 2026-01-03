import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Box, Button, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import { SubQuestionItem } from './SubQuestionItem';
import { createDefaultSubQuestion } from '../schema';
import type { ExamFormValues } from '../schema';

/**
 * 小問リスト (ネストされた useFieldArray)
 * 
 * 大問に属する複数の小問を管理します。
 * ネストされた useFieldArray のパターンを示します。
 */
interface SubQuestionListProps {
  questionIndex: number;
  isEditMode: boolean;
}

export const SubQuestionList: React.FC<SubQuestionListProps> = ({
  questionIndex,
  isEditMode,
}) => {
  const { control } = useFormContext<ExamFormValues>();

  // 型安全なパス定義
  const basePath = `questions.${questionIndex}.subQuestions`;

  const { fields, append, remove } = useFieldArray({
    control,
    name: basePath as any,
  });

  const handleAddSubQuestion = () => {
    append(createDefaultSubQuestion(fields.length));
  };

  const handleDeleteSubQuestion = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <Box data-testid="subquestion-list">
      <Stack spacing={2} sx={{ pl: 2 }}>
        {fields.length === 0 ? (
          <Box
            sx={{
              p: 2,
              textAlign: 'center',
              bgcolor: 'action.hover',
              borderRadius: 1,
              color: 'text.secondary',
            }}
          >
            <Typography variant="caption">小問がまだ追加されていません。</Typography>
          </Box>
        ) : (
          fields.map((field, subQuestionIndex) => (
            <SubQuestionItem
              key={field.id}
              questionIndex={questionIndex}
              subQuestionIndex={subQuestionIndex}
              isEditMode={isEditMode}
              onDelete={() => handleDeleteSubQuestion(subQuestionIndex)}
              canDelete={fields.length > 1}
            />
          ))
        )}

        {isEditMode && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <Button
              size="small"
              variant="dashed"
              startIcon={<AddIcon />}
              onClick={handleAddSubQuestion}
              fullWidth
              sx={{ border: '1px dashed' }}
            >
              小問を追加
            </Button>
          </Box>
        )}
      </Stack>
    </Box>
  );
};
