import { useEffect, useState, useId } from 'react';
import { Box, Typography, TextField, Button, ToggleButton, ToggleButtonGroup, Stack } from '@mui/material';
import { MarkdownBlock } from './MarkdownBlock';
import { LatexBlock } from './LatexBlock';

export type QuestionFormProps = {
  label?: string;
  value: string;
  onChange?: (content: string) => void;
  textareaLabel?: string;
  previewLabel?: string;
  readOnly?: boolean;
  inputId?: string;
  name?: string;
};

// Simple heuristic for format auto-detection: if contains $ or $$ treat as LaTeX
function autoDetectFormat(content: string): 0 | 1 {
  if (!content) return 0;
  const hasDoubleDollar = /\$\$/g.test(content);
  const hasSingleDollar = /(?<!\$)\$(?!\$)/g.test(content);
  return (hasDoubleDollar || hasSingleDollar) ? 1 : 0;
}

export function QuestionForm({
  label,
  value,
  onChange,
  textareaLabel = '問題文',
  previewLabel = 'プレビュー',
  readOnly = false,
  inputId,
  name,
}: QuestionFormProps) {
  const generatedId = useId();
  const actualId = inputId || `question-form-${generatedId}`;
  const actualName = name || actualId;
  const [content, setContent] = useState(value);
  const [currentFormat, setCurrentFormat] = useState<0 | 1>(autoDetectFormat(value));

  useEffect(() => setContent(value), [value]);
  useEffect(() => setCurrentFormat(autoDetectFormat(value)), [value]);


  if (readOnly) {
    return (
      <Box>
        {label && <Typography variant="subtitle2" gutterBottom>{label}</Typography>}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <Typography variant="caption" color="text.secondary">{textareaLabel}</Typography>
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
            {currentFormat === 0 ? 'MD' : 'LaTeX'}
          </Typography>
        </Stack>
        <Box aria-label="問題文プレビュー" sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          {currentFormat === 0 ? (
            <MarkdownBlock content={content} />
          ) : (
            <LatexBlock content={content} displayMode={false} aria-label="latex-preview" />
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {label && <Typography variant="subtitle2" gutterBottom>{label}</Typography>}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="caption" color="text.secondary">{textareaLabel}</Typography>
        {/* Format is auto-detected. Manual selection removed. */}
      </Stack>
      <TextField
        id={actualId}
        name={actualName}
        label={textareaLabel}
        fullWidth
        multiline
        minRows={3}
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          onChange?.(e.target.value);
        }}
        placeholder={currentFormat === 0 ? 'Markdown 形式で入力...' : 'LaTeX 形式で入力...'}
        sx={{ mb: 2 }}
      />
      <Box>
        <Typography variant="caption" color="text.secondary" gutterBottom>{previewLabel}</Typography>
        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, border: 1, borderColor: 'divider' }}>
          {currentFormat === 0 ? (
            <MarkdownBlock content={content} />
          ) : (
            <LatexBlock content={content} displayMode={false} aria-label="latex-preview" />
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default QuestionForm;
