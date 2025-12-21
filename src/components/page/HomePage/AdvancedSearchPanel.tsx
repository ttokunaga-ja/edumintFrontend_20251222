// @ts-nocheck
import { useState } from 'react';
import { ChevronDown, ChevronUp, X, Calendar } from 'lucide-react';
import { Button } from '@/components/primitives/button';
import { Input } from '@/components/primitives/input';
import { Label } from '@/components/primitives/label';
import { Badge } from '@/components/primitives/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/primitives/select';
import { MultilingualAutocomplete } from '@/components/common/MultilingualAutocomplete';
import type { SearchFilters } from '@/features/search/models';
import type { HealthStatus } from '@/types/health';

export interface AdvancedSearchPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  defaultUniversity?: string;
  defaultFaculty?: string;
  /** Search service health status - disables panel when not operational */
  searchStatus?: HealthStatus;
  /** Whether panel is initially expanded */
  initialExpanded?: boolean;
}

/**
 * AdvancedSearchPanel Component
 * 
 * Complete search filter panel with 10 filter types:
 * 1. University (text → autocomplete)
 * 2. Faculty (text → autocomplete, filtered by university)
 * 3. Subject (text → autocomplete)
 * 4. Teacher (text → autocomplete)
 * 5. Exam Year (number input + suggestions)
 * 6. Field (理系/文系 dropdown)
 * 7. Level (基礎/標準/応用/難関 dropdown)
 * 8. Problem Format (multiple checkboxes)
 * 9. Period (today/week/month/year/custom dropdown)
 * 10. Duration (5min/10min/30min/1h/other dropdown)
 * 
 * Features:
 * - Integrates with useServiceHealth via searchStatus prop
 * - Disables all inputs when search service is not operational
 * - All text inputs use MultilingualAutocomplete + suggestReadings
 * - Defaults to user's university/faculty if provided
 * - Active filter count badge
 * - Clear all filters button
 * - Responsive grid layout (1→2 cols mobile→desktop)
 * 
 * @example
 * <AdvancedSearchPanel
 *   filters={filters}
 *   onFiltersChange={setFilters}
 *   defaultUniversity="東京大学"
 *   defaultFaculty="工学部"
 *   searchStatus={health.search}
 * />
 */
