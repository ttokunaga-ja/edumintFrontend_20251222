import React, { useState } from 'react';
import { Box, FormGroup, FormControlLabel, Checkbox, Typography } from '@mui/material';
import { QuestionEditorPreview } from '@/components/common/editors';
import { ProblemTypeViewProps } from '@/types/problemTypes';

/**
 * SQ2_MultipleChoice
 * ID 2: 複数選択（チェックボックス）
 * 
 * 機能:
 * - 複数選択肢をチェックボックスで表示（問題文はSubQuestionBlockContentで表示済み）
 * - showAnswer時に正解をハイライト
 * - 選択肢ラベルの描画・編集はQuestionEditorPreviewで一元管理
 * 
 * Moodleの実装を参考にした簡潔な設計
 */
export const SQ2_MultipleChoice: React.FC<ProblemTypeViewProps & {
  mode?: 'preview' | 'edit';
}> = ({
  options = [],
  showAnswer = false,
  mode = 'preview',
}) => {
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(
    new Set(options.filter(opt => opt.isCorrect).map(opt => opt.id))
  );

  const handleChange = (optionId: string) => {
    const newSelected = new Set(selectedOptions);
    if (newSelected.has(optionId)) {
      newSelected.delete(optionId);
    } else {
      newSelected.add(optionId);
    }
    setSelectedOptions(newSelected);
  };

  return (
    <FormGroup>
      {options.map((option) => (
        <Box
          key={option.id}
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            p: 1.5,
            mb: 1,
            bgcolor: showAnswer && option.isCorrect ? 'success.light' : 'background.paper',
            border: '1px solid',
            borderColor: showAnswer && option.isCorrect ? 'success.main' : 'divider',
            borderRadius: 1,
            width: '100%',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: 'primary.main',
            }
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedOptions.has(option.id)}
                onChange={() => handleChange(option.id)}
              />
            }
            sx={{ 
              width: '100%',
              flex: 1,
              m: 0,
              '.MuiFormControlLabel-label': {
                width: '100%',
                display: 'block',
              }
            }}
            label={
              <Box sx={{ ml: 1, width: '100%' }}>
                <QuestionEditorPreview
                  value={option.content}
                  onChange={() => {}}
                  previewDisabled={false}
                  mode="preview"
                  minEditorHeight={40}
                  minPreviewHeight={40}
                />
                {showAnswer && option.isCorrect && (
                  <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 'bold', display: 'block', mt: 0.5 }}>
                    ✓ 正解
                  </Typography>
                )}
              </Box>
            }
          />
        </Box>
      ))}
    </FormGroup>
  );
};

export default SQ2_MultipleChoice;
