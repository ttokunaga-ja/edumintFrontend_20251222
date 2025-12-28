import React, { useMemo, useState } from 'react';
import { Trash2, Plus } from 'lucide-react';

export type Keyword = { id: string; keyword: string };
type KeywordLike = Keyword | string;

type KeywordEditorProps = {
  keywords?: KeywordLike[];
  onAdd?: (keyword: string) => void;
  onRemove?: (id: string) => void;
  placeholder?: string;
  ariaLabelInput?: string;
  canEdit?: boolean;
  className?: string;
};

export const KeywordEditor: React.FC<KeywordEditorProps> = ({
  keywords = [],
  onAdd,
  onRemove,
  placeholder = 'キーワードを追加...',
  ariaLabelInput,
  canEdit = false,
  className = '',
}) => {
  const [newKeyword, setNewKeyword] = useState('');

  const normalized = useMemo<Keyword[]>(() => {
    return (keywords ?? []).map((kw, idx) => {
      if (typeof kw === 'string') return { id: `kw-${idx}`, keyword: kw };
      if (!kw.id) return { ...kw, id: kw.keyword || `kw-${idx}` };
      return kw;
    });
  }, [keywords]);

  const handleAdd = () => {
    if (!newKeyword.trim()) return;
    onAdd?.(newKeyword.trim());
    setNewKeyword('');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div style={{
      display: "flex",
      gap: "0.5rem"
    }>
        {normalized.map((kw) => (
          <span
            key={kw.id}
            style={{
      alignItems: "center",
      gap: "0.25rem"
    }}
          >
            {kw.keyword}
            {canEdit && onRemove && (
              <button
                onClick={() => onRemove(kw.id)}
                className="rounded-full p-0.5 hover:bg-indigo-200"
                aria-label="キーワード削除"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}
      </div>

      {canEdit && onAdd && (
        <div style={{
      display: "flex",
      gap: "0.5rem"
    }>
          <input
            aria-label={ariaLabelInput ?? 'キーワード入力'}
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder={placeholder}
            className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          <button
            onClick={handleAdd}
            className="rounded bg-indigo-100 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-200"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
