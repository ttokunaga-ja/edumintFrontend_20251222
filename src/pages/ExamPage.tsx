import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Container, Box, LinearProgress, Alert, Stack, Skeleton } from '@mui/material';

import { useExamQuery, useExamMutation } from '@/features/exam/hooks';
import { ExamSchema, ExamFormValues, createDefaultExam } from '@/features/exam/schema';
import { transformToForm } from '@/features/exam/utils/normalization';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAppBarAction } from '@/contexts/AppBarActionContext';
import { ExamMetaSection } from '@/features/exam/components/ExamMetaSection';
import { QuestionList } from '@/features/exam/components/QuestionList';

/**
 * ExamPage
 * 
 * 試験編集ページ
 */
export default function ExamPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // isDirty の前回の値を記録（無限ループ防止）
  const prevIsDirtyRef = useRef<boolean | null>(null);

  // ===== AppBarAction 統合 =====
  const {
    setEnableAppBarActions,
    isEditMode,
    setIsEditMode,
    setHasUnsavedChanges: setGlobalUnsavedChanges,
    isSaving,
    setIsSaving,
    setOnSave,
  } = useAppBarAction();

  // ===== データ取得 =====
  const { data: initialData, isLoading, error } = useExamQuery(id || '');

  // ===== 保存 Mutation =====
  const { mutateAsync: saveExam, error: saveError } = useExamMutation(id || '');

  // ===== React Hook Form 初期化 =====
  const methods = useForm<ExamFormValues>({
    resolver: zodResolver(ExamSchema),
    defaultValues: createDefaultExam(),
    mode: 'onBlur',
  });

  const { reset, watch, trigger, getValues, handleSubmit, formState } = methods;
  const { isDirty } = formState;

  // フォーム値の初期化（安定化のためメモ化）
  const initialFormValues = useMemo(() => {
    return initialData ? transformToForm(initialData) : null;
  }, [initialData]);

  // データロード完了フラグ
  const isLoadedRef = useRef(false);

  useEffect(() => {
    if (!isLoadedRef.current && initialFormValues) {
      console.log('[ExamPage] Initializing form with data:', initialFormValues);
      reset(initialFormValues);
      isLoadedRef.current = true;
    }
  }, [initialFormValues, reset]);

  // ===== 編集可能判定 =====
  // FIXME: 厳密な権限チェックはバックエンドまたはデータ整合性が確認できたら戻す
  // 現状はログインしていればボタンを表示させる
  const isAuthor = useMemo(() => {
    if (!user) return false;
    return true;
    /* 
    if (!initialData) return false;
    const data: any = initialData;
    const authorId = data.userId || data.user_id;
    return String(user.id) === String(authorId);
    */
  }, [user]);

  // isDirty の前回の値を記録
  const prevContextValues = useRef({
    isAuthor: false,
    hasUnsavedChanges: false,
  });

  // ===== 効果: AppBarActionContext との同期 (単一のEffectに集約) =====
  useEffect(() => {
    const prev = prevContextValues.current;

    // 1. Author権限 (View/Editボタンの表示制御)
    if (prev.isAuthor !== isAuthor) {
      console.log('[ExamPage] Updating EnableAppBarActions:', !!isAuthor);
      setEnableAppBarActions(!!isAuthor);
      prev.isAuthor = !!isAuthor;
    }

    // 2. 未保存状態 (Saveボタンの有効化)
    if (prev.hasUnsavedChanges !== isDirty) {
      console.log('[ExamPage] Updating HasUnsavedChanges:', isDirty);
      setHasUnsavedChanges(isDirty);
      setGlobalUnsavedChanges(isDirty);
      prev.hasUnsavedChanges = isDirty;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthor, isDirty]);

  // ===== 保存ハンドラ =====
  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      const isValid = await trigger();
      if (!isValid) {
        console.warn('Form validation failed');
        return;
      }

      const formData = getValues();
      await saveExam(formData);

      // 成功時: フォームをリセット（isDirty = false）
      reset(formData);
      // isLoadedRefはリセットしない（リセットすると再初期化される恐れがあるため）
      setIsEditMode(false);
    } catch (err) {
      console.error('[ExamPage] Save error:', err);
    } finally {
      setIsSaving(false);
    }
  }, [trigger, getValues, saveExam, reset, setIsEditMode, setIsSaving]);

  // 保存ハンドラの登録
  useEffect(() => {
    setOnSave(() => handleSave);
    return () => setOnSave(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleSave]);

  // ===== エラー表示 =====
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          データの読み込みに失敗しました: {(error as Error).message}
        </Alert>
      </Container>
    );
  }

  // ===== ローディング表示 =====
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={2}>
          <Skeleton variant="rectangular" height={100} />
          <Skeleton variant="rectangular" height={300} />
          <Skeleton variant="rectangular" height={400} />
        </Stack>
      </Container>
    );
  }

  // ===== メインレンダリング =====
  return (
    <FormProvider {...methods}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <form onSubmit={handleSubmit(() => { })}>
          {/* 保存中表示 */}
          {isSaving && <LinearProgress sx={{ mb: 2 }} />}

          {/* エラー表示 */}
          {saveError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              保存に失敗しました: {(saveError as Error).message}
            </Alert>
          )}

          {/* 試験メタデータセクション */}
          <ExamMetaSection isEditMode={isEditMode && !!isAuthor} />

          {/* 大問リスト */}
          <QuestionList isEditMode={isEditMode && !!isAuthor} />

          {/* フォーム状態デバッグ表示 */}
          {process.env.NODE_ENV === 'development' && (
            <Box
              sx={{
                mt: 4,
                p: 2,
                bgcolor: '#f5f5f5',
                borderRadius: 1,
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                display: 'none',
              }}
            >
              <pre>
                isChanged: {hasUnsavedChanges.toString()}
                {'\n'}
                isValid: {formState.isValid.toString()}
                {'\n'}
                isSaving: {isSaving.toString()}
                {'\n'}
                isEditMode: {isEditMode.toString()}
              </pre>
            </Box>
          )}
        </form>
      </Container>
    </FormProvider>
  );
}
