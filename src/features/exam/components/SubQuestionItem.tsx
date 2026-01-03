import React, { useState } from 'react';
import { useFormContext, Controller, useFieldArray } from 'react-hook-form';
import {
  Paper,
  Box,
  TextField,
  Stack,
  Divider,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ExamQuestionMeta } from './ExamQuestionMeta';

import { QuestionTypeLabels } from '../schema';
import { FormatRegistry } from './formats/FormatRegistry';
import { ExamContentField } from './inputs/ExamContentField';
import type { ExamFormValues } from '../schema';

interface SubQuestionItemProps {
  questionIndex: number;
  subQuestionIndex: number;
  isEditMode: boolean;
  onDelete?: () => void;
  canDelete: boolean;
}

const questionTypeOptions = Object.entries(QuestionTypeLabels).map(([value, label]) => ({
  value: Number(value),
  label,
}));

export const SubQuestionItem: React.FC<SubQuestionItemProps> = ({
  questionIndex,
  subQuestionIndex,
  isEditMode,
  onDelete,
  canDelete,
}) => {
  const { control, watch } = useFormContext<ExamFormValues>();
  const basePath = `questions.${questionIndex}.subQuestions.${subQuestionIndex}`;

  // アコーディオン展開状態
  const [expandedSections, setExpandedSections] = useState<{
    answer: boolean;
    format: boolean;
  }>({
    answer: false,
    format: false,
  });

  const handleAccordionChange = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const questionTypeId = watch(`${basePath}.questionTypeId`);

  // キーワード管理
  const { fields: keywordFields, append, remove } = useFieldArray({
    control,
    name: `${basePath}.keywords` as any,
  });

  // BlockMeta用にキーワード変形
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
      elevation={0}
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        backgroundColor: 'background.paper',
      }}
    >
      <Stack spacing={2}>
        {/* Header + Meta Info (BlockMeta) */}
        <Controller
          name={`${basePath}.questionTypeId`}
          control={control}
          render={({ field }) => (
            <ExamQuestionMeta
              level="minor"
              number={subQuestionIndex + 1}
              metaType="questionType"
              metaValue={Number(field.value)}
              metaOptions={questionTypeOptions}
              keywords={formattedKeywords}
              isEditMode={isEditMode}
              onMetaChange={(e) => field.onChange(String(e.target.value))}
              onKeywordAdd={handleKeywordAdd}
              onKeywordRemove={handleKeywordRemove}
              onDelete={onDelete}
              canDelete={canDelete}
            />
          )}
        />

        <Divider />

        {/* 問題セクション */}
        <Box>
          <ExamContentField
            name={`${basePath}.questionContent`}
            label="問題文"
            isEditMode={isEditMode}
            placeholder="問題文を入力してください（Markdown/LaTeX対応）"
          />
        </Box>

        {/* 形式別エディタセクション（ID 1-5のみ、アコーディオンなし） */}
        {['1', '2', '3', '4', '5'].includes(String(questionTypeId)) && (
          <Box sx={{ mt: 2 }}>
            <FormatRegistry
              questionTypeId={String(questionTypeId)}
              basePath={basePath}
              isEditMode={isEditMode}
            />
          </Box>
        )}

        {/* 解答解説セクション */}
        {isEditMode ? (
          // Editモード: 常時表示 (アコーディオンなし)
          <Box sx={{ mt: 2 }}>
            <ExamContentField
              name={`${basePath}.answerContent`}
              label="解答解説"
              isEditMode={true}
              placeholder="解答や解説を入力してください"
            />
          </Box>
        ) : (
          // Viewモード: アコーディオン
          <Accordion
            expanded={expandedSections.answer}
            onChange={() => handleAccordionChange('answer')}
            sx={{
              backgroundColor: 'transparent',
              boxShadow: 'none',
              border: '1px solid',
              borderColor: 'divider',
              '&:before': { display: 'none' },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: 'action.hover',
                '&.Mui-expanded': { backgroundColor: 'action.focus' },
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                解答解説
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 2 }}>
              <ExamContentField
                name={`${basePath}.answerContent`}
                isEditMode={false}
              />
            </AccordionDetails>
          </Accordion>
        )}
      </Stack>
    </Paper>
  );
};

