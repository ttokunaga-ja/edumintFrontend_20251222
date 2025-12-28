import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useExamDetail, useExamEditor } from '@/features/content';
import { PreviewEditToggle } from '../components/page/ProblemViewEditPage/PreviewEditToggle';
import { ProblemMetaBlock } from '../components/page/ProblemViewEditPage/ProblemMetaBlock';
import { QuestionSectionView } from '../components/page/ProblemViewEditPage/QuestionSectionView';
import { ActionBar } from '../components/page/ProblemViewEditPage/ActionBar';
import { ProblemEditor } from '../components/page/ProblemViewEditPage/ProblemEditor';
import { useServiceHealthContext } from '../contexts/ServiceHealthContext';
import { ContextHealthAlert } from '../components/common/ContextHealthAlert';

export interface ProblemViewEditPageProps {
  user: any;
  problemId: string;
  onNavigate: (page: any, problemId?: string) => void;
  onLogout: () => void;
  shouldStartInEditMode?: boolean;
  initialViewMode?: string;
  hasViewedAnswerAd?: boolean;
  onAnswerAdViewed?: () => void;
  hasViewedQuestionAd?: boolean;
  onQuestionAdViewed?: () => void;
}

export default function ProblemViewEditPage(props: ProblemViewEditPageProps) {
  const { id: paramId } = useParams<{ id: string }>();
  const id = props.problemId || paramId;
  const { exam, loading, error } = useExamDetail(id!);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedExam, setEditedExam] = useState<any>(null);
  const { updateExam, isSaving } = useExamEditor();

  const { health, shouldDisableCTA } = useServiceHealthContext();
  const isCommunityDisabled = shouldDisableCTA(['community']);
  const isShareDisabled = shouldDisableCTA(['notifications']);

  useEffect(() => {
    if (exam) {
      setEditedExam(JSON.parse(JSON.stringify(exam)));
    }
  }, [exam]);

  const hasEditPermission = !!props.user && !!exam && (
    props.user.id === (exam as any).userId ||
    props.user.id === (exam as any).user_id ||
    props.user.username === (exam as any).userName ||
    props.user.role === 'admin' ||
    (props as any).isOwner
  );

  useEffect(() => {
    if (!hasEditPermission && isEditMode) {
      setIsEditMode(false);
    }
  }, [hasEditPermission, isEditMode]);

  if (loading) return <div>Loading...</div>;
  if (error || !exam) return <div>Error loading exam.</div>;

  const handleSave = async () => {
    await updateExam(id!, editedExam);
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setEditedExam(JSON.parse(JSON.stringify(exam)));
    setIsEditMode(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      <div style={{
      paddingLeft: "1rem",
      paddingRight: "1rem"
<<<<<<< HEAD
    }}
        <div style={{
      display: "flex",
      alignItems: "center"
    }}
=======
    }>
        <div style={{
      display: "flex",
      alignItems: "center"
    }>
>>>>>>> parent of b05c270 (chore(tailwind): strip Tailwind className usages (mechanical removal for Phase 4))
          <PreviewEditToggle
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
            disabled={!hasEditPermission}
            disabledReason="編集権限が必要です"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {isEditMode ? (
              <ProblemEditor
                exam={editedExam}
                onChange={setEditedExam}
                canEdit={hasEditPermission}
              />
            ) : (
              <div className="space-y-8">
                {exam.questions.map((q: any) => (
                  <QuestionSectionView key={q.id} question={q} />
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-4">
            {(health.community === 'degraded' || health.community === 'outage' || health.community === 'maintenance') && (
              <ContextHealthAlert
                category="コミュニティ機能"
                status={health.community}
                message={
                  health.community === 'degraded'
                    ? '現在、いいね・コメント機能に遅延が発生しています。'
                    : health.community === 'maintenance'
                      ? 'コミュニティ機能のメンテナンスを実施しています。'
                      : 'コミュニティ機能に障害が発生しています。'
                }
                disableCTA={true}
              />
            )}

            <ProblemMetaBlock
              exam={editedExam || exam}
              isOwner={true}
              onLike={() => { }}
              onDislike={() => { }}
              onBookmark={() => { }}
              onShare={() => { }}
              onReport={() => { }}
              onExportPDF={() => { }}
              disableCommunityActions={isCommunityDisabled}
              disableShareAction={isShareDisabled}
            />

            {(health.notifications === 'outage' || health.notifications === 'maintenance') && (
              <ContextHealthAlert
                category="通知・お知らせ"
                status={health.notifications}
                message={
                  health.notifications === 'outage'
                    ? '通知機能が停止しているため、通知が送信されません。'
                    : '通知機能のメンテナンスを実施しています。'
                }} />
            )}
          </div>
        </div>
      </div>

      <ActionBar
        isEditing={isEditMode}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={isSaving}
      />
    </div>
  );
}
