import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, CircularProgress, Alert, Button, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useExamDetail } from '@/features/content/hooks/useExamDetail';
import { useExamEditor } from '@/features/content/hooks/useExamEditor';
import { useAppBarAction } from '@/contexts/AppBarActionContext';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ProblemMetaBlock } from '@/components/page/ProblemViewEditPage/ProblemMetaBlock';
import { ProblemEditor } from '@/components/page/ProblemViewEditPage/ProblemEditor';
import { QuestionBlock } from '@/components/page/ProblemViewEditPage/QuestionBlock';
import { SubQuestionBlock } from '@/components/page/ProblemViewEditPage/SubQuestionBlock';
import { SubQuestionSectionHandle } from '@/components/page/ProblemViewEditPage/SubQuestionSection/SubQuestionSection';

export default function ProblemViewEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    setEnableAppBarActions,
    isEditMode,
    setIsEditMode,
    setHasUnsavedChanges,
    setOnSave,
    setIsSaving,
    setOnNavigateWithCheck,
  } = useAppBarAction();
  const { user } = useAuth();

  const { data: exam, isLoading, isFetching, error } = useExamDetail(id || '');
  const { updateExam, isSaving: mutationSaving } = useExamEditor();

  const [isEditModeLocal, setIsEditModeLocal] = useState(false);
  const [editedExam, setEditedExam] = useState<any>(null);

  // Phase 6: SubQuestionSection refs (複数の subQuestions を保存するため Map を使用)
  const subQuestionRefsMapRef = useRef<Map<string, SubQuestionSectionHandle>>(new Map());

  // Ref to track previous values to prevent unnecessary context updates
  const prevValuesRef = useRef({
    isAuthor: false,
    hasChanges: false,
    isEditMode: false,
    isSaving: false,
  });

  // 初回ロード時のみ更新（無限ループ防止）
  useEffect(() => {
    if (exam && (!editedExam || editedExam.id !== exam.id)) {
      setEditedExam(exam);
    }
  }, [exam, editedExam]);

  // TopMenuBar の Edit 切り替えと同期
  // TopMenuBar で Edit/View ボタンが押されたときに isEditMode が更新される
  // これを isEditModeLocal に同期することで UI が更新される
  useEffect(() => {
    // isEditMode が false に変わった場合、必ず同期する（無限ループを避けるため prev をチェック）
    const prev = prevValuesRef.current;
    
    // 値が変わった場合のみ処理
    if (prev.isEditMode !== isEditMode) {
      setIsEditModeLocal(isEditMode);
      prev.isEditMode = isEditMode;
      
      // Edit モードに入る場合、editedExam を確保する
      if (isEditMode && exam && (!editedExam || editedExam.id !== exam.id)) {
        setEditedExam(exam);
      }
      
      console.log('[ProblemViewEditPage] isEditMode changed:', isEditMode);
    }
  }, [isEditMode, exam, editedExam]);

  // 変更があるかどうかを判定
  // NOTE: MyPage では詳細フィールドの比較を行っていますが、
  // ここではメタデータの変更とSubQuestion の内容変更を検出します
  // isEditModeLocal が false の場合は、変更があっても hasChanges を false にします
  // これはView モードでは保存ボタンが有効化されないようにするためです
  const hasChanges = useMemo(() => {
    if (!exam || !editedExam || !isEditModeLocal) return false;
    
    // JSON.stringify で全体を比較（最も確実）
    // ただしフォーム表示時のみ（isEditModeLocal === true）
    const changed = JSON.stringify(editedExam) !== JSON.stringify(exam);
    console.log('[ProblemViewEditPage] hasChanges:', changed, 'isEditModeLocal:', isEditModeLocal);
    return changed;
  }, [exam, editedExam, isEditModeLocal]);

  // Phase 6: Save handler stored in ref for stability
  // SubQuestionSection refs に対して save() を呼び出す
  const handleSaveRef = useRef<(() => Promise<void>) | undefined>(undefined);
  handleSaveRef.current = async () => {
    if (!id || !editedExam) return;
    try {
      // Step 1: すべての SubQuestionSection に save() を呼び出す
      const savePromises: Promise<void>[] = [];
      subQuestionRefsMapRef.current.forEach((handle) => {
        if (handle && handle.save) {
          savePromises.push(handle.save());
        }
      });

      // すべての SubQuestion 保存を待機
      if (savePromises.length > 0) {
        await Promise.all(savePromises);
      }

      // Step 2: Exam メタデータの保存（必要な場合）
      // 注：SubQuestion の保存が完了したので、Exam 全体の保存は不要な場合が多い
      // ただし Exam メタデータに変更がある場合は以下で保存
      await updateExam(id, editedExam);
      setIsEditModeLocal(false);
    } catch (e) {
      console.error('Failed to save', e);
      // エラーは各 SubQuestionSection で Alert で表示されている
    }
  };

  // Stable save callback that uses ref
  const stableSave = useCallback(async () => {
    await handleSaveRef.current?.();
  }, []);

  // Navigate with check handler stored in ref
  const handleNavigateWithCheckRef = useRef<((path: string) => void) | undefined>(undefined);
  handleNavigateWithCheckRef.current = (path: string) => {
    if (hasChanges) {
      if (window.confirm('未保存の変更があります。移動しますか？')) {
        navigate(path);
      }
    } else {
      navigate(path);
    }
  };

  // Stable navigate callback
  const stableNavigateWithCheck = useCallback((path: string) => {
    handleNavigateWithCheckRef.current?.(path);
  }, []);

  // Calculate derived values
  const isAuthor = !!(user && exam && user.id === exam.userId);

  // Single effect for all context sync - only update when values actually change
  useEffect(() => {
    const prev = prevValuesRef.current;
    
    // Only update if values have changed
    if (prev.isAuthor !== isAuthor) {
      setEnableAppBarActions(isAuthor);
      prev.isAuthor = isAuthor;
    }
    
    if (prev.hasChanges !== hasChanges) {
      setHasUnsavedChanges(hasChanges);
      prev.hasChanges = hasChanges;
    }
    
    // NOTE: isEditMode は TopMenuBar から外部で更新されるため、
    // ここから setIsEditMode を呼び出さない（双方向バインディングを避ける）
    // 代わりに useEffect: isEditMode の変更を検知するエフェクトで isEditModeLocal のみ更新
    
    if (prev.isSaving !== mutationSaving) {
      setIsSaving(mutationSaving);
      prev.isSaving = mutationSaving;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthor, hasChanges, mutationSaving]);

  // Set save callback only once on mount
  useEffect(() => {
    setOnSave(stableSave);
    return () => {
      setOnSave(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableSave]);

  // Set navigate callback based on edit mode
  useEffect(() => {
    if (isEditModeLocal && hasChanges) {
      setOnNavigateWithCheck(stableNavigateWithCheck);
    } else {
      setOnNavigateWithCheck(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditModeLocal, hasChanges, stableNavigateWithCheck]);

  // データがあるなら即座に表示（Loading中であっても）
  if (exam) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 10 }}>
        <Container maxWidth='xl' sx={{ py: 4 }}>
          {/* 戻るボタン + ローディング */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => stableNavigateWithCheck('/')}>
              戻る
            </Button>
            {isFetching && <CircularProgress size={20} />}
          </Box>

          {/* メタデータセクション - 最上部に配置（フルウィド） */}
          <Box sx={{ mb: 4 }}>
            <ProblemMetaBlock exam={exam} />
          </Box>

          {/* 問題内容（フルウィド） */}
          <Box>
            {isEditModeLocal && isFetching ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : isEditModeLocal ? (
              <ProblemEditor
                exam={editedExam || exam}
                onChange={setEditedExam}
              />
            ) : (
              <Box>
                {exam.questions?.map((question: any) => (
                  <QuestionBlock
                    key={question.id}
                    id={question.id}
                    questionNumber={question.questionNumber}
                    content={question.questionContent}
                    format={question.questionFormat}
                    difficulty={question.difficulty ?? 1}
                    keywords={question.keywords}
                    viewMode='full'
                    mode={isEditModeLocal ? 'edit' : 'preview'}
                  >
                    <Box sx={{ mt: 2 }}>
                      {question.subQuestions?.map((subQ: any) => (
                        <SubQuestionBlock
                          ref={(ref) => {
                            // Phase 6: SubQuestionSection の ref を Map に登録
                            if (ref) {
                              subQuestionRefsMapRef.current.set(subQ.id, ref);
                            } else {
                              subQuestionRefsMapRef.current.delete(subQ.id);
                            }
                          }}
                          key={subQ.id}
                          id={subQ.id}
                          subQuestionNumber={subQ.subQuestionNumber}
                          questionTypeId={subQ.questionTypeId}
                          questionContent={subQ.questionContent || ''}
                          answerContent={subQ.answerContent || ''}
                          explanation={subQ.answer_explanation || subQ.answerExplanation || ''}
                          keywords={subQ.keywords || []}
                          options={subQ.options || []}
                          pairs={subQ.pairs || []}
                          items={subQ.items || []}
                          answers={subQ.answers || []}
                          showAnswer={false}
                          mode={isEditModeLocal ? 'edit' : 'preview'}
                        />
                      ))}
                    </Box>
                  </QuestionBlock>
                ))}
              </Box>
            )}
          </Box>
        </Container>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth='md'>
        <Box sx={{ py: 4 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mb: 3 }}>
            戻る
          </Button>
          <Alert severity='error'>データの取得に失敗しました</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth='md'>
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography>問題が見つかりません</Typography>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>ホームへ戻る</Button>
      </Box>
    </Container>
  );
}
