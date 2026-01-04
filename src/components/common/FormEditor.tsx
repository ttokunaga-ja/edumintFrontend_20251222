import React, { useCallback, useState, useEffect } from 'react';
import { Box, useTheme } from '@mui/material';

/**
 * FormEditor
 *
 * 特徴：
 * - 等幅フォント
 * - シンタックスハイライト（$...$と$$...$$）
 * - 自動ペアリング（$と{})
 * - エスケープ処理（\$）
 * - 行番号表示
 * - ガイダンステキスト
 */

interface FormEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  hasLatex?: boolean;
  readOnly?: boolean;
  id?: string;
  name?: string;
}

export const FormEditor: FC<FormEditorProps> = ({
  value,
  onChange,
  placeholder = '',
  onScroll,
  hasLatex = false,
  readOnly = false,
  id,
  name,
}) => {
  const theme = useTheme();
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // 自動ペアリング（$, {, [, (, " ）
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (readOnly || isComposing) return;

    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let newChar = '';
    let closeChar = '';
    let moveBack = false;

    // 自動ペアリングルール
    if (e.key === '$') {
      newChar = '$';
      closeChar = '$';
      moveBack = true;
    } else if (e.key === '{') {
      newChar = '{';
      closeChar = '}';
      moveBack = true;
    } else if (e.key === '[') {
      newChar = '[';
      closeChar = ']';
      moveBack = true;
    } else if (e.key === '(') {
      newChar = '(';
      closeChar = ')';
      moveBack = true;
    } else if (e.key === '"') {
      newChar = '"';
      closeChar = '"';
      moveBack = true;
    }

    // ペアリング挿入
    if (newChar && selectedText === '') {
      e.preventDefault();

      const beforeText = value.substring(0, start);
      const afterText = value.substring(end);
      const newValue = beforeText + newChar + closeChar + afterText;

      onChange(newValue);

      // 次のフレームでキャレットを移動
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 1;
          textareaRef.current.focus();
        }
      }, 0);
    }
  }, [value, onChange, readOnly, isComposing]);

  // テキスト変更
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  // スクロール同期
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (onScroll) {
      onScroll(e);
    }
  }, [onScroll]);

  // IME対応
  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false);
  }, []);

  const generatedId = React.useId();
  const actualId = id || `form-editor-${generatedId}`;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.02)'
          : '#fafafa',
      }}
    >
      <Box component="label" htmlFor={actualId} sx={{ srOnly: true }}>
        {placeholder}
      </Box>
      <textarea
        id={actualId}
        name={name || actualId}
        aria-label={placeholder}
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        placeholder={placeholder}
        readOnly={readOnly}
        style={{
          flex: 1,
          width: '100%',
          border: 'none',
          padding: '16px',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
          lineHeight: '1.6',
          backgroundColor: 'transparent',
          color: theme.palette.text.primary,
          outline: 'none',
          resize: 'none',
          overflow: 'auto',
        }}
      />
    </Box>
  );
};

export default FormEditor;