export default function AdvancedSearchPanel({
  filters,
  onFiltersChange,
  defaultUniversity,
  defaultFaculty,
  searchStatus = 'operational',
  initialExpanded = false,
}: AdvancedSearchPanelProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [selectedFormats, setSelectedFormats] = useState<number[]>(filters.formats || []);

  // Disable panel when search service is not operational
  const isDisabled = searchStatus !== 'operational';

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilter = (key: keyof SearchFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      sortBy: filters.sortBy || 'recommended',
      page: 1,
    });
    setSelectedFormats([]);
  };

  // Count active filters (exclude sortBy, page, limit)
  const activeFilterCount = Object.keys(filters).filter(
    (key) => key !== 'sortBy' && key !== 'page' && key !== 'limit' && filters[key as keyof SearchFilters] !== undefined
  ).length;

  // Problem format options
  const problemFormats = [
    { id: 1, label: '記述式' },
    { id: 2, label: '選択式' },
    { id: 3, label: '穴埋め式' },
    { id: 4, label: '正誤判定' },
    { id: 5, label: '数値計算式' },
    { id: 6, label: '証明問題' },
    { id: 7, label: 'プログラミング' },
    { id: 8, label: 'コード読解' },
  ];

  const toggleFormat = (formatId: number) => {
    const newFormats = selectedFormats.includes(formatId)
      ? selectedFormats.filter(id => id !== formatId)
      : [...selectedFormats, formatId];
    setSelectedFormats(newFormats);
    updateFilter('formats', newFormats.length > 0 ? newFormats : undefined);
  };

  // Current year for exam year suggestions
  const currentYear = new Date().getFullYear();
  const recentYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium">検索条件</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount}件の条件</Badge>
          )}
          {isDisabled && (
            <Badge variant="error">検索機能停止中</Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              disabled={isDisabled}
              className="text-gray-500 hover:text-gray-700"
            >
              すべてクリア
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1"
          >
            <span>{isExpanded ? '検索条件を隠す' : '検索条件を表示'}</span>
            {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
        </div>
      </div>

      {/* すべての検索条件（折りたたみ） */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Row 1: University, Faculty, Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 大学 */}
            <div className="space-y-2">
              <Label htmlFor="university">大学</Label>
              <div className="relative">
                <MultilingualAutocomplete
                  value={filters.universityName || defaultUniversity || ''}
                  onChange={(value, item) => {
                    updateFilter('universityName', value || undefined);
                    if (item) {
                      updateFilter('universityId', parseInt(item.id));
                    }
                  }}
                  placeholder="大学名を入力..."
                  category="university"
                  className={isDisabled ? 'opacity-50 pointer-events-none' : ''}
                />
                {filters.universityName && !isDisabled && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 size-6 p-0 z-10"
                    onClick={() => {
                      clearFilter('universityId');
                      clearFilter('universityName');
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* 学部 */}
            <div className="space-y-2">
              <Label htmlFor="faculty">学部</Label>
              <div className="relative">
                <MultilingualAutocomplete
                  value={filters.facultyName || defaultFaculty || ''}
                  onChange={(value, item) => {
                    updateFilter('facultyName', value || undefined);
                    if (item) {
                      updateFilter('facultyId', parseInt(item.id));
                    }
                  }}
                  placeholder="学部名を入力..."
                  category="faculty"
                  className={isDisabled ? 'opacity-50 pointer-events-none' : ''}
                />
                {filters.facultyName && !isDisabled && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 size-6 p-0 z-10"
                    onClick={() => {
                      clearFilter('facultyId');
                      clearFilter('facultyName');
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* 科目 */}
            <div className="space-y-2">
              <Label htmlFor="subject">科目</Label>
              <div className="relative">
                <MultilingualAutocomplete
                  value={filters.subjectName || ''}
                  onChange={(value, item) => {
                    updateFilter('subjectName', value || undefined);
                    if (item) {
                      updateFilter('subjectId', item.id);
                    }
                  }}
                  placeholder="科目名を入力..."
                  category="subject"
                  className={isDisabled ? 'opacity-50 pointer-events-none' : ''}
                />
                {filters.subjectName && !isDisabled && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 size-6 p-0 z-10"
                    onClick={() => {
                      clearFilter('subjectId');
                      clearFilter('subjectName');
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Teacher, Exam Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 教授 */}
            <div className="space-y-2">
              <Label htmlFor="teacher">教授</Label>
              <div className="relative">
                <MultilingualAutocomplete
                  value={filters.teacherName || ''}
                  onChange={(value, item) => {
                    updateFilter('teacherName', value || undefined);
                    if (item) {
                      updateFilter('teacherId', parseInt(item.id));
                    }
                  }}
                  placeholder="教授名を入力..."
                  category="teacher"
                  className={isDisabled ? 'opacity-50 pointer-events-none' : ''}
                />
                {filters.teacherName && !isDisabled && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 size-6 p-0 z-10"
                    onClick={() => {
                      clearFilter('teacherId');
                      clearFilter('teacherName');
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* 試験年度 */}
            <div className="space-y-2">
              <Label htmlFor="examYear">試験年度</Label>
              <div className="space-y-2">
                <Input
                  type="number"
                  id="examYear"
                  value={filters.examYear || ''}
                  onChange={(e) => updateFilter('examYear', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder={`例: ${currentYear}`}
                  min="2000"
                  max={currentYear}
                  disabled={isDisabled}
                  className="w-full"
                />
                <div className="flex flex-wrap gap-2">
                  {recentYears.map(year => (
                    <Badge
                      key={year}
                      variant={filters.examYear === year ? 'default' : 'outline'}
                      className={`cursor-pointer ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}
                      onClick={() => !isDisabled && updateFilter('examYear', year)}
                    >
                      {year}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Field (理系/文系) */}
          <div className="space-y-2">
            <Label>分野</Label>
            <Select
              value={filters.majorType !== undefined ? String(filters.majorType) : undefined}
              onValueChange={(value) => updateFilter('majorType', value === 'clear' ? undefined : parseInt(value))}
              disabled={isDisabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="分野を選択..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clear">すべて</SelectItem>
                <SelectItem value="0">理系</SelectItem>
                <SelectItem value="1">文系</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Row 4: Level (難易度) */}
          <div className="space-y-2">
            <Label>レベル</Label>
            <Select
              value={filters.difficulty !== undefined ? String(filters.difficulty) : undefined}
              onValueChange={(value) => updateFilter('difficulty', value === 'clear' ? undefined : parseInt(value))}
              disabled={isDisabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="レベルを選択..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clear">すべて</SelectItem>
                <SelectItem value="1">基礎</SelectItem>
                <SelectItem value="2">標準</SelectItem>
                <SelectItem value="3">応用</SelectItem>
                <SelectItem value="5">難関</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Row 5: Problem Format (問題形式) */}
          <div className="space-y-2">
            <Label>問題形式</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {problemFormats.map(format => (
                <label
                  key={format.id}
                  className={`flex items-center space-x-2 p-2 border rounded cursor-pointer transition-colors ${selectedFormats.includes(format.id)
                      ? 'bg-indigo-50 border-indigo-500'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                    } ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedFormats.includes(format.id)}
                    onChange={() => toggleFormat(format.id)}
                    disabled={isDisabled}
                    className="rounded"
                  />
                  <span className="text-sm">{format.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Row 6: Period (期間) */}
          <div className="space-y-2">
            <Label>期間</Label>
            <Select
              value={filters.period || undefined}
              onValueChange={(value) => updateFilter('period', value === 'clear' ? undefined : value)}
              disabled={isDisabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="期間を選択..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clear">すべて</SelectItem>
                <SelectItem value="today">今日</SelectItem>
                <SelectItem value="week">今週</SelectItem>
                <SelectItem value="month">今月</SelectItem>
                <SelectItem value="year">今年</SelectItem>
                <SelectItem value="custom">任意期間</SelectItem>
              </SelectContent>
            </Select>
            {/* Custom date picker (only show when 'custom' is selected) */}
            {filters.period === 'custom' && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="space-y-1">
                  <Label className="text-xs">開始日</Label>
                  <Input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => updateFilter('startDate', e.target.value || undefined)}
                    disabled={isDisabled}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">終了日</Label>
                  <Input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => updateFilter('endDate', e.target.value || undefined)}
                    disabled={isDisabled}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Row 7: Duration (所要時間) */}
          <div className="space-y-2">
            <Label>所要時間</Label>
            <Select
              value={filters.duration !== undefined ? String(filters.duration) : undefined}
              onValueChange={(value) => updateFilter('duration', value === 'clear' ? undefined : parseInt(value))}
              disabled={isDisabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="所要時間を選択..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clear">すべて</SelectItem>
                <SelectItem value="5">5分</SelectItem>
                <SelectItem value="10">10分</SelectItem>
                <SelectItem value="30">30分</SelectItem>
                <SelectItem value="60">1時間</SelectItem>
                <SelectItem value="0">その他</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* アクティブなフィルターのチップ表示 */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-500">適用中:</span>
              {Object.entries(filters).map(([key, value]) => {
                if (key === 'sortBy' || key === 'page' || key === 'limit' || value === undefined) return null;

                let displayValue = String(value);
                if (key === 'majorType') displayValue = value === 0 ? '理系' : '文系';
                if (key === 'difficulty') {
                  const levels: Record<number, string> = { 1: '基礎', 2: '標準', 3: '応用', 5: '難関' };
                  displayValue = levels[value as number] || String(value);
                }
                if (key === 'formats') displayValue = `${(value as number[]).length}種類`;

                return (
                  <Badge key={key} variant="secondary" className="flex items-center space-x-1">
                    <span className="text-xs">{displayValue}</span>
                    <button
                      onClick={() => clearFilter(key as keyof SearchFilters)}
                      className="ml-1 hover:text-red-600"
                      disabled={isDisabled}
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { AdvancedSearchPanel };
