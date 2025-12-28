// ========================================
// EduMint - SearchSection Component
// Storybook ID: features/search/SearchSection/*
// 📍 Alert Insertion Point A
// Grid: 16/24/32px spacing
// Max Width: max-w-3xl (768px)
// ========================================

import React, { useState } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { Input } from '@/components/primitives/input';
import { Button } from '@/components/primitives/button';
import { Badge } from '@/components/primitives/badge';
import { ContextHealthAlert } from '@/components/common/ContextHealthAlert';
import { cn } from '@/components/primitives/utils';
import type { HealthStatus } from '@/types/health';

export interface SearchSectionProps {
  /** Current search query */
  query: string;

  /** Query change handler */
  onQueryChange: (query: string) => void;

  /** Search submission handler */
  onSearch: () => void;

  /** Input placeholder text */
  placeholder?: string;

  /** Whether to show advanced search panel */
  showAdvancedSearch?: boolean;

  /** Active filter chips */
  activeFilters?: Array<{
    id: string;
    label: string;
    onRemove: () => void;
<<<<<<< HEAD
  };
=======
  }>;
>>>>>>> parent of 0a29049 (fix(jsx): add missing closing brace before > (auto))

  /** Clear all filters handler */
  onClearAll?: () => void;

  /** Search service health status */
  searchStatus?: HealthStatus;

  /** Additional CSS classes */
  className?: string;
}

/**
 * SearchSection Component
 * 
 * Main search interface with:
 * - Search input (h-12, max-w-3xl)
 * - 📍 Alert A insertion point (mt-4)
 * - Advanced search panel (collapsible)
 * - Filter chips
 * 
 * @example
 * <SearchSection
 *   query={query}
 *   onQueryChange={setQuery}
 *   onSearch={handleSearch}
 *   searchStatus={searchStatus}
 *   activeFilters={[
 *     { id: '1', label: '東京大学', onRemove: () => {} },
 *   ]}
 * />
 */
export function SearchSection({
  query,
  onQueryChange,
  onSearch,
  placeholder = '科目、大学、キーワードで検索...',
  showAdvancedSearch,
  activeFilters,
  onClearAll,
  searchStatus = 'operational',
  className,
}: SearchSectionProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(showAdvancedSearch || false);

  return (
    <div className={undefined}> {/* 24px/32px padding (grid) */}
      <div style={{
      paddingLeft: "1rem",
      paddingRight: "1rem"
    }}>
        {/* Search Input */}
        <div className={undefined}> {/* 768px max width */}
          <div style={{
      display: "flex",
      gap: "0.5rem"
    }}> {/* 8px gap (grid) */}
            <div className={undefined}>
              <Search
                className={undefined}
                aria-hidden="true"
              />
              <Input
                type="search"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                placeholder={placeholder}
                className={undefined}
                aria-label="検索キーワード"
              />
            </div>
            <Button
              onClick={onSearch}
              className={undefined}
            >
              検索
            </Button>
          </div>

          {/* 📍 Alert Insertion Point A: Search Status */}
          {/* Condition: searchStatus === 'degraded' || 'outage' */}
          {/* Max Width: max-w-3xl (same as search input) */}
          {/* Top Margin: mt-4 (16px grid) */}
          {/* Variant: C2-S2 (degraded) or C2-S4 (outage) */}
          {(searchStatus === 'degraded' || searchStatus === 'outage') && (
            <ContextHealthAlert
              category="コンテンツサービス"
              status={searchStatus}
              message={
                searchStatus === 'degraded'
                  ? '現在、検索機能に遅延が発生しています。しばらく時間をおいてから再度お試しください。'
                  : '検索機能が一時的にご利用いただけません。システム復旧後に再度お試しください。'
              }
              className={undefined} // 16px margin top (grid)
            />
          )}
        </div>

        {/* Advanced Search Toggle */}
        <div className={undefined}> {/* 16px margin (grid) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            aria-expanded={isAdvancedOpen}
            aria-controls="advanced-search-panel"
          >
            <ChevronDown
              className={undefined} />
            詳細検索
          </Button>
        </div>

        {/* Advanced Search Panel */}
        {isAdvancedOpen && (
          <div
            id="advanced-search-panel"
            className={undefined} // 24px margin (grid)
          >
            <div className={undefined}> {/* 24px padding (grid) */}
              <div className={undefined}> {/* 16px gap (grid) */}
                <div>
                  <label className={undefined}>大学</label>
                  <Input placeholder="大学名を入力..." />
                </div>
                <div>
                  <label className={undefined}>学部</label>
                  <Input placeholder="学部名を入力..." />
                </div>
                <div>
                  <label className={undefined}>科目</label>
                  <Input placeholder="科目名を入力..." />
                </div>
                <div>
                  <label className={undefined}>難易度</label>
                  <div style={{
      display: "flex",
      gap: "0.5rem"
    }}> {/* 8px gap (grid) */}
                    <Badge variant="outline" className={undefined}>Easy</Badge>
                    <Badge variant="outline" className={undefined}>Medium</Badge>
                    <Badge variant="outline" className={undefined}>Hard</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Chips */}
        {activeFilters && activeFilters.length > 0 && (
          <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }}> {/* 16px margin, 8px gap (grid) */}
            {activeFilters.map((filter) => (
              <Badge key={filter.id} variant="secondary" className={undefined}>
                {filter.label}
                <button
                  onClick={filter.onRemove}
                  className={undefined}
                  aria-label={`${filter.label}フィルターを削除`}
                >
                  <X className={undefined} />
                </button>
              </Badge>
            ))}
            {activeFilters.length > 0 && onClearAll && (
              <Button variant="ghost" size="sm" onClick={onClearAll}>
                すべてクリア
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
