import React from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '@/features/content/hooks/useContent';
import { ProblemCard } from '@/components/common/ProblemCard';
import { HorizontalScrollSection } from '@/components/common/HorizontalScrollSection';

export interface PostedProblemsProps {
  /** オプショナルなカスタマイズ用 props（拡張時に使用） */
}

/**
 * 投稿セクション
 * MyPage で「投稿」した問題を横スクロール表示する
 * ProblemCard + HorizontalScrollSection を内部で使用（再利用パターン）
 */
export const PostedProblems: React.FC<PostedProblemsProps> = () => {
  const navigate = useNavigate();

  // ユーザーの投稿問題を取得（フィルター付き）
  const { data: postedData, isLoading: isPostedLoading } = useSearch({
    keyword: '',
    page: 1,
    sortBy: 'newest',
    limit: 4,
  });

  return (
    <HorizontalScrollSection
      title="投稿"
      items={postedData?.data || []}
      isLoading={isPostedLoading}
      onViewAll={() => navigate('/home')}
      emptyMessage="問題を投稿して、コミュニティに貢献しましょう"
      renderItem={(problem) => (
        <ProblemCard
          problem={problem}
          onCardClick={() => navigate(`/exam/${problem.id}`)}
          variant="compact"
        />
      )}
    />
  );
};

export default PostedProblems;
