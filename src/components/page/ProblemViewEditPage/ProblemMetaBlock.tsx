import React from 'react';
import { Box, Typography, Stack, Grid, Divider, Paper } from '@mui/material';
import { Exam } from '@/features/content/models';
import EditIcon from '@mui/icons-material/Edit';
import Button from '@mui/material/Button';

interface ProblemMetaBlockProps {
  exam?: Exam;
  examName?: string;
  school?: string;
  universityName?: string;
  facultyName?: string;
  teacherName?: string;
  subjectName?: string;
  examYear?: number;
  examType?: number;
  level?: string;
  questionCount?: number;
  durationMinutes?: number;
  fieldType?: string;
  academicFieldName?: string;
  majorType?: number;
  canEdit?: boolean;
  onEdit?: () => void;
}

export const ProblemMetaBlock: React.FC<ProblemMetaBlockProps> = ({
  exam,
  examName: propExamName,
  school: propSchool,
  universityName: propUniversityName,
  facultyName: propFacultyName,
  teacherName: propTeacherName,
  subjectName: propSubjectName,
  examYear: propExamYear,
  examType: propExamType,
  level: propLevel,
  questionCount: propQuestionCount,
  durationMinutes: propDurationMinutes,
  fieldType: propFieldType,
  academicFieldName: propAcademicFieldName,
  majorType: propMajorType,
  canEdit = false,
  onEdit,
}) => {
  const examName = propExamName ?? exam?.examName;
  const school = propSchool ?? exam?.school;
  const universityName = propUniversityName ?? exam?.universityName;
  const facultyName = propFacultyName ?? exam?.facultyName;
  const teacherName = propTeacherName ?? exam?.teacherName;
  const subjectName = propSubjectName ?? exam?.subjectName;
  const examYear = propExamYear ?? exam?.examYear;
  const examType = propExamType ?? exam?.examType;
  const level = propLevel ?? exam?.level;
  const questionCount = propQuestionCount ?? exam?.questionCount;
  const durationMinutes = propDurationMinutes ?? exam?.durationMinutes;
  const fieldType = propFieldType ?? exam?.fieldType;
  const academicFieldName = propAcademicFieldName ?? exam?.academicFieldName;
  const majorType = propMajorType ?? exam?.majorType;
  
  // 統計情報（examオブジェクトから取得）
  const viewCount = exam?.viewCount ?? 0;
  const goodCount = exam?.goodCount ?? 0;
  const badCount = exam?.badCount ?? 0;
  const commentCount = exam?.commentCount ?? 0;

  const academicFieldLabels: Record<string, string> = {
    science: '理系',
    humanities: '文系',
  };

  const academicSystemLabels: Record<number, string> = {
    0: '理系',
    1: '文系',
  };

  const examTypeLabels: Record<number, string> = {
    0: '定期試験',
    1: '授業内試験',
    2: '小テスト',
  };

  // テキスト表示用ヘルパー
  const MetaField = ({ label, value }: { label: string; value?: string | number | boolean }) => {
    if (!value && value !== 0) return null;
    return (
      <Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {value}
        </Typography>
      </Box>
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        bgcolor: 'background.paper',
        borderRadius: 1,
        border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack spacing={3}>
        {/* セクション1: 【試験形式】タイトル、学問系統：学問分野 */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {examType !== undefined && (
                <Typography variant="caption" sx={{ 
                  backgroundColor: (theme) => {
                    switch(examType) {
                      case 0: return '#1565c0'; // 定期試験：濃青
                      case 1: return '#c62828'; // 授業内試験：濃赤
                      case 2: return '#2e7d32'; // 小テスト：濃緑
                      default: return theme.palette.action.hover;
                    }
                  },
                  color: (theme) => {
                    // テーマに応じて背景色のコントラストに最適な文字色を自動選択
                    const backgroundColor = 
                      examType === 0 ? '#1565c0' : 
                      examType === 1 ? '#c62828' : 
                      examType === 2 ? '#2e7d32' : 
                      theme.palette.background.paper;
                    return theme.palette.getContrastText(backgroundColor);
                  },
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  fontWeight: 700,
                }}>
                  【{examTypeLabels[examType] || '不明'}】
                </Typography>
              )}
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                {examName || '試験情報'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              {majorType !== undefined && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {academicSystemLabels[majorType]}
                </Typography>
              )}
              {majorType !== undefined && academicFieldName && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  :
                </Typography>
              )}
              {academicFieldName && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {academicFieldName}
                </Typography>
              )}
            </Box>
          </Box>
          {canEdit && onEdit && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              onClick={onEdit}
              sx={{ flexShrink: 0 }}
            >
              編集
            </Button>
          )}
        </Box>

        <Divider />

        {/* セクション2: 大学名、学部、教授、試験年度、科目名、所要時間 */}
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <MetaField label="大学名" value={universityName} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <MetaField label="学部" value={facultyName} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <MetaField label="教授" value={teacherName} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <MetaField label="試験年度" value={examYear} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <MetaField label="科目名" value={subjectName} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <MetaField label="所要時間" value={durationMinutes ? `${durationMinutes}分` : undefined} />
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* セクション3: 統計情報（閲覧数、高評価数、低評価数、コメント数） */}
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={6} sm={4} md={3}>
              <MetaField label="閲覧数" value={`${viewCount}回`} />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <MetaField label="高評価数" value={`${goodCount}件`} />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <MetaField label="低評価数" value={`${badCount}件`} />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <MetaField label="コメント数" value={`${commentCount}件`} />
            </Grid>
          </Grid>
        </Box>
      </Stack>
    </Paper>
  );
};
