import React from 'react';
import { Box, Stack, Chip } from '@mui/material';
import QuestionTypeSelect from '@/components/common/selects/QuestionTypeSelect';
import KeywordManager from '@/components/common/inputs/KeywordManager';

export interface SubQuestionBlockMetaProps {
  questionTypeId: number;
  questionTypeLabel?: string;
  questionTypeOptions?: Array<{ value: number; label: string }>;
  keywords: Array<{ id: string; keyword: string }>;
  mode?: 'preview' | 'edit'; // 'preview' = view, 'edit' = edit
  onTypeChange?: (typeId: number) => void;
  onKeywordAdd?: (keyword: string) => void;
  onKeywordRemove?: (keywordId: string) => void;
  id?: string;
}

/**
 * SubQuestionBlockMeta
 * 
 * 統合メタデータコンポーネント（問題形式 + キーワード）
 * mode プロップで view/edit モードを切り替え
 * 
 * View モード:
 * 1行目: [問題形式チップ]
 * 2行目: [キーワードチップ（削除ボタンなし）]
 * 
 * Edit モード:
 * 1行目: [問題形式プルダウン]
 * 2行目: [KeywordManager - キーワード入力 + 既存キーワード表示/削除]
 * 
 * KeywordManager は入力、オートコンプリート、チップ表示、削除をすべて統一管理
 */
export const SubQuestionBlockMeta: React.FC<SubQuestionBlockMetaProps> = ({
  questionTypeId,
  questionTypeLabel,
  questionTypeOptions = [],
  keywords = [],
  mode = 'preview',
  onTypeChange,
  onKeywordAdd,
  onKeywordRemove,
  id,
}) => {
  const isEditMode = mode === 'edit';

  return (
    <Stack spacing={2}>
      {/* Row 1: Question Type (Chip/Select) */}
      <Box sx={{ minWidth: '150px' }}>
        {isEditMode ? (
          <QuestionTypeSelect
            value={questionTypeId}
            onChange={(event) => {
              const value = event.target.value as number;
              onTypeChange?.(value);
            }}
            options={questionTypeOptions}
            id={id ? `${id}-type` : undefined}
            name={id ? `${id}-type` : undefined}
            size="small"
            fullWidth={false}
          />
        ) : (
          <Chip
            label={questionTypeLabel || '未設定'}
            color="default"
            size="small"
            variant="outlined"
          />
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

export default SubQuestionBlockMeta;
