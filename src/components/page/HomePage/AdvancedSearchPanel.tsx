// @ts-nocheck
import { useState } from 'react';
import { ChevronDown, ChevronUp, X, Calendar } from 'lucide-react';
import { Button } from '@/components/primitives/button';
import { Input } from '@/components/primitives/input';
import { Label } from '@/components/primitives/label';
import { Badge } from '@/components/primitives/badge';
import NativeSelect from '@/components/primitives/native-select';
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
    <div >
      {/* ヘッダー */}
      <div style={{
      display: "flex",
      alignItems: "center",
      paddingLeft: "1rem",
      paddingRight: "1rem"
    }>
        <div style={{
      display: "flex",
      alignItems: "center"
    }>
          <h3 >検索条件</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount}件の条件</Badge>
          )}
          {isDisabled && (
            <Badge variant="error">検索機能停止中</Badge>
          )}
        </div>
        <div style={{
      display: "flex",
      alignItems: "center"
    }>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              disabled={isDisabled}
              
            >
              すべてクリア
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
      display: "flex",
      alignItems: "center"
    }}
          >
            <span>{isExpanded ? '検索条件を隠す' : '検索条件を表示'}</span>
            {isExpanded ? <ChevronUp  /> : <ChevronDown  />}
          </Button>
        </div>
      </div>

      {/* すべての検索条件（折りたたみ） */}
      {isExpanded && (
        <div >
          {/* Row 1: University, Faculty, Subject */}
          <div >
            {/* 大学 */}
            <div >
              <Label htmlFor="university">大学</Label>
              <div >
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
                    
                    onClick={() => {
                      clearFilter('universityId');
                      clearFilter('universityName');
                    }}
                  >
                    <X  />
                  </Button>
                )}
              </div>
            </div>

            {/* 学部 */}
            <div >
              <Label htmlFor="faculty">学部</Label>
              <div >
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
                    
                    onClick={() => {
                      clearFilter('facultyId');
                      clearFilter('facultyName');
                    }}
                  >
                    <X  />
                  </Button>
                )}
              </div>
            </div>

            {/* 科目 */}
            <div >
              <Label htmlFor="subject">科目</Label>
              <div >
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
                    
                    onClick={() => {
                      clearFilter('subjectId');
                      clearFilter('subjectName');
                    }}
                  >
                    <X  />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Teacher, Exam Year */}
          <div >
            {/* 教授 */}
            <div >
              <Label htmlFor="teacher">教授</Label>
              <div >
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
                    
                    onClick={() => {
                      clearFilter('teacherId');
                      clearFilter('teacherName');
                    }}
                  >
                    <X  />
                  </Button>
                )}
              </div>
            </div>

            {/* 試験年度 */}
            <div >
              <Label htmlFor="examYear">試験年度</Label>
              <div >
                <Input
                  type="number"
                  id="examYear"
                  name="examYear"
                  value={filters.examYear || ''}
                  onChange={(e) => updateFilter('examYear', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder={`例: ${currentYear}`}
                  min="2000"
                  max={currentYear}
                  disabled={isDisabled}
                  
                />
                <div style={{
      display: "flex",
      gap: "0.5rem"
    }>
                  {recentYears.map(year => (
                    <Badge
                      key={year}
                      variant={filters.examYear === year ? 'default' : 'outline'}
                      
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
          <div >
            <Label>分野</Label>
            <NativeSelect
              value={filters.majorType !== undefined ? String(filters.majorType) : undefined}
              onChange={(value) => updateFilter('majorType', value === 'clear' ? undefined : parseInt(value))}
              disabled={isDisabled}
              items={[
                { value: 'clear', label: 'すべて' },
                { value: '0', label: '理系' },
                { value: '1', label: '文系' },
              ]}
              placeholder="分野を選択..."
            />
          </div>

          {/* Row 4: Level (難易度) */}
          <div >
            <Label>レベル</Label>
            <NativeSelect
              value={filters.difficulty !== undefined ? String(filters.difficulty) : undefined}
              onChange={(value) => updateFilter('difficulty', value === 'clear' ? undefined : parseInt(value))}
              disabled={isDisabled}
              items={[
                { value: 'clear', label: 'すべて' },
                { value: '1', label: '基礎' },
                { value: '2', label: '標準' },
                { value: '3', label: '応用' },
                { value: '5', label: '難関' },
              ]}
              placeholder="レベルを選択..."
            />
          </div>

          {/* Row 5: Problem Format (問題形式) */}
          <div >
            <Label>問題形式</Label>
            <div style={{
      gap: "0.5rem"
    }>
              {problemFormats.map(format => (
                <label
                  key={format.id}
                  
                >
                  <input
                    type="checkbox"
                    checked={selectedFormats.includes(format.id)}
                    onChange={() => toggleFormat(format.id)}
                    disabled={isDisabled}
                    name={`problem-format-${format.id}`}
                    
                  />
                  <span >{format.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Row 6: Period (期間) */}
          <div >
            <Label>期間</Label>
            <NativeSelect
              value={filters.period || undefined}
              onChange={(value) => updateFilter('period', value === 'clear' ? undefined : value)}
              disabled={isDisabled}
              items={[
                { value: 'clear', label: 'すべて' },
                { value: 'today', label: '今日' },
                { value: 'week', label: '今週' },
                { value: 'month', label: '今月' },
                { value: 'year', label: '今年' },
                { value: 'custom', label: '任意期間' },
              ]}
              placeholder="期間を選択..."
            />
            {/* Custom date picker (only show when 'custom' is selected) */}
            {filters.period === 'custom' && (
              <div style={{
      gap: "0.5rem"
    }>
                <div >
                  <Label >開始日</Label>
                  <Input
                    type="date"
                    name="period-start"
                    value={filters.startDate || ''}
                    onChange={(e) => updateFilter('startDate', e.target.value || undefined)}
                    disabled={isDisabled}
                  />
                </div>
                <div >
                  <Label >終了日</Label>
                  <Input
                    type="date"
                    name="period-end"
                    value={filters.endDate || ''}
                    onChange={(e) => updateFilter('endDate', e.target.value || undefined)}
                    disabled={isDisabled}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Row 7: Duration (所要時間) */}
          <div >
            <Label>所要時間</Label>
            <NativeSelect
              value={filters.duration !== undefined ? String(filters.duration) : undefined}
              onChange={(value) => updateFilter('duration', value === 'clear' ? undefined : parseInt(value))}
              disabled={isDisabled}
              items={[
                { value: 'clear', label: 'すべて' },
                { value: '5', label: '5分' },
                { value: '10', label: '10分' },
                { value: '30', label: '30分' },
                { value: '60', label: '1時間' },
                { value: '0', label: 'その他' },
              ]}
              placeholder="所要時間を選択..."
            />
          </div>

          {/* アクティブなフィルターのチップ表示 */}
          {activeFilterCount > 0 && (
            <div style={{
      display: "flex",
      gap: "0.5rem"
    }>
              <span >適用中:</span>
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
                  <Badge key={key} variant="secondary" style={{
      display: "flex",
      alignItems: "center"
    }>
                    <span >{displayValue}</span>
                    <button
                      onClick={() => clearFilter(key as keyof SearchFilters)}
                      
                      disabled={isDisabled}
                    >
                      <X  />
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
