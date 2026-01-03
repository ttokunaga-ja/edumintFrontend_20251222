import React, { useState, useEffect, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Stack, CircularProgress, Accordion, AccordionSummary, AccordionDetails, Typography, useTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { QuestionEditorPreview } from '@/components/common/editors';
import ProblemTypeRegistry from '@/components/problemTypes/ProblemTypeRegistry';
import { ProblemTypeViewProps } from '@/types/problemTypes';
import { SubQuestionFormData } from '@/features/content/types';

export interface SubQuestionBlockContentProps {
  subQuestionNumber: number;
  questionTypeId: number;
  questionContent: string;
  answerContent?: string;
  answerExplanation?: string;
  options?: Array<{ id: string; content: string; isCorrect: boolean }>;
  pairs?: Array<{ id: string; question: string; answer: string }>;
  items?: Array<{ id: string; text: string; correctOrder: number }>;
  answers?: Array<{ id: string; sampleAnswer: string; gradingCriteria: string; pointValue: number }>;
  keywords?: Array<{ id: string; keyword: string }>;
  canEdit?: boolean;
  showAnswer?: boolean;
  onQuestionChange?: (content: string) => void;
  onAnswerChange?: (content: string) => void;
  onExplanationChange?: (content: string) => void;
  onContentUpdate?: (data: Partial<SubQuestionFormData>) => Promise<void>;
  onQuestionsUnsavedChange?: (hasUnsaved: boolean) => void;
  onAnswersUnsavedChange?: (hasUnsaved: boolean) => void;
  mode?: 'preview' | 'edit';
  id?: string;
}

export const SubQuestionBlockContent: React.FC<SubQuestionBlockContentProps> = ({
  subQuestionNumber,
  questionTypeId,
  questionContent,
  answerContent,
  answerExplanation,
  options = [],
  pairs = [],
  items = [],
  answers = [],
  keywords = [],
  canEdit = false,
  showAnswer = false,
  onQuestionChange,
  onAnswerChange,
  onExplanationChange,
  onContentUpdate,
  onQuestionsUnsavedChange,
  onAnswersUnsavedChange,
  mode = 'preview',
  id,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  // 問題形式変更時に再レンダリングを強制するキー
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    ProblemTypeRegistry.registerDefaults();
  }, []);

  // 問題形式（questionTypeId）が変更されたら renderKey を更新して再レンダリング
  // 強制的にコンポーネントを再マウントしてフォーム状態をリセット
  useEffect(() => {
    setRenderKey(prev => prev + 1);
  }, [questionTypeId]);
  
  // 深い比較でquestionTypeIdの変更を検出
  useEffect(() => {
    setRenderKey(prev => prev + 1);
  }, [JSON.stringify({ questionTypeId })]);

  const handleSave = (content: string) => {
    onQuestionChange?.(content);
    setIsEditing(false);
  };

  const actualId = id || `sub-q-content-${subQuestionNumber}`;
  const isSelectionType = questionTypeId >= 1 && questionTypeId <= 5;

  // ProblemTypeRegistry から適切なコンポーネントを取得
  const ViewComponent = ProblemTypeRegistry.getProblemTypeView?.(questionTypeId);

  return (
    <Box key={`subquestion-content-${renderKey}`}>
      {/* 1. 問題文セクション */}
      <Box sx={{ mb: 2 }}>
        {isEditing ? (
          <Stack spacing={1}>
            <QuestionEditorPreview
              value={questionContent}
              onChange={handleSave}
              onUnsavedChange={onQuestionsUnsavedChange}
              minEditorHeight={150}
              minPreviewHeight={150}
              mode="edit"
              inputId={`${actualId}-editor`}
              name={`${actualId}-editor`}
            />
            <Stack direction='row' spacing={1}>
              <Button
                variant='outlined'
                size='small'
                onClick={() => setIsEditing(false)}
              >
                {t('common.cancel')}
              </Button>
            </Stack>
          </Stack>
        ) : (
          <QuestionEditorPreview
            value={questionContent}
            onChange={() => { }}
            onUnsavedChange={onQuestionsUnsavedChange}
            previewDisabled={false}
            mode={mode}
            inputId={`${actualId}-preview`}
            name={`${actualId}-preview`}
          />
        )}
      </Box>

      {/* 2. 選択肢セクション（ID1-5の場合のみ、showAnswer=false） */}
      {isSelectionType && ViewComponent && (
        <Box sx={{ mb: 2 }}>
          <Suspense fallback={<CircularProgress size={24} />}>
            {React.createElement(ViewComponent, {
              subQuestionNumber,
              questionContent: '', // 問題文は上で既に表示済み
              questionFormat: 0,
              answerContent: answerContent || '',
              answerFormat: 0,
              options,
              keywords,
              showAnswer: false, // 通常表示では正解を表示しない
              canEdit: false,
              pairs,
              items,
              answers,
              onQuestionChange,
              onAnswerChange,
              onQuestionsUnsavedChange,
              onAnswersUnsavedChange,
            })}
          </Suspense>
        </Box>
      )}

      {/* 3. ID10-14（記述式）の場合は何も表示しない（問題文は上で既に表示済み） */}

      {/* 4. 解答解説アコーディオン */}
      {!isEditing && (
        <Accordion
          defaultExpanded={false}
          sx={{ 
            mt: 2, 
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            '&:before': {
              display: 'none'
            }
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: theme.palette.primary.main }}>
              解答解説を表示
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ bgcolor: theme.palette.background.default }}>
            {/* 解説テキストのみ表示 */}
            {answerExplanation ? (
              <Box sx={{ p: 2, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                <Typography variant="body2">
                  {answerExplanation}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                解説は登録されていません
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
};

export default SubQuestionBlockContent;

