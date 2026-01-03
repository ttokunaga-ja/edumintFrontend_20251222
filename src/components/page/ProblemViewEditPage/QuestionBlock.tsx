import { useState } from 'react';
import { Box, Card, CardContent, Stack, Divider } from '@mui/material';
import { BlockHeader } from './common/BlockHeader';
import { BlockMeta } from './common/BlockMeta';
import { QuestionBlockContent } from './QuestionBlock/QuestionBlockContent';
import { getDifficultyOptions, getDifficultyLabel } from './utils/difficultyUtils';

export type QuestionBlockProps = {
  questionNumber?: number;
  content?: string;
  format?: 0 | 1; // 0: markdown, 1: latex
  difficulty?: number; // 1: 基礎, 2: 応用, 3: 発展
  keywords?: Array<{ id: string; keyword: string }>;
  canEdit?: boolean;
  canSwitchFormat?: boolean;
  onContentChange?: (content: string) => void;
  onFormatChange?: (format: 0 | 1) => void;
  onUnsavedChange?: (hasUnsaved: boolean) => void;
  onKeywordAdd?: (keyword: string) => void;
  onKeywordRemove?: (keywordId: string) => void;
  onDelete?: () => void;
  onDifficultyChange?: (value: number) => void;
  question?: any; // optional shorthand input
  viewMode?: 'full' | 'structure';
  mode?: 'preview' | 'edit';
  children?: React.ReactNode;
  id?: string;
};

const difficultyLabels = {
  1: { label: '基礎', color: 'success' },
  2: { label: '応用', color: 'warning' },
  3: { label: '発展', color: 'error' },
};

const difficultyOptions = [
  { value: 1, label: '基礎' },
  { value: 2, label: '応用' },
  { value: 3, label: '発展' },
];

export function QuestionBlock({
  questionNumber,
  content,
  format,
  difficulty,
  keywords = [],
  canEdit = false,
  canSwitchFormat = false,
  onContentChange,
  onFormatChange,
  onUnsavedChange,
  onKeywordAdd,
  onKeywordRemove,
  onDelete,
  onDifficultyChange,
  viewMode = 'full',
  mode = 'preview',
  question,
  children,
  id,
}: QuestionBlockProps) {
  const derivedContent = content ?? question?.question_content ?? question?.questionContent ?? '';
  const derivedNumber = questionNumber ?? question?.question_number ?? question?.questionNumber ?? 1;
  const derivedFormat = (format ?? question?.question_format ?? question?.questionFormat ?? 0) as 0 | 1;
  const derivedDifficulty = difficulty || question?.difficulty || 1; // Default to 1 (基礎) if 0, null, or undefined
  const derivedKeywords = keywords.length ? keywords : question?.keywords ?? [];

  const [currentFormat, setCurrentFormat] = useState<0 | 1>(derivedFormat);
  const [editContent, setEditContent] = useState(derivedContent);
  const actualId = id || `qblock-${derivedNumber}`;

  return (
    <Card variant="outlined" sx={{ mb: 4 }}>
      <CardContent>
        <Stack spacing={2}>
          {/* Header + Meta Info Row (同じ行に配置 - delete button now part of BlockMeta) */}
          <Box sx={{ display: 'flex', gap: 3, width: '100%', alignItems: 'flex-start' }}>
            {/* Header (大問番号) - Fixed width column */}
            <Box sx={{ minWidth: '80px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <BlockHeader
                level="major"
                number={derivedNumber}
              />
            </Box>

            {/* Meta Info (難易度 + キーワード + Delete Button) */}
            <Box sx={{ flex: 1 }}>
              <BlockMeta
                level="major"
                metaType="difficulty"
                metaValue={derivedDifficulty}
                metaLabel={derivedDifficulty ? (difficultyLabels as any)[derivedDifficulty]?.label : undefined}
                metaOptions={difficultyOptions}
                keywords={derivedKeywords}
                mode={canEdit ? 'edit' : 'preview'}
                canEdit={canEdit}
                metaLabels={difficultyLabels as any}
                onMetaChange={(event) => {
                  // BlockMeta passes SelectChangeEvent, extract the value
                  const value = (event.target as any).value;
                  if (typeof value === 'number') {
                    onDifficultyChange?.(value);
                  }
                }}
                onKeywordAdd={(keyword) => {
                  onKeywordAdd?.(keyword);
                }}
                onKeywordRemove={(keywordId) => {
                  onKeywordRemove?.(keywordId);
                }}
                onDelete={onDelete}
                id={`${actualId}-meta`}
              />
            </Box>
          </Box>

          <Divider />

          {/* Content */}
          {viewMode === 'full' && (
            <QuestionBlockContent
              content={editContent}
              format={currentFormat}
              onContentChange={(v) => {
                setEditContent(v);
                onContentChange?.(v);
              }}
              onFormatChange={(f) => {
                setCurrentFormat(f);
                onFormatChange?.(f);
              }}
              onUnsavedChange={onUnsavedChange}
              mode={mode}
              id={`${actualId}-content`}
            />
          )}

          {children && (
            <Box sx={{ mt: 2, pl: { xs: 0, md: 2 }, borderLeft: { xs: 'none', md: 2 }, borderColor: 'divider' }}>
              {children}
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
