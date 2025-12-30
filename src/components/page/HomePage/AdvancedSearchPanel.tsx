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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useState } from 'react';

export interface SearchFilters {
  keyword?: string;
  universities?: string[];
  faculties?: string[];
  subjects?: string[];
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

/**
 * HomePage の詳細検索パネル
 * 科目、難易度、タグ、大学名などのフィルターを提供する
 */
export function AdvancedSearchPanel({
  filters,
  onFiltersChange,
  isOpen = false,
}: AdvancedSearchPanelProps) {
  const [expanded, setExpanded] = useState(isOpen);

  const handleFilterChange = (key: keyof SearchFilters, value: string | string[]) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleReset = () => {
    onFiltersChange({
      keyword: filters.keyword,
      sortBy: filters.sortBy,
    });
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
            <Stack spacing={2}>
              {/* 科目 */}
              <FormControl fullWidth>
                <InputLabel>科目</InputLabel>
                <Select
                  multiple
                  label="科目"
                  value={filters.subjects || []}
                  onChange={(e) => handleFilterChange('subjects', e.target.value as string[])}
                >
                  <MenuItem value="math">数学</MenuItem>
                  <MenuItem value="physics">物理</MenuItem>
                  <MenuItem value="chemistry">化学</MenuItem>
                  <MenuItem value="biology">生物</MenuItem>
                  <MenuItem value="english">英語</MenuItem>
                  <MenuItem value="history">歴史</MenuItem>
                  <MenuItem value="geography">地理</MenuItem>
                  <MenuItem value="japanese">国語</MenuItem>
                </Select>
              </FormControl>

              {/* 難易度 */}
              <FormControl fullWidth>
                <InputLabel>難易度</InputLabel>
                <Select
                  label="難易度"
                  value={filters.level || ''}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                >
                  <MenuItem value="">全て</MenuItem>
                  <MenuItem value="basic">基礎</MenuItem>
                  <MenuItem value="standard">標準</MenuItem>
                  <MenuItem value="advanced">応用</MenuItem>
                  <MenuItem value="expert">難関</MenuItem>
                </Select>
              </FormControl>

              {/* 大学 */}
              <FormControl fullWidth>
                <InputLabel>大学</InputLabel>
                <Select
                  multiple
                  label="大学"
                  value={filters.universities || []}
                  onChange={(e) => handleFilterChange('universities', e.target.value as string[])}
                >
                  <MenuItem value="tokyo">東京大学</MenuItem>
                  <MenuItem value="kyoto">京都大学</MenuItem>
                  <MenuItem value="osaka">大阪大学</MenuItem>
                  <MenuItem value="tohoku">東北大学</MenuItem>
                  <MenuItem value="keio">慶應義塾大学</MenuItem>
                  <MenuItem value="waseda">早稲田大学</MenuItem>
                </Select>
              </FormControl>

              {/* 問題形式 */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  問題形式
                </Typography>
                <Stack spacing={1}>
                  {['記述式', '選択式', '穴埋め式', '正誤判定'].map((format) => (
                    <FormControlLabel
                      key={format}
                      control={
                        <Checkbox
                          checked={filters.formats?.includes(format) || false}
                          onChange={(e) => {
                            const newFormats = e.target.checked
                              ? [...(filters.formats || []), format]
                              : (filters.formats || []).filter((f) => f !== format);
                            handleFilterChange('formats', newFormats);
                          }}
                        />
                      }
                      label={format}
                    />
                  ))}
                </Stack>
              </Box>

              {/* リセットボタン */}
              <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
                <Button variant="outlined" onClick={handleReset}>
                  リセット
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Collapse>
    </Box>
  );
}
