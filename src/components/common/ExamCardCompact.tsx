import { Fragment } from 'react';
import type { FC, ReactNode, SyntheticEvent, FormEvent } from 'react';
import { Card, CardContent, Box, Typography, Chip, Stack, IconButton, useTheme } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import { EXAM_TYPE_COLORS, EXAM_TYPE_LABELS, ACADEMIC_FIELDS } from '@/constants/fixedVariables';

export interface ExamCompactItem {
  id: string;
  title: string;
  examType?: number; // 0: 定期試験, 1: 授業内試験, 2: 小テスト
  examTypeLabel?: string;
  examYear?: string | number;
  university?: string;
  faculty?: string;
  academicFieldType?: string; // 理系 / 文系
  academicFieldName?: string; // 試験分野
  subjectName?: string;
  durationMinutes?: number;
  views?: number;
  likes?: number;
}

/**
 * Utility to map raw problem data (from API) to ExamCompactItem
 */
export const mapProblemToCompactItem = (problem: any): ExamCompactItem => {
  // Infer examTypeLabel if missing
  const examTypeLabel = problem.examTypeLabel || (problem.examType !== undefined ? EXAM_TYPE_LABELS[problem.examType] : undefined);

  // Infer academicFieldType if missing (handle majorType and academicFieldId)
  let academicFieldType = problem.academicFieldType;
  if (!academicFieldType) {
    if (problem.majorType !== undefined) {
      // Based on exams.json: 1 is Science, 2 is Humanities
      academicFieldType = problem.majorType === 1 ? '理系' : '文系';
    } else if (problem.academicFieldId !== undefined) {
      // Based on fixedVariables: 0 is science, 1 is humanities
      academicFieldType = ACADEMIC_FIELDS[problem.academicFieldId] === 'science' ? '理系' : '文系';
    }
  }

  return {
    id: problem.id,
    title: problem.title || problem.examName || '',
    examType: problem.examType,
    examTypeLabel,
    examYear: problem.examYear,
    university: problem.university || problem.universityName,
    faculty: problem.faculty || problem.facultyName,
    academicFieldType,
    academicFieldName: problem.academicFieldName || problem.academicField,
    subjectName: problem.subjectName || problem.subject || '',
    durationMinutes: problem.durationMinutes,
    views: problem.views ?? (problem.viewCount !== undefined ? problem.viewCount : 312), // Fallback for mock data consistency
    likes: problem.likes ?? (problem.goodCount !== undefined ? problem.goodCount : 84), // Fallback for mock data consistency
  };
};

export interface ExamCardCompactProps {
  item: ExamCompactItem;
  onView?: (id: string) => void;
  onGood?: (id: string) => void;
}

export const ExamCardCompact: FC<ExamCardCompactProps> = ({ item, onView, onGood }) => {
  const theme = useTheme();
  const handleView = () => onView?.(item.id);
  const handleGood = () => onGood?.(item.id);

  // Resolve exam type color: prefer numeric `examType`, otherwise try to infer from `examTypeLabel`
  // Use canonical `EXAM_TYPE_LABELS` from constants

  const getExamTypeColor = () => {
    // direct numeric mapping
    if (typeof item.examType === 'number' && EXAM_TYPE_COLORS[item.examType]) {
      return EXAM_TYPE_COLORS[item.examType];
    }

    // try to infer from label (Japanese labels from ExamMetaSection)
    if (item.examTypeLabel) {
      const found = (Object.entries(EXAM_TYPE_LABELS) as Array<[string, string]>).find(([, label]) => label === item.examTypeLabel);
      if (found) {
        const key = Number(found[0]);
        return EXAM_TYPE_COLORS[key] ?? null;
      }
    }

    return null;
  };

  const examTypeColor = getExamTypeColor();

  return (
    <Card
      onClick={handleView}
      sx={{
        height: '100%',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-start', alignItems: 'center', mb: 1 }}>
          {/* チップ順: 試験種別, 年, 大学 */}
          {item.examTypeLabel && (
            <Chip
              label={item.examTypeLabel}
              size="small"
              sx={{
                ...(examTypeColor && {
                  backgroundColor: examTypeColor.bg,
                  color: examTypeColor.text,
                  fontWeight: 600,
                }),
              }}
            />
          )}
          {item.examYear && (
            <Chip
              label={String(item.examYear)}
              size="small"
              variant="outlined"
              sx={{ backgroundColor: (t) => t.palette.action.hover }}
            />
          )}
          {item.university && (
            <Chip
              label={item.university}
              size="small"
              variant="outlined"
              sx={{ backgroundColor: (t) => t.palette.action.hover }}
            />
          )}
        </Stack>

        {/* タイトル 大きく 太字 中央揃え */}
        <Box sx={{ textAlign: 'center', my: 1, width: '100%' }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              lineHeight: 1.2,
              display: 'block',
              width: '100%',
              textAlign: 'center'
            }}
          >
            {item.title}
          </Typography>
        </Box>

        {/* 学問系統、学問分野をチップで表示 */}
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-start', alignItems: 'center', mt: 0.5 }}>
          {item.academicFieldType && (
            <Chip
              label={item.academicFieldType}
              size="small"
              variant="outlined"
              sx={{ backgroundColor: (t) => t.palette.action.hover }}
            />
          )}
          {item.academicFieldName && (
            <Chip
              label={item.academicFieldName}
              size="small"
              variant="outlined"
              sx={{ backgroundColor: (t) => t.palette.action.hover }}
            />
          )}
        </Stack>

        {/* 科目名、所要時間をチップで表示 */}
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-start', alignItems: 'center', mt: 0.5 }}>
          {item.subjectName && (
            <Chip
              label={item.subjectName}
              size="small"
              sx={{ backgroundColor: (t) => t.palette.action.hover }}
            />
          )}
          {item.durationMinutes != null && (
            <Chip
              label={`${item.durationMinutes}分`}
              size="small"
              variant="outlined"
              sx={{ backgroundColor: (t) => t.palette.action.hover }}
            />
          )}
        </Stack>
      </CardContent>

      {/* Footer: Good + count (left aligned), VIEW count next to it */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', px: 2, pb: 1, gap: 2 }}>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <IconButton
            aria-label="good"
            size="small"
            onClick={(e) => { e.stopPropagation(); handleGood(); }}
            sx={{ color: 'text.secondary' }}
          >
            <ThumbUpOffAltIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <Typography variant="caption" color="text.secondary">{item.likes ?? 0}</Typography>
        </Stack>

        <Stack direction="row" spacing={0.5} alignItems="center">
          <VisibilityIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">{item.views ?? 0}</Typography>
        </Stack>
      </Box>
    </Card>
  );
};

export default ExamCardCompact;
