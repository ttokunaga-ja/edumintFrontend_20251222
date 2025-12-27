import React from 'react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  ariaLabel?: string;
  placeholder?: string;
  language?: string;
};

export default function CodeEditorWrapper({ value, onChange, ariaLabel = '解答 / メモ', placeholder = 'コードを入力...', language }: Props) {
  // Lightweight code editor wrapper: uses a simple textarea as the editable surface.
  // Heavy editors (Monaco/CodeMirror) can be lazily loaded later behind feature flags.
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">{ariaLabel}</label>
      </div>
      <textarea
        aria-label={`${ariaLabel}入力`}
        className="w-full min-h-[160px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 font-mono"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm">
        <div className="mb-2 text-xs font-semibold text-gray-600">プレビュー</div>
        <pre className="prose prose-sm max-w-none whitespace-pre-wrap"><code>{value}</code></pre>
      </div>
    </div>
  );
}
