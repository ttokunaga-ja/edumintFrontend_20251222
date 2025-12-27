import React, { useEffect, useState } from 'react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  ariaLabel?: string;
  placeholder?: string;
  language?: string;
};

export default function CodeEditorWrapper({ value, onChange, ariaLabel = '解答 / メモ', placeholder = 'コードを入力...', language = 'javascript' }: Props) {
  // Lazy-load CodeMirror (via @uiw/react-codemirror) to keep initial bundle small.
  const [EditorComp, setEditorComp] = useState<React.ComponentType<any> | null>(null);
  const [langExt, setLangExt] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    // Dynamically import editor and language module
    Promise.all([import('@uiw/react-codemirror'), import('@codemirror/lang-javascript')])
      .then(([editorModule, langModule]) => {
        if (!mounted) return;
        setEditorComp(() => editorModule.default);
        setLangExt(() => langModule.javascript());
      })
      .catch(() => {
        /* ignore — fallback will remain */
      });
    return () => {
      mounted = false;
    };
  }, [language]);

  if (EditorComp && langExt) {
    const Editor = EditorComp as any;
    return (
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">{ariaLabel}</label>
        </div>
        <Editor
          value={value}
          onChange={(val: string) => onChange(val)}
          extensions={[langExt]}
          aria-label={`${ariaLabel}入力`}
          placeholder={placeholder}
          className="rounded-lg border border-gray-300"
        />
        <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm">
          <div className="mb-2 text-xs font-semibold text-gray-600">プレビュー</div>
          <pre className="prose prose-sm max-w-none whitespace-pre-wrap"><code>{value}</code></pre>
        </div>
      </div>
    );
  }

  // Fallback editable textarea while CodeMirror is loading or unavailable (keeps tests deterministic)
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
