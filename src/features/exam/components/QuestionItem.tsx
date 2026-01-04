import { Fragment } from 'react';
import type { FC, ReactNode, SyntheticEvent, FormEvent } from 'react';
import { useFormContext, Controller, useFieldArray } from 'react-hook-form';
import {
  Paper,
  Box,
  TextField,
  Stack,
  Divider,
  Typography,
  IconButton,
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { ExamQuestionMeta } from './ExamQuestionMeta';

import { SubQuestionList } from './SubQuestionList';
import { ExamContentField } from './inputs/ExamContentField';
import { DifficultyLabels } from '../schema';
import type { ExamFormValues } from '../schema';

interface QuestionItemProps {
  questionIndex: number;
  isEditMode: boolean;
  onDelete?: () => void;
  canDelete: boolean;
  onMoveUp?: () => void;
  canMoveUp: boolean;
  onMoveDown?: () => void;
  canMoveDown: boolean;
}

const difficultyOptions = Object.entries(DifficultyLabels).map(([value, label]) => ({
  value: Number(value),
  label,
}));

export const QuestionItem: FC<QuestionItemProps> = ({
  questionIndex,
  isEditMode,
  onDelete,
  canDelete,
  onMoveUp,
  canMoveUp,
  onMoveDown,
  canMoveDown,
}) => {
  const { control, watch } = useFormContext<ExamFormValues>();
  const basePath = `questions.${questionIndex}`;

  const difficulty = watch(`${basePath}.difficulty`);

  // キーワード管理
  const { fields: keywordFields, append, remove } = useFieldArray({
    control,
    name: `${basePath}.keywords` as any,
  });

  // キーワード変形
  const formattedKeywords = keywordFields.map((field: any) => ({
    id: field.id,
    keyword: field.keyword,
  }));

  const handleKeywordAdd = (keyword: string) => {
    append({ keyword });
  };

  const handleKeywordRemove = (id: string) => {
    const index = keywordFields.findIndex((f) => f.id === id);
    if (index !== -1) {
      remove(index);
    }
  };

  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        borderLeft: '4px solid',
        borderColor: 'primary.main',
      }}
    >
      <Stack spacing={2}>
        <Controller
          name={`${basePath}.difficulty`}
          control={control}
          render={({ field }) => (
            <ExamQuestionMeta
              number={questionIndex + 1}
              level="major"
              metaType="difficulty"
              metaValue={Number(field.value)}
              metaOptions={difficultyOptions}
              keywords={formattedKeywords}
              isEditMode={isEditMode}
              onMetaChange={(val) => field.onChange(String(val))}
              onKeywordAdd={handleKeywordAdd}
              onKeywordRemove={handleKeywordRemove}
              onDelete={onDelete}
              canDelete={canDelete}
              onMoveUp={onMoveUp}
              canMoveUp={canMoveUp}
              onMoveDown={onMoveDown}
              canMoveDown={canMoveDown}
            />
          )}
        />


        <Divider />

        {/* 問題文 */}
        <Box>
          <ExamContentField
            name={`${basePath}.questionContent`}
            label="問題文（大問の説明など）"
            isEditMode={isEditMode}
            placeholder="大問の内容や説明を入力してください"
          />
        </Box>

        <Divider />

        {/* 小問リスト */}
        <Box sx={{ mt: 3 }}>
          <SubQuestionList
            questionIndex={questionIndex}
            isEditMode={isEditMode}
          />
        </Box>
      </Stack>
    </Paper>
  );
};
