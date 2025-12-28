import React, { useEffect, useState } from 'react';
import { MarkdownBlock } from './MarkdownBlock';
import { LatexBlock } from './LatexBlock';

export type QuestionFormProps = {
  label?: string;
  value: string;
  format: 0 | 1;
  onChange?: (content: string) => void;
  onFormatChange?: (format: 0 | 1) => void;
  textareaLabel?: string;
  previewLabel?: string;
  className?: string;
  readOnly?: boolean;
};

export function QuestionForm({
  label,
  value,
  format,
  onChange,
  onFormatChange,
  textareaLabel = '問題文',
  previewLabel = 'プレビュー',
  className = '',
  readOnly = false,
}: QuestionFormProps) {
  const [content, setContent] = useState(value);
  const [currentFormat, setCurrentFormat] = useState<0 | 1>(format);

  useEffect(() => setContent(value), [value]);
  useEffect(() => setCurrentFormat(format), [format]);

  const toggleFormat = () => {
    const next = currentFormat === 0 ? 1 : 0;
    setCurrentFormat(next);
    onFormatChange?.(next);
  };

  if (readOnly) {
    return (
      <div >
        {label && <div >{label}</div>}
        <div style={{
      display: "flex",
      alignItems: "center"
    }>
          <span >{textareaLabel}</span>
          {/* 非対話で表示のみ */}
          <span  aria-label="問題文フォーマット表示">
            {currentFormat === 0 ? 'MD' : 'LaTeX'}
          </span>
        </div>
        <div  aria-label="問題文プレビュー">
          {currentFormat === 0 ? (
            <MarkdownBlock content={content}  />
          ) : (
            <LatexBlock content={content} displayMode={false}  aria-label="latex-preview" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div >
      {label && <div >{label}</div>}
      <div style={{
      display: "flex",
      alignItems: "center"
    }>
        <label  aria-label={`${textareaLabel}-label`}>
          {textareaLabel}
        </label>
        <button
          type="button"
          onClick={toggleFormat}
          aria-label="問題文フォーマット切替"
          disabled={readOnly && !onFormatChange}
          
        >
          {currentFormat === 0 ? 'MD' : 'LaTeX'}
        </button>
      </div>
      <textarea
        aria-label="問題文入力"
        value={content}
        onChange={(e) => {
          if (readOnly) return;
          setContent(e.target.value);
          onChange?.(e.target.value);
        }}
        readOnly={readOnly}
        style={{
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem"
    }}
        placeholder={currentFormat === 0 ? 'Markdown 形式で入力...' : 'LaTeX 形式で入力...'} />
      <div >
        <div >{previewLabel}</div>
        {currentFormat === 0 ? (
          <MarkdownBlock content={content}  />
        ) : (
          <LatexBlock content={content} displayMode={false}  aria-label="latex-preview" />
        )}
      </div>
    </div>
  );
}

export default QuestionForm;
