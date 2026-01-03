import React from 'react';
import { Box } from '@mui/material';
import { QuestionEditorPreview } from '@/components/common/editors';

export interface QuestionBlockContentProps {
  content: string;
  format: 0 | 1;
  onContentChange?: (content: string) => void;
  onFormatChange?: (format: 0 | 1) => void;
  onUnsavedChange?: (hasUnsaved: boolean) => void;
  mode?: 'preview' | 'edit';
  id?: string;
}

/**
 * QuestionBlock のコンテンツコンポーネント
 * 
 * 問題文入力フォーム + プレビューを表示
 * QuestionEditorPreviewを使用してMarkdown/LaTeX自動解析
 */
export const QuestionBlockContent: React.FC<QuestionBlockContentProps> = ({
  content,
  format,
  onContentChange,
  onFormatChange,
  onUnsavedChange,
  mode = 'preview',
  id,
}) => {
  return (
    <Box>
      <QuestionEditorPreview
        value={content}
        onChange={(v) => onContentChange?.(v)}
        onUnsavedChange={onUnsavedChange}
        mode={mode}
        inputId={id}
        name={id}
      />
    </Box>
  );
};

export default QuestionBlockContent;
