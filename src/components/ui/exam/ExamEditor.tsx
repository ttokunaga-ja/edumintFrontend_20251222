import React, { useState, useRef, useCallback, useEffect, useId } from 'react';
import { Box, Paper, TextField, Typography, useTheme } from '@mui/material';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { ExamViewer } from './ExamViewer';

/**
 * ExamEditor
 * 
 * 入力エリアとプレビューエリア（ExamViewer）を上下に並べ、リサイズ機能を提供
 * - エディタ部分: TextField（Markdown/LaTeX入力）
 * - リサイズハンドル: マウスドラッグで高さ調整
 * - プレビュー部分: ExamViewerで表示（編集と保存後の見た目を統一）
 * - バリデーションエラー対応
 */
export interface ExamEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minEditorHeight?: number;
  initialEditorHeight?: number;
  error?: boolean;
  helperText?: string;
}

export const ExamEditor: FC<ExamEditorProps> = ({
  value,
  onChange,
  placeholder,
  minEditorHeight = 150,
  initialEditorHeight = 150,
  error = false,
  helperText,
}) => {
  const theme = useTheme();
  const id = useId();
  const [editorHeight, setEditorHeight] = useState(initialEditorHeight);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  // --- リサイズロジック ---
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startY.current = e.clientY;
    startHeight.current = editorHeight;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;
    const deltaY = e.clientY - startY.current;
    const newHeight = Math.max(minEditorHeight, startHeight.current + deltaY);
    setEditorHeight(newHeight);
  }, [minEditorHeight]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <Box>
      <Paper
        variant="outlined"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderColor: error ? 'error.main' : 'divider',
          borderWidth: error ? 2 : 1,
        }}
      >
        {/* 1. 入力エリア (EDITOR) */}
        <Box
          sx={{
            height: editorHeight,
            transition: isDragging.current ? 'none' : 'height 0.1s',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <TextField
            id={id}
            name={id}
            multiline
            fullWidth
            minRows={1}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              sx: {
                height: '100%',
                p: 2,
                alignItems: 'flex-start',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                '& textarea': {
                  height: '100% !important',
                  overflowY: 'auto !important',
                }
              }
            }}
            sx={{
              height: '100%',
              '& .MuiInputBase-root': {
                height: '100%',
              }
            }}
          />
        </Box>

        {/* 2. リサイズハンドル */}
        <Box
          onMouseDown={handleMouseDown}
          sx={{
            height: 12,
            bgcolor: 'action.hover',
            cursor: 'row-resize',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderTop: 1,
            borderBottom: 1,
            borderColor: 'divider',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: 'action.selected',
              borderColor: 'primary.main',
            }
          }}
        >
          <DragHandleIcon
            sx={{
              fontSize: 16,
              color: 'text.secondary',
              transform: 'rotate(90deg)',
              opacity: 0.6,
            }}
          />
        </Box>

        {/* 3. プレビューエリア (VIEWER - 内包) */}
        <Box sx={{
          p: 2,
          bgcolor: 'background.default',
          height: 100,
          minHeight: 100,
        }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              mb: 1,
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            Preview
          </Typography>
          <ExamViewer
            content={value}
            sx={{
              fontSize: '0.95rem',
            }}
          />
        </Box>
      </Paper>

      {/* エラーメッセージ */}
      {error && helperText && (
        <Typography
          variant="caption"
          color="error"
          sx={{
            display: 'block',
            mt: 0.75,
            fontWeight: 500,
          }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

export default ExamEditor;
