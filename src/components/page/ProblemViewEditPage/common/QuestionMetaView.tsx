import React from 'react';
import { Box, Chip, Stack } from '@mui/material';
import { KeywordEditor, Keyword } from './KeywordEditor';

type DifficultyMeta = { label: string; color: string };

type QuestionMetaViewProps = {
  difficulty?: number | null;
  difficultyLabels: Record<number, DifficultyMeta>;
  keywords?: Keyword[];
};

/**
 * QuestionMetaView
 * 
 * Viewモードで難易度とキーワードを表示
 * レイアウト：
 * 1行目: [難易度チップ] [キーワード一覧]
 */
export const QuestionMetaView: React.FC<QuestionMetaViewProps> = ({
  difficulty,
  difficultyLabels,
  keywords = [],
}) => {
  const effectiveDifficulty = difficulty ?? 0;
  const meta = difficultyLabels[effectiveDifficulty] ?? difficultyLabels[0];

  return (
    <Stack spacing={2}>
      {/* Row 1: Difficulty Chip + Keywords */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, width: '100%', flexWrap: 'wrap' }}>
        {meta && (
          <Chip
            label={meta.label}
            color={(meta.color as any) || 'default'}
            size="small"
            variant="outlined"
          />
        )}
        {keywords.length > 0 && (
          <KeywordEditor keywords={keywords} canEdit={false} />
        )}
      </Box>
    </Stack>
  );
};

