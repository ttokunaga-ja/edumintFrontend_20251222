import React from 'react';
import { Box, Stack, Chip } from '@mui/material';
import DifficultySelect from '@/components/common/selects/DifficultySelect';
import KeywordManager from '@/components/common/inputs/KeywordManager';

export interface QuestionBlockMetaProps {
  difficulty: number;
  keywords: Array<{ id: string; keyword: string }>;
  mode?: 'preview' | 'edit'; // 'preview' = view, 'edit' = edit
  onDifficultyChange?: (difficulty: number) => void;
  onKeywordAdd?: (keyword: string) => void;
  onKeywordRemove?: (keywordId: string) => void;
  difficultyLabels?: Record<number, { label: string; color: string }>;
  id?: string;
}

/**
 * QuestionBlockMeta
 * 
 * 統合メタデータコンポーネント（難易度 + キーワード）
 * mode プロップで view/edit モードを切り替え
 * 
 * View モード:
 * 1行目: [難易度チップ]
 * 2行目: [キーワードチップ（削除ボタンなし）]
 * 
 * Edit モード:
 * 1行目: [難易度プルダウン]
 * 2行目: [KeywordManager - キーワード入力 + 既存キーワード表示/削除]
 * 
 * KeywordManager は入力、オートコンプリート、チップ表示、削除をすべて統一管理
 */
export const QuestionBlockMeta: React.FC<QuestionBlockMetaProps> = ({
  difficulty,
  keywords = [],
  mode = 'preview',
  onDifficultyChange,
  onKeywordAdd,
  onKeywordRemove,
  difficultyLabels = {
    1: { label: '基礎', color: 'success' },
    2: { label: '応用', color: 'warning' },
    3: { label: '発展', color: 'error' },
  },
  id,
}) => {
  const isEditMode = mode === 'edit';
  const difficultyMeta = difficultyLabels[difficulty];

  return (
    <Stack spacing={2}>
      {/* Row 1: Difficulty (Chip/Select) */}
      <Box sx={{ minWidth: '150px' }}>
        {isEditMode ? (
          <DifficultySelect
            value={difficulty}
            onChange={(event) => {
              const value = event.target.value as number;
              onDifficultyChange?.(value);
            }}
            id={id ? `${id}-difficulty` : undefined}
            name={id ? `${id}-difficulty` : undefined}
            size="small"
            fullWidth={false}
          />
        ) : (
          difficultyMeta && (
            <Chip
              label={difficultyMeta.label}
              color={(difficultyMeta.color as any) || 'default'}
              size="small"
              variant="outlined"
            />
          )
        )}
      </Box>

      {/* Row 2: KeywordManager (input + chips + delete) - unified management */}
      {isEditMode ? (
        <KeywordManager
          keywords={keywords}
          onAdd={onKeywordAdd}
          onRemove={onKeywordRemove}
          label="キーワード"
          readOnly={false}
          disabled={false}
          inputId={id ? `${id}-keywords` : undefined}
          showHelperText={false}
        />
      ) : (
        keywords.length > 0 && (
          <KeywordManager
            keywords={keywords}
            onRemove={undefined}
            label="キーワード"
            readOnly={true}
            disabled={false}
            inputId={id ? `${id}-keywords-display` : undefined}
            showHelperText={false}
          />
        )
      )}
    </Stack>
  );
};

export default QuestionBlockMeta;
