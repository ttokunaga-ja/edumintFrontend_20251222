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
  structureOnly?: boolean;
  onDelete?: () => void;
  canDelete: boolean;
  onMoveUp?: () => void;
  canMoveUp: boolean;
  onMoveDown?: () => void;
  canMoveDown: boolean;
}

const levelOptions = Object.entries(DifficultyLabels).map(([value, label]) => ({
  value: Number(value),
  label,
}));

export const QuestionItem: FC<QuestionItemProps> = ({
  questionIndex,
  isEditMode,
  structureOnly,
  onDelete,
  canDelete,
  onMoveUp,
  canMoveUp,
  onMoveDown,
  canMoveDown,
}) => {
  const { control, watch, formState: { errors } } = useFormContext<ExamFormValues>();
  const basePath = `questions.${questionIndex}`;

  const level = watch(`${basePath}.level`);

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
      data-testid="question-item"
      sx={{
        p: 3,
        borderLeft: '4px solid',
        borderColor: 'primary.main',
      }}
    >
      <Stack spacing={2}>
        <Controller
          name={`${basePath}.level`}
          control={control}
          render={({ field }) => (
            <ExamQuestionMeta
              number={questionIndex + 1}
              level="major"
              metaType="level"
              metaValue={Number(field.value)}
              metaOptions={levelOptions}
              keywords={formattedKeywords}
              isEditMode={isEditMode}
              onMetaChange={(val) => field.onChange(Number(val))}
              onKeywordAdd={handleKeywordAdd}
              onKeywordRemove={handleKeywordRemove}
              errorMessage={errors.questions?.[questionIndex]?.keywords?.message}
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
        {!structureOnly && (
          <Box>
            <ExamContentField
              name={`${basePath}.questionContent`}
              label="問題文（大問の説明など）"
              isEditMode={isEditMode}
              placeholder="大問の内容や説明を入力してください"
            />
          </Box>
        )}
        {!structureOnly && <Divider />}

        {/* 小問リスト */}
        <Box sx={{ mt: 3 }}>
          <SubQuestionList
            questionIndex={questionIndex}
            isEditMode={isEditMode}
            structureOnly={structureOnly}
          />
        </Box>
      </Stack>
    </Paper>
  );
};
