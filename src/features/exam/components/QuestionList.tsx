import { Fragment } from 'react';
import type { FC, ReactNode, SyntheticEvent, FormEvent } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Box, Button, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import { QuestionItem } from './QuestionItem';
import { createDefaultQuestion } from '../schema';
import type { ExamFormValues } from '../schema';

/**
 * 大問リスト (useFieldArray)
 * 
 * 複数の大問を管理し、追加・削除・並び替え機能を提供します。
 */
interface QuestionListProps {
  isEditMode: boolean;
}

export const QuestionList: FC<QuestionListProps> = ({ isEditMode }) => {
  const { control } = useFormContext<ExamFormValues>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'questions',
  });

  const handleAddQuestion = () => {
    append(createDefaultQuestion(fields.length));
  };

  const handleDeleteQuestion = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      move(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < fields.length - 1) {
      move(index, index + 1);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Stack spacing={3}>
        {fields.length === 0 ? (
          <Box
            sx={{
              p: 3,
              textAlign: 'center',
              bgcolor: 'action.hover',
              borderRadius: 1,
              color: 'text.secondary',
            }}
          >
            <Typography>大問がまだ追加されていません。</Typography>
          </Box>
        ) : (
          fields.map((field, questionIndex) => (
            <QuestionItem
              key={field.id}
              questionIndex={questionIndex}
              isEditMode={isEditMode}
              onDelete={() => handleDeleteQuestion(questionIndex)}
              canDelete={fields.length > 1}
              onMoveUp={() => handleMoveUp(questionIndex)}
              canMoveUp={questionIndex > 0}
              onMoveDown={() => handleMoveDown(questionIndex)}
              canMoveDown={questionIndex < fields.length - 1}
            />
          ))
        )}

        {isEditMode && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddQuestion}
            >
              大問を追加
            </Button>
          </Box>
        )}
      </Stack>
    </Box>
  );
};
