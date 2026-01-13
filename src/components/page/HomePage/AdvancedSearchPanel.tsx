import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Stack,
  Button,
  Typography,
  Chip,
  Grid,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AutocompleteFilterField,
  SelectFilterField,
  CheckboxGroupField,
  YearInputField,
} from '../../common/SearchFilterFields';
import {
  CUSTOM_SEARCH_OPTIONS,
} from '@/features/ui/selectionOptions';
import {
  LEVEL_ENUM_OPTIONS,
  QUESTION_TYPE_OPTIONS,
  DURATION_ENUM_OPTIONS,
  PERIOD_ENUM_OPTIONS,
  LANGUAGE_ENUM_OPTIONS,
  EXAM_TYPE_ENUM_OPTIONS,
  ACADEMIC_FIELD_ENUM_OPTIONS,
  ACADEMIC_TRACK_ENUM_OPTIONS,
  getEnumLabelKey,
} from '@/lib/enums/enumHelpers';
import DEFAULT_ENUM_MAPPINGS from '@/lib/enums/enumMappings';

export interface SearchFilters {
  keyword?: string;
  universities?: string[];
  faculties?: string[];
  academic_field?: number; // Numeric ID from enums
  professor?: string;
  year?: string;
  fieldType?: string;
  level?: number[];
  questionType?: number[];
  language?: number;
  period?: number;
  duration?: number;
  examType?: number;
  academicSystem?: number; // Numeric ID (isCivil etc)
  sortBy?: string;
  isLearned?: boolean;
  isHighRating?: boolean;
  isCommented?: boolean;
  isPosted?: boolean;
}

export interface AdvancedSearchPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  isOpen?: boolean;
  disabled?: boolean;
  userProfile?: {
    university?: string;
    faculty?: string;
    academic_field?: string;
    academicSystem?: 'liberal-arts' | 'science';
    language?: 'ja' | 'en' | 'zh' | 'ko' | 'other';
  };
}

// マスターデータ
const UNIVERSITIES = [
  '東京大学',
  '京都大学',
  '大阪大学',
  '東北大学',
  '慶應義塾大学',
  '早稲田大学',
  '岡山大学',
  '北海道大学',
];

const FACULTIES = [
  '工学部',
  '理学部',
  '医学部',
  '文学部',
  '経済学部',
  '法学部',
  '教育学部',
  '農学部',
];

const ACADEMIC_SYSTEMS = ACADEMIC_TRACK_ENUM_OPTIONS;
const ACADEMIC_FIELDS = ACADEMIC_FIELD_ENUM_OPTIONS;

// Custom search options moved to i18n and selectionOptions.ts - use CUSTOM_SEARCH_CONST

const SUBJECTS = [
  '数学',
  '物理',
  '化学',
  '生物',
  '英語',
  '国語',
  '地理',
  '歴史',
  '情報',
];

const FIELDS = [
  '微分積分',
  '線形代数',
  '力学',
  '電磁気学',
  '有機化学',
  '無機化学',
  '細胞生物学',
  'アルゴリズム',
];

// LEVEL_ENUM_OPTIONS imported from enumHelpers.ts (authoritative source from enumMappings.ts)

// EXAM_TYPE_ENUM_OPTIONS imported from enumHelpers.ts (authoritative source from enumMappings.ts)



// DURATION_ENUM_OPTIONS imported from enumHelpers.ts (authoritative source from enumMappings.ts)

// QUESTION_TYPE_OPTIONS imported from enumHelpers.ts (authoritative source from enumMappings.ts)

// PERIOD_ENUM_OPTIONS imported from enumHelpers.ts (authoritative source from enumMappings.ts)

// LANGUAGE_ENUM_OPTIONS imported from enumHelpers.ts (authoritative source from enumMappings.ts)

const CURRENT_YEARS = ['2025', '2024', '2023', '2022', '2021'];

/**
 * HomePage の詳細検索パネル
 * 大学、学部、科目、教授、試験年度、分野、レベル、問題形式、期間などのフィルターを提供する
 */
