import {
  Collapse,
  Box,
  Card,
  CardContent,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  Typography,
  Chip,
  Grid,
  Autocomplete,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useState, useCallback } from 'react';

export interface SearchFilters {
  keyword?: string;
  universities?: string[];
  faculties?: string[];
  subjects?: string[];
  professor?: string;
  year?: string;
  fieldType?: string;
  level?: string;
  formats?: string[];
  duration?: string;
  period?: string;
  sortBy?: 'recommended' | 'newest' | 'popular' | 'views';
}

export interface AdvancedSearchPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  isOpen?: boolean;
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

const LEVELS = [
  { value: 'basic', label: '基礎' },
  { value: 'standard', label: '標準' },
  { value: 'advanced', label: '応用' },
  { value: 'expert', label: '難関' },
];

const PROBLEM_FORMATS = [
  '記述式',
  '選択式',
  '穴埋め式',
  '正誤判定',
  '数値計算式',
  '証明問題',
  'プログラミング',
  'コード読解',
];

const DURATIONS = [
  { value: 'short', label: '5分以内' },
  { value: 'medium', label: '15分以内' },
  { value: 'long', label: '30分以上' },
];

const PERIODS = [
  { value: '2025', label: '2025年度' },
  { value: '2024', label: '2024年度' },
  { value: '2023', label: '2023年度' },
  { value: '2022', label: '2022年度' },
  { value: '2021', label: '2021年度' },
];

const CURRENT_YEARS = ['2025', '2024', '2023', '2022', '2021'];

/**
 * HomePage の詳細検索パネル
 * 大学、学部、科目、教授、試験年度、分野、レベル、問題形式、期間などのフィルターを提供する
 */
