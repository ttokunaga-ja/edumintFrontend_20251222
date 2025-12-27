import React, { useEffect, useState } from 'react';
import { MarkdownBlock } from '@/components/common/MarkdownBlock';
import { LatexBlock } from '@/components/common/LatexBlock';

type Props = {
  value: string;
  format: 0 | 1;
  onChange: (v: string) => void;
  onFormatChange?: (f: 0 | 1) => void;
  ariaLabel?: string;
  placeholder?: string;
  showPreview?: boolean;
  className?: string;
};

export default function ProblemTextEditor({
  value,
  format,
  onChange,
  onFormatChange,
  ariaLabel = '問題文',
  placeholder = 'Markdown 形式で入力...',
  showPreview = true,
  className,
}: Props) {
  const [val, setVal] = useState(value);
  const [fmt, setFmt] = useState<0 | 1>(format);

  useEffect(() => setVal(value), [value]);
  useEffect(() => setFmt(format), [format]);

  const toggleFormat = () => {
    const next = fmt === 0 ? 1 : 0;
    setFmt(next);
    onFormatChange?.(next);
  };

  return (
    <div className={className}>
      <div className="mb-1 flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">{ariaLabel}</label>
        <button aria-label={`${ariaLabel} フォーマット切替`} className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50" type="button" onClick={toggleFormat}>
          {fmt === 0 ? 'MD' : 'LaTeX'}
        </button>
      </div>

      <textarea
        aria-label={`${ariaLabel}入力`}
        className="w-full min-h-[120px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        placeholder={placeholder}
        value={val}
        onChange={(e) => {
          setVal(e.target.value);
          onChange?.(e.target.value);
        }}
      />

      {showPreview && (
        <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm">
          <div className="mb-2 text-xs font-semibold text-gray-600">プレビュー</div>
          {fmt === 0 ? <MarkdownBlock content={val} className="prose prose-sm max-w-none" /> : <LatexBlock content={val} displayMode={false} className="text-gray-900" />}
        </div>
      )}
    </div>
  );
}
