import React, { useMemo, useState } from 'react';
import { Trash2, Plus } from 'lucide-react'; export type Keyword = { id?: string; keyword: string };

type KeywordLike = Keyword | string;

type KeywordEditorProps = {
  keywords?: KeywordLike[];
  onAdd?: (keyword: string) => void;
  onRemove?: (id: string) => void;
  placeholder?: string;
  ariaLabelInput?: string;
  canEdit?: boolean;
}; export const KeywordEditor: React.FC<KeywordEditorProps> = ({ keywords = [], onAdd, onRemove, placeholder = 'キーワードを追加...', ariaLabelInput, canEdit = false,
}) => {
  const [newKeyword, setNewKeyword] = useState('');

  const normalized = useMemo<Keyword[]>(() => {
    return (keywords ?? []).map((kw, idx) => {
      if (typeof kw === 'string') return { id: String(idx), keyword: kw };
      if (!kw.id) return { ...kw, id: kw.keyword || String(idx) };
      return kw;
    });
  }, [keywords]);

  const handleAdd = () => {
    if (!newKeyword.trim()) return;
    onAdd?.(newKeyword.trim());
    setNewKeyword('');
  };

  return (
    <div>
      <div style={{ gap: '0.5rem' }}>
        {normalized.map((kw) => (
          <span key={kw.id} style={{ alignItems: 'center', gap: '0.25rem' }}>
            {kw.keyword}
            {canEdit && onRemove && (
              <button onClick={() => onRemove(kw.id)} aria-label="キーワード削除">
                <Trash2 />
              </button>
            )}
          </span>
        ))}
      </div>

      {canEdit && onAdd && (
        <div style={{ gap: '0.5rem' }}>
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
          />
          <button onClick={handleAdd} aria-label="キーワード追加">
            <Plus />
          </button>
        </div>
      )}
    </div>
  );
};