export function AdvancedSearchPanel({
  filters,
  onFiltersChange,
  isOpen = false,
  disabled = false,
  userProfile,
}: AdvancedSearchPanelProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(isOpen);

  // デフォルト値を決定する関数
  const getDefaultYear = (): string => {
    return (new Date().getFullYear() - 1).toString();
  };

  // ローカル状態管理（プロフィール値がある場合はデフォルトに設定）
  const [localFilters, setLocalFilters] = useState<SearchFilters>(() => {
    // プロフィール値を優先的に使用（ユーザーが明示的に変更しない限り）
    return {
      ...filters,
      universities: filters.universities && filters.universities.length > 0
        ? filters.universities
        : (userProfile?.university ? [userProfile.university] : []),
      faculties: filters.faculties && filters.faculties.length > 0
        ? filters.faculties
        : (userProfile?.faculty ? [userProfile.faculty] : []),
      academic_field: typeof filters.academic_field === 'string' ? parseInt(filters.academic_field) : filters.academic_field,
      year: filters.year || getDefaultYear(),
      level: (filters.level && Array.isArray(filters.level) ? filters.level : (filters.level ? [filters.level] : [])) as number[],

      // 問題形式（UIから選択可能にする）数値型を保持
      questionType: Array.isArray(filters.questionType)
        ? filters.questionType.map(q => typeof q === 'string' ? parseInt(q) : q)
        : (filters.questionType ? [filters.questionType] : []) as number[],

      period: typeof filters.period === 'string' ? parseInt(filters.period) : filters.period,
      duration: typeof filters.duration === 'string' ? parseInt(filters.duration) : filters.duration,
      examType: typeof filters.examType === 'string' ? parseInt(filters.examType) : filters.examType,
      academicSystem: typeof filters.academicSystem === 'string' ? parseInt(filters.academicSystem) : filters.academicSystem,
      language: typeof filters.language === 'string' ? parseInt(filters.language) : filters.language,
      professor: filters.professor || '',
      fieldType: filters.fieldType || '',
      sortBy: filters.sortBy,
      isLearned: filters.isLearned || false,
      isHighRating: filters.isHighRating || false,
      isCommented: filters.isCommented || false,
      isPosted: filters.isPosted || false,
    };
  });

  const handleFilterChange = useCallback(
    (key: keyof SearchFilters, value: string | string[] | boolean | number[]) => {
      const updated = {
        ...localFilters,
        [key]: value,
      } as SearchFilters;
      setLocalFilters(updated);
    },
    [localFilters]
  );

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleReset = () => {
    const resetFilters: SearchFilters = {
      keyword: localFilters.keyword,
      sortBy: localFilters.sortBy,
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  // 適用中のフィルターを取得
  const getActiveFilters = (): {
    label: string;
    key: keyof SearchFilters;
    value: string | string[] | number[] | boolean | number;
  }[] => {
    const active: {
      label: string;
      key: keyof SearchFilters;
      value: string | string[] | number[] | boolean | number;
    }[] = [];

    if (filters.universities && filters.universities.length > 0) {
      active.push({
        label: `${t('filters.university') || '大学'}: ${filters.universities.join(', ')}`,
        key: 'universities' as keyof SearchFilters,
        value: filters.universities,
      });
    }

    if (filters.faculties && filters.faculties.length > 0) {
      active.push({
        label: `${t('filters.faculty') || '学部'}: ${filters.faculties.join(', ')}`,
        key: 'faculties' as keyof SearchFilters,
        value: filters.faculties,
      });
    }

    if (filters.academic_field !== undefined) {
      const fieldEntry = DEFAULT_ENUM_MAPPINGS.academic_field.get(filters.academic_field);
      const fieldLabel = fieldEntry ? t(fieldEntry.i18nKey) : String(filters.academic_field);
      active.push({
        label: `${t('filters.academic_field') || '学問系統'}: ${fieldLabel}`,
        key: 'academic_field' as keyof SearchFilters,
        value: filters.academic_field,
      });
    }

    if (filters.professor) {
      active.push({
        label: `${t('filters.professor')}: ${filters.professor}`,
        key: 'professor' as keyof SearchFilters,
        value: filters.professor,
      });
    }

    if (filters.year) {
      active.push({
        label: `${t('filters.year') || '試験年度'}: ${filters.year}`,
        key: 'year' as keyof SearchFilters,
        value: filters.year,
      });
    }

    if (filters.fieldType) {
      active.push({
        label: `${t('filters.field') || '分野'}: ${filters.fieldType}`,
        key: 'fieldType' as keyof SearchFilters,
        value: filters.fieldType,
      });
    }

    if (filters.level && Array.isArray(filters.level) && filters.level.length > 0) {
      const levelLabels = filters.level.map(l => t(LEVEL_ENUM_OPTIONS.find((lv) => lv.value === l)?.labelKey || '') || `ID${l}`).join(', ');
      active.push({
        label: `${t('filters.level')}: ${levelLabels}`,
        key: 'level' as keyof SearchFilters,
        value: filters.level,
      });
    }

    if (filters.examType) {
      active.push({
        label: `${t('filters.exam_type')}: ${t(EXAM_TYPE_ENUM_OPTIONS.find(o => o.value === filters.examType)?.labelKey || '')}`,
        key: 'examType' as keyof SearchFilters,
        value: filters.examType,
      });
    }

    if (filters.academicSystem !== undefined) {
      const systemLabel = t(getEnumLabelKey('academic_track', filters.academicSystem) || '');
      active.push({
        label: `${t('filters.academic_track')}: ${systemLabel}`,
        key: 'academicSystem' as keyof SearchFilters,
        value: filters.academicSystem,
      });
    }

    if (filters.questionType && filters.questionType.length > 0) {
      const labels = filters.questionType
        .map(f => {
          const opt = QUESTION_TYPE_OPTIONS.find(p =>
            typeof p.value === 'number' && typeof f === 'number'
              ? p.value === f
              : String(p.value) === String(f)
          );
          return t(opt?.labelKey || '');
        })
        .join(', ');
      active.push({
        label: `${t('filters.questionType')}: ${labels}`,
        key: 'questionType' as keyof SearchFilters,
        value: filters.questionType,
      });
    }


    if (filters.period) {
      const periodLabel = t(PERIOD_ENUM_OPTIONS.find((p) => p.value === filters.period)?.labelKey || '');
      active.push({
        label: `${t('filters.update_period')}: ${periodLabel}`,
        key: 'period' as keyof SearchFilters,
        value: filters.period,
      });
    }

    if (filters.duration) {
      const durationLabel = t(DURATION_ENUM_OPTIONS.find((d) => d.value === filters.duration)?.labelKey || '');
      active.push({
        label: `${t('filters.duration')}: ${durationLabel}`,
        key: 'duration' as keyof SearchFilters,
        value: filters.duration,
      });
    }

    if (filters.isLearned) {
      active.push({
        label: t('filters.custom.learned'),
        key: 'isLearned' as keyof SearchFilters,
        value: true,
      });
    }

    if (filters.isHighRating) {
      active.push({
        label: t('filters.custom.high_rating'),
        key: 'isHighRating' as keyof SearchFilters,
        value: true,
      });
    }

    if (filters.isCommented) {
      active.push({
        label: t('filters.custom.commented'),
        key: 'isCommented' as keyof SearchFilters,
        value: true,
      });
    }

    if (filters.isPosted) {
      active.push({
        label: t('filters.custom.posted'),
        key: 'isPosted' as keyof SearchFilters,
        value: true,
      });
    }

    if (filters.language !== undefined) {
      const langLabel = t(getEnumLabelKey('language', filters.language) || '');
      active.push({
        label: `${t('filters.language') || '言語'}: ${langLabel}`,
        key: 'language' as keyof SearchFilters,
        value: filters.language,
      });
    }

    return active;
  };

  const activeFilters = getActiveFilters();

  const handleRemoveFilter = (key: keyof SearchFilters) => {
    const updated = { ...filters };
    delete updated[key];
    onFiltersChange(updated);
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* 詳細検索アコーディオン */}
      <Accordion
        expanded={expanded}
        onChange={() => setExpanded(!expanded)}
        disabled={disabled}
        sx={{
          '&.Mui-disabled': {
            backgroundColor: 'rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: expanded ? 'action.hover' : 'transparent',
            borderRadius: '8px',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {t('search.advanced_search')}
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <Box
            sx={{
              p: 3,
              maxHeight: '50vh',
              overflowY: 'auto',
            }}
          >
            <Stack spacing={3}>
              {/* Row 1: 大学 | 学部 */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <AutocompleteFilterField
                    label="大学"
                    options={UNIVERSITIES}
                    value={localFilters.universities || []}
                    multiple={true}
                    onChange={(value) => handleFilterChange('universities', value)}
                    placeholder="選択または入力"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <AutocompleteFilterField
                    label="学部"
                    options={FACULTIES}
                    value={localFilters.faculties || []}
                    multiple={true}
                    onChange={(value) => handleFilterChange('faculties', value)}
                    placeholder="選択または入力"
                  />
                </Grid>
              </Grid>

              {/* Row 2: 学問分野 | 教授 */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <SelectFilterField
                    label={t('filters.academic_field')}
                    options={ACADEMIC_FIELDS.map(o => ({ value: o.value, label: t(o.labelKey) }))}
                    value={localFilters.academic_field ?? ''}
                    onChange={(value) => handleFilterChange('academic_field', Number(value))}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <AutocompleteFilterField
                    label={t('filters.professor')}
                    options={[]}
                    value={localFilters.professor || ''}
                    multiple={false}
                    onChange={(value) => handleFilterChange('professor', typeof value === 'string' ? value : value[0] || '')}
                    placeholder={t('filters.professor_placeholder')}
                  />
                </Grid>
              </Grid>

              {/* Row 3: 試験年度 | 試験種別 */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <YearInputField
                    label="試験年度"
                    value={localFilters.year || ''}
                    defaultValue={getDefaultYear()}
                    onChange={(value) => handleFilterChange('year', value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectFilterField
                    label={t('filters.exam_type')}
                    options={EXAM_TYPE_ENUM_OPTIONS.map(o => ({ value: o.value, label: t(o.labelKey) }))}
                    value={localFilters.examType ?? ''}
                    onChange={(value) => handleFilterChange('examType', Number(value))}
                  />
                </Grid>
              </Grid>

              {/* Row 4: 難易度 (Full width, checkbox format) */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  {t('filters.level')}
                </Typography>
                <CheckboxGroupField
                  options={LEVEL_ENUM_OPTIONS.map(l => t(l.labelKey))}
                  value={
                    localFilters.level && Array.isArray(localFilters.level)
                      ? localFilters.level.map((lv: number) => t(LEVEL_ENUM_OPTIONS.find(l => l.value === lv)?.labelKey || '') || `ID${lv}`).filter(Boolean)
                      : []
                  }
                  onChange={(selectedLabels) => {
                    const values = selectedLabels.map(label => LEVEL_ENUM_OPTIONS.find(l => t(l.labelKey) === label)?.value).filter((v): v is number => v !== undefined);
                    handleFilterChange('level', values);
                  }}
                  columns={{ xs: 12, sm: 6, md: 4 }}
                />
              </Box>

              {/* Row 5: 問題形式 (CheckboxGroup) */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  {t('filters.questionType')}
                </Typography>
                <CheckboxGroupField
                  options={QUESTION_TYPE_OPTIONS.map(f => t(f.labelKey))}
                  value={
                    localFilters.questionType && Array.isArray(localFilters.questionType)
                      ? localFilters.questionType.map((qType: number) => {
                        // Convert value (number or string) to label
                        const option = QUESTION_TYPE_OPTIONS.find(f => f.value === qType);
                        return option ? t(option.labelKey) : '';
                      }).filter(Boolean)
                      : []
                  }
                  onChange={(selectedLabels) => {
                    // selectedLabels are labels, map back to values (which are numbers)
                    const values = selectedLabels
                      .map(lbl => QUESTION_TYPE_OPTIONS.find(f => t(f.labelKey) === lbl)?.value)
                      .filter((v): v is number => v !== undefined);
                    handleFilterChange('questionType', values);
                  }}
                  columns={{ xs: 12, sm: 6, md: 4 }}
                />
              </Box>


              {/* Row 6: 更新日時 | 所要時間 */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <SelectFilterField
                    label={t('filters.update_period')}
                    options={PERIOD_ENUM_OPTIONS.map(o => ({ value: o.value, label: t(o.labelKey) }))}
                    value={localFilters.period || ''}
                    onChange={(value) => handleFilterChange('period', value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectFilterField
                    label={t('filters.duration')}
                    options={DURATION_ENUM_OPTIONS.map(o => ({ value: o.value, label: t(o.labelKey) }))}
                    value={localFilters.duration || ''}
                    onChange={(value) => handleFilterChange('duration', value)}
                  />
                </Grid>
              </Grid>

              {/* Row 7: 学問系統（文系・理系） | 言語 */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <SelectFilterField
                    label={t('filters.academic_track')}
                    options={ACADEMIC_SYSTEMS.map(a => ({ value: a.value, label: t(a.labelKey) }))}
                    value={localFilters.academicSystem ?? ''}
                    onChange={(value) => handleFilterChange('academicSystem', Number(value))}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SelectFilterField
                    label="言語"
                    options={LANGUAGE_ENUM_OPTIONS.map(o => ({ value: o.value, label: t(o.labelKey) }))}
                    value={localFilters.language ?? ''}
                    onChange={(value) => handleFilterChange('language', Number(value))}
                  />
                </Grid>
              </Grid>

              {/* Row 8: Custom Search (Full width, checkbox format) */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  {t('filters.custom.title')}
                </Typography>
                <CheckboxGroupField
                  options={CUSTOM_SEARCH_OPTIONS.map(o => t(o.labelKey))}
                  value={[
                    ...(localFilters.isLearned ? [t('filters.custom.learned')] : []),
                    ...(localFilters.isHighRating ? [t('filters.custom.high_rating')] : []),
                    ...(localFilters.isCommented ? [t('filters.custom.commented')] : []),
                    ...(localFilters.isPosted ? [t('filters.custom.posted')] : []),
                  ]}
                  onChange={(values: string[]) => {
                    handleFilterChange('isLearned', values.includes(t('filters.custom.learned')));
                    handleFilterChange('isHighRating', values.includes(t('filters.custom.high_rating')));
                    handleFilterChange('isCommented', values.includes(t('filters.custom.commented')));
                    handleFilterChange('isPosted', values.includes(t('filters.custom.posted')));
                  }}
                  columns={{ xs: 6, sm: 3, md: 3 }}
                />
              </Box>

              {/* ボタンセクション */}
              <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleApplyFilters}
                  disabled={disabled}
                  sx={{ minWidth: 120 }}
                >
                  {t('common.search')}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleReset}
                  disabled={disabled}
                  sx={{ minWidth: 120 }}
                >
                  リセット
                </Button>
              </Stack>
            </Stack>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* 適用中のフィルター表示エリア */}
      {activeFilters.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ display: 'block', mb: 1, color: 'text.secondary' }}>
            適用中のフィルター:
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {activeFilters.map((filter) => (
              <Chip
                key={`${filter.key}-${JSON.stringify(filter.value)}`}
                label={filter.label}
                onDelete={() => handleRemoveFilter(filter.key)}
                variant="outlined"
                size="small"
              />
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}