export function AdvancedSearchPanel({
  filters,
  onFiltersChange,
  isOpen = false,
}: AdvancedSearchPanelProps) {
  const [expanded, setExpanded] = useState(isOpen);

  // ローカル状態管理
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  const handleFilterChange = useCallback(
    (key: keyof SearchFilters, value: string | string[]) => {
      const updated = {
        ...localFilters,
        [key]: value,
      };
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
  const getActiveFilters = (): { label: string; key: keyof SearchFilters; value: string | string[] }[] => {
    const active = [];

    if (filters.universities && filters.universities.length > 0) {
      active.push({
        label: `大学: ${filters.universities.join(', ')}`,
        key: 'universities',
        value: filters.universities,
      });
    }

    if (filters.faculties && filters.faculties.length > 0) {
      active.push({
        label: `学部: ${filters.faculties.join(', ')}`,
        key: 'faculties',
        value: filters.faculties,
      });
    }

    if (filters.subjects && filters.subjects.length > 0) {
      active.push({
        label: `科目: ${filters.subjects.join(', ')}`,
        key: 'subjects',
        value: filters.subjects,
      });
    }

    if (filters.professor) {
      active.push({
        label: `教授: ${filters.professor}`,
        key: 'professor',
        value: filters.professor,
      });
    }

    if (filters.year) {
      active.push({
        label: `試験年度: ${filters.year}`,
        key: 'year',
        value: filters.year,
      });
    }

    if (filters.fieldType) {
      active.push({
        label: `分野: ${filters.fieldType}`,
        key: 'fieldType',
        value: filters.fieldType,
      });
    }

    if (filters.level) {
      const levelLabel =
        LEVELS.find((l) => l.value === filters.level)?.label || filters.level;
      active.push({
        label: `レベル: ${levelLabel}`,
        key: 'level',
        value: filters.level,
      });
    }

    if (filters.formats && filters.formats.length > 0) {
      active.push({
        label: `問題形式: ${filters.formats.join(', ')}`,
        key: 'formats',
        value: filters.formats,
      });
    }

    if (filters.period) {
      active.push({
        label: `期間: ${filters.period}`,
        key: 'period',
        value: filters.period,
      });
    }

    if (filters.duration) {
      const durationLabel =
        DURATIONS.find((d) => d.value === filters.duration)?.label || filters.duration;
      active.push({
        label: `所要時間: ${durationLabel}`,
        key: 'duration',
        value: filters.duration,
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
      {/* トグルボタン */}
      <Button
        fullWidth
        onClick={() => setExpanded(!expanded)}
        sx={{
          justifyContent: 'space-between',
          textAlign: 'left',
          mb: 2,
          py: 1.5,
          backgroundColor: expanded ? 'action.hover' : 'transparent',
        }}
        endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          詳細検索
        </Typography>
      </Button>

      {/* 詳細フィルターパネル */}
      <Collapse in={expanded}>
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Stack spacing={3}>
              {/* 大学・学部セクション */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  大学・学部
                </Typography>
                <Grid container spacing={2}>
                  {/* 大学 */}
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      multiple
                      options={UNIVERSITIES}
                      value={localFilters.universities || []}
                      onChange={(e, newValue) => handleFilterChange('universities', newValue)}
                      renderInput={(params) => (
                        <TextField {...params} label="大学" placeholder="選択または入力" />
                      )}
                    />
                  </Grid>

                  {/* 学部 */}
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      multiple
                      options={FACULTIES}
                      value={localFilters.faculties || []}
                      onChange={(e, newValue) => handleFilterChange('faculties', newValue)}
                      renderInput={(params) => (
                        <TextField {...params} label="学部" placeholder="選択または入力" />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* 科目・教授セクション */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  科目・教授
                </Typography>
                <Grid container spacing={2}>
                  {/* 科目 */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="科目"
                      placeholder="例: 微分積分, 力学"
                      value={localFilters.subjects?.join(', ') || ''}
                      onChange={(e) => {
                        const subjects = e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter((s) => s);
                        handleFilterChange('subjects', subjects);
                      }}
                    />
                  </Grid>

                  {/* 教授 */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="教授"
                      placeholder="教授名を入力"
                      value={localFilters.professor || ''}
                      onChange={(e) => handleFilterChange('professor', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* 試験年度セクション */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  試験年度
                </Typography>
                <TextField
                  fullWidth
                  label="年度を入力"
                  type="text"
                  placeholder="例: 2025"
                  value={localFilters.year || ''}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  sx={{ mb: 1.5 }}
                />
                {/* 年度チップ */}
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {CURRENT_YEARS.map((year) => (
                    <Chip
                      key={year}
                      label={year}
                      onClick={() => handleFilterChange('year', year)}
                      variant={localFilters.year === year ? 'filled' : 'outlined'}
                      color={localFilters.year === year ? 'primary' : 'default'}
                    />
                  ))}
                </Stack>
              </Box>

              {/* 分野・レベルセクション */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  分野・レベル
                </Typography>
                <Grid container spacing={2}>
                  {/* 分野 */}
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      options={FIELDS}
                      value={localFilters.fieldType || ''}
                      onChange={(e, newValue) => handleFilterChange('fieldType', newValue || '')}
                      renderInput={(params) => (
                        <TextField {...params} label="分野" placeholder="選択または入力" />
                      )}
                    />
                  </Grid>

                  {/* レベル */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>レベル</InputLabel>
                      <Select
                        label="レベル"
                        value={localFilters.level || ''}
                        onChange={(e) => handleFilterChange('level', e.target.value)}
                      >
                        <MenuItem value="">全て</MenuItem>
                        {LEVELS.map((level) => (
                          <MenuItem key={level.value} value={level.value}>
                            {level.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>

              {/* 問題形式セクション */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  問題形式
                </Typography>
                <Grid container spacing={1}>
                  {PROBLEM_FORMATS.map((format) => (
                    <Grid item xs={12} sm={6} md={4} key={format}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={localFilters.formats?.includes(format) || false}
                            onChange={(e) => {
                              const newFormats = e.target.checked
                                ? [...(localFilters.formats || []), format]
                                : (localFilters.formats || []).filter((f) => f !== format);
                              handleFilterChange('formats', newFormats);
                            }}
                          />
                        }
                        label={format}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* 期間・所要時間セクション */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  期間・所要時間
                </Typography>
                <Grid container spacing={2}>
                  {/* 期間 */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>期間</InputLabel>
                      <Select
                        label="期間"
                        value={localFilters.period || ''}
                        onChange={(e) => handleFilterChange('period', e.target.value)}
                      >
                        <MenuItem value="">全て</MenuItem>
                        {PERIODS.map((period) => (
                          <MenuItem key={period.value} value={period.value}>
                            {period.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* 所要時間 */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>所要時間</InputLabel>
                      <Select
                        label="所要時間"
                        value={localFilters.duration || ''}
                        onChange={(e) => handleFilterChange('duration', e.target.value)}
                      >
                        <MenuItem value="">全て</MenuItem>
                        {DURATIONS.map((duration) => (
                          <MenuItem key={duration.value} value={duration.value}>
                            {duration.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>

              {/* ボタンセクション */}
              <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleApplyFilters}
                  sx={{ minWidth: 120 }}
                >
                  検索
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleReset}
                  sx={{ minWidth: 120 }}
                >
                  リセット
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Collapse>

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
