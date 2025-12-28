// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { Search, Loader } from 'lucide-react';
import { suggestReadings } from '@/features/search/repository';
import type { ReadingSuggestion } from '@/features/search/models';

export type MultilingualAutocompleteProps = {
  value: string;
  onChange: (value: string, item?: ReadingSuggestion) => void;
  placeholder?: string;
  category?: 'university' | 'faculty' | 'subject' | 'teacher';
  icon?: React.ReactNode;
  className?: string;
  showReadings?: boolean; // 読みを表示するか
  minChars?: number; // 最小検索文字数
};

export function MultilingualAutocomplete({
  value,
  onChange,
  placeholder = '入力してください',
  category,
  icon,
  className = '',
  showReadings = true,
  minChars = 1,
}: MultilingualAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<ReadingSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (query.length < minChars) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await suggestReadings(query, category);
      setSuggestions(results as ReadingSuggestion[]);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    onChange(newValue);
    setShowSuggestions(true);

    // デバウンス処理
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300);
  };

  const handleSuggestionClick = (suggestion: ReadingSuggestion) => {
    setInputValue(suggestion.name);
    onChange(suggestion.name, suggestion);
    setShowSuggestions(false);
  };

  const handleFocus = () => {
    setShowSuggestions(true);
    if (inputValue.length >= minChars && suggestions.length === 0) {
      fetchSuggestions(inputValue);
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <span key={index} >
              {part}
            </span>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <div ref={containerRef} >
      <div >
        {icon ? (
          <div >
            {icon}
          </div>
        ) : (
          <Search  />
        )}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleFocus}
          placeholder={placeholder}
          style={{
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem"

    }} />

    }}
        />

        {isLoading && (
          <Loader  />
        )}
      </div>

      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div >
          {isLoading && suggestions.length === 0 ? (
            <div style={{
      paddingLeft: "1rem",
      paddingRight: "1rem"
    }>
              検索中...
            </div>
          ) : (
            <>
              {inputValue && suggestions.length > 0 && (
                <div style={{
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem"
    }>
                  {suggestions.length}件の候補
                </div>
              )}
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  style={{
      paddingLeft: "1rem",
      paddingRight: "1rem"
    }}
                >
                  <div style={{
      display: "flex",
      gap: "0.5rem"
    }>
                    <div >
                      {/* メイン名称 */}
                      <div >
                        {highlightMatch(suggestion.name, inputValue)}
                      </div>

                      {/* 読み情報 */}
                      {showReadings && (
                        <div style={{
      display: "flex",
      gap: "0.5rem"
    }>
                          {suggestion.nameKana && (
                            <span >
                              かな: {highlightMatch(suggestion.nameKana, inputValue)}
                            </span>
                          )}
                          {suggestion.nameRomaji && (
                            <span >
                              英字: {highlightMatch(suggestion.nameRomaji, inputValue)}
                            </span>
                          )}
                          {suggestion.nameEn && (
                            <span >
                              EN: {highlightMatch(suggestion.nameEn, inputValue)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* カテゴリバッジ */}
                    {suggestion.category && (
                      <span >
                        {suggestion.category}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {showSuggestions && !isLoading && inputValue.length >= minChars && suggestions.length === 0 && (
        <div >
          <div style={{
      paddingLeft: "1rem",
      paddingRight: "1rem"
    }>
            候補が見つかりませんでした
          </div>
        </div>
      )}
    </div>
  );
}
