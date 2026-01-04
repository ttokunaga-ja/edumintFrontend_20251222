import { Fragment } from 'react';
import type { FC, ReactNode, SyntheticEvent, FormEvent } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { HorizontalScrollSection } from '@/components/common/HorizontalScrollSection';
import ExamCardCompact, { ExamCompactItem } from '@/components/common/ExamCardCompact';
import { useUserCompleted } from '@/features/user/hooks/useUserCompleted';
import { useAuth } from '@/features/auth/hooks/useAuth';

export interface CompletedProblemsProps {}

/**
 * 学習済セクション - HorizontalScrollSectionラッパー
 */
export const CompletedProblems: FC<CompletedProblemsProps> = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, isLoading } = useUserCompleted(user?.id || '', 1, 20);

  const items = data?.exams?.map(exam => ({
    id: exam.id,
    title: exam.title,
    examType: 0,
    examYear: 2026,
    university: exam.university,
    faculty: exam.faculty,
    academicFieldName: exam.subjectName,
    subjectName: exam.subjectName,
    durationMinutes: 60,
    views: exam.views,
    likes: exam.likes,
  })) || [];

  return (
    <HorizontalScrollSection
      title="学習済"
      items={isLoading ? [] : items}
      isLoading={isLoading}
      renderItem={(exam: ExamCompactItem) => (
        <Box sx={{ minWidth: '320px', flexShrink: 0 }}>
          <ExamCardCompact
            item={exam}
            onView={(id) => console.log('View exam:', id)}
            onGood={(id) => console.log('Good exam:', id)}
          />
        </Box>
      )}
      emptyMessage="学習済みの問題があります"
      onViewAll={() => navigate('/?filter=completed')}
    />
  );
};

export default CompletedProblems;
};

export default CompletedProblems;
