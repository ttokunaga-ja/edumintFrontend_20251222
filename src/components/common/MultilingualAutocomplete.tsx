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
            <span key={index} className="bg-yellow-200 font-medium">
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
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        {icon ? (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        ) : (
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        )}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
        {isLoading && (
          <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
      </div>

      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {isLoading && suggestions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              検索中...
            </div>
          ) : (
            <>
              {inputValue && suggestions.length > 0 && (
                <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b border-gray-200">
                  {suggestions.length}件の候補
                </div>
              )}
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {/* メイン名称 */}
                      <div className="text-sm text-gray-900 font-medium mb-0.5">
                        {highlightMatch(suggestion.name, inputValue)}
                      </div>

                      {/* 読み情報 */}
                      {showReadings && (
                        <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                          {suggestion.nameKana && (
                            <span className="bg-gray-100 px-2 py-0.5 rounded">
                              かな: {highlightMatch(suggestion.nameKana, inputValue)}
                            </span>
                          )}
                          {suggestion.nameRomaji && (
                            <span className="bg-gray-100 px-2 py-0.5 rounded">
                              英字: {highlightMatch(suggestion.nameRomaji, inputValue)}
                            </span>
                          )}
                          {suggestion.nameEn && (
                            <span className="bg-gray-100 px-2 py-0.5 rounded">
                              EN: {highlightMatch(suggestion.nameEn, inputValue)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* カテゴリバッジ */}
                    {suggestion.category && (
                      <span className="flex-shrink-0 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">
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
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="px-4 py-3 text-sm text-gray-500 text-center">
            候補が見つかりませんでした
          </div>
        </div>
      )}
    </div>
  );
}
