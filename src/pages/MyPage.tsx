import type { SyntheticEvent } from 'react';
import {
  Container,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useAuth, useLogout } from '@/features/auth/hooks/useAuth';
import { useUserProfile } from '@/features/user/hooks/useUser';
import { useAppBarAction } from '@/contexts/AppBarActionContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ProfileHeader } from '@/components/page/MyPage/ProfileHeader';
import { ProfileEditFormData } from '@/components/page/MyPage/ProfileEditForm';
import { AccountSettingsAccordion } from '@/components/page/MyPage/AccountSettingsAccordion';
import { HorizontalScrollSection } from '@/components/common/HorizontalScrollSection';
import { useUserCompleted } from '@/features/user/hooks/useUserCompleted';
import { useUserLiked } from '@/features/user/hooks/useUserLiked';
import { useUserCommented } from '@/features/user/hooks/useUserCommented';
import { useUserProblems } from '@/features/user/hooks/useUserProblems';
import { ExamCompactItem, mapProblemToCompactItem } from '@/components/common/ExamCardCompact';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';


export function MyPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const { data: profile } = useUserProfile(user?.id || '');
  const logoutMutation = useLogout();
  const {
    setEnableAppBarActions,
    isEditMode,
    setIsEditMode,
    setHasUnsavedChanges,
    setOnSave,
  } = useAppBarAction();
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // データフェッチ（4つのセクション）
  const { data: completedData, isLoading: completedLoading } = useUserCompleted(user?.id || '', 1, 20);
  const { data: likedData, isLoading: likedLoading } = useUserLiked(user?.id || '', 1, 20);
  const { data: commentedData, isLoading: commentedLoading } = useUserCommented(user?.id || '', 1, 20);
  const { data: postedData, isLoading: postedLoading } = useUserProblems(user?.id || '', 1, 20);

  // アコーディオン展開状態
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false);

  // プロフィール編集フォーム状態
  const [editForm, setEditForm] = useState<ProfileEditFormData>({
    displayName: user?.displayName || '',
    email: user?.email || '',
    universities: profile?.university ? [profile.university] : [],
    faculties: profile?.faculty ? [profile.faculty] : [],
    academicField: profile?.field || '',
    academicSystem: undefined,
    language: profile?.language || '',
  });

  // Slug generation function (for consistency with HomePage)
  const generateSlug = useCallback((examName: string) => {
    return examName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }, []);

  const handleCardClick = (problemId: string, examName: string) => {
    const slug = generateSlug(examName);
    navigate(`/exam/${problemId}/${slug}`);
  };

  // データ変換ヘルパー関数
  const mapExamData = (exams: any[] | undefined): ExamCompactItem[] => {
    return (exams || []).map(exam => mapProblemToCompactItem(exam));
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/login');
      },
    });
  };

  const handleAccordionChange = (panel: string) => (event: SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  // TopMenuBar の Edit 切り替えと同期
  useEffect(() => {
    // プロフィール編集アコーディオンが開いている場合のみ isEditMode を監視
    if (expandedAccordion === 'profile') {
      setIsEditingProfile(isEditMode);
    }
  }, [isEditMode, expandedAccordion]);

  // Clean up AppBar context when page unmounts
  useEffect(() => {
    return () => {
      setEnableAppBarActions(false);
      setHasUnsavedChanges(false);
      setIsEditMode(false);
      setOnSave(null);
    };
  }, [setEnableAppBarActions, setHasUnsavedChanges, setIsEditMode, setOnSave]);

  if (isLoading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container>
        <Alert severity="warning" sx={{ mt: 4 }}>
          ログインしてください
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* プロフィールヘッダー */}
        <ProfileHeader
          user={user}
          onLogout={handleLogout}
          onNavigateAdmin={() => navigate('/admin')}
          isLoggingOut={logoutMutation.isPending}
        />

        {/* 学習済セクション */}
        <HorizontalScrollSection
          title={t('filters.custom.learned')}
          items={mapExamData(completedData?.exams)}
          isLoading={completedLoading}
          onViewAll={() => navigate('/?filter=completed')}
          onView={(id) => {
            const exam = completedData?.exams.find(e => e.id === id);
            handleCardClick(id, exam?.title || '');
          }}
        />

        {/* 高評価セクション */}
        <HorizontalScrollSection
          title={t('filters.custom.high_rating')}
          items={mapExamData(likedData?.exams)}
          isLoading={likedLoading}
          onViewAll={() => navigate('/?filter=liked')}
          onView={(id) => {
            const exam = likedData?.exams.find(e => e.id === id);
            handleCardClick(id, exam?.title || '');
          }}
        />

        {/* コメントセクション */}
        <HorizontalScrollSection
          title={t('filters.custom.commented')}
          items={mapExamData(commentedData?.exams)}
          isLoading={commentedLoading}
          onViewAll={() => navigate('/?filter=commented')}
          onView={(id) => {
            const exam = commentedData?.exams.find(e => e.id === id);
            handleCardClick(id, exam?.title || '');
          }}
        />

        {/* 投稿セクション */}
        <HorizontalScrollSection
          title={t('filters.custom.posted')}
          items={mapExamData(postedData?.exams)}
          isLoading={postedLoading}
          onViewAll={() => navigate('/?filter=posted')}
          onView={(id) => {
            const exam = postedData?.exams.find(e => e.id === id);
            handleCardClick(id, exam?.title || '');
          }}
        />

        {/* アコーディオン形式の設定パネル */}
        <AccountSettingsAccordion
          expandedAccordion={expandedAccordion}
          onAccordionChange={handleAccordionChange}
          isEditingProfile={isEditingProfile}
          editForm={editForm}
          onFormChange={setEditForm}
          user={user}
          profile={profile}
          setEnableAppBarActions={setEnableAppBarActions}
          setIsEditMode={setIsEditMode}
          setHasUnsavedChanges={setHasUnsavedChanges}
          setOnSave={setOnSave}
        />
      </Box>
    </Container>
  );
}

export default MyPage;
