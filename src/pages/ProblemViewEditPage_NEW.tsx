import React, { useEffect } from 'react';
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
 * ProblemViewEditPage リファクタリング版
 * 
 * 設計原則:
 * 1. このページは「薄い」: フォーム初期化、Hook連携、AppBarAction登録のみ
 * 2. FormProvider でラップし、全子コンポーネントで useFormContext を使用
 * 3. AppBarActionContext でEdit/View/Save を一元管理（TopMenuBar が UI構築）
 * 4. 保存はフォーム全体で一度に実施（個別保存なし）
 */
export default function ProblemViewEditPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  // ===== AppBarAction 統合 =====
  const {
    setEnableAppBarActions,
    isEditMode,
    setIsEditMode,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    isSaving,
    setIsSaving,
    setOnSave,
  } = useAppBarAction();

  // ===== データ取得 =====
  const { data: initialData, isLoading, error } = useExamQuery(id);

  // ===== 保存 Mutation =====
  const mutation = useExamMutation(id);

  // ===== React Hook Form 初期化 =====
  const methods = useForm<ExamFormValues>({
    resolver: zodResolver(ExamSchema),
    defaultValues: createDefaultExam(),
    values: initialData, // APIからロード後に自動更新
    mode: 'onBlur',
  });

  // ===== 編集可能判定 =====
  const isAuthor = user && initialData && user.id === (initialData as any).userId;

  // ===== 効果1: AppBar 機能を有効化 =====
  useEffect(() => {
    setEnableAppBarActions(!!isAuthor);
  }, [isAuthor, setEnableAppBarActions]);

  // ===== 効果2: 未保存フラグを更新 =====
  useEffect(() => {
    setHasUnsavedChanges(methods.formState.isDirty);
  }, [methods.formState.isDirty, setHasUnsavedChanges]);

  // ===== 効果3: 保存ハンドラを登録 =====
  useEffect(() => {
    const handleSave = async () => {
      try {
        setIsSaving(true);
        
        // フォーム検証
        const isValid = await methods.trigger();
        if (!isValid) {
          console.warn('Form validation failed');
          return;
        }

        // フォーム値取得
        const formData = methods.getValues();

        // 保存（Mutation）
        await mutation.mutateAsync(formData);

        // 成功時: フォームをリセット（isDirty = false）
        methods.reset(formData);
        setIsEditMode(false); // View モードに戻す
      } catch (err) {
        console.error('[ProblemViewEditPage] Save error:', err);
      } finally {
        setIsSaving(false);
      }
    };

    setOnSave(handleSave);

    return () => {
      setOnSave(null);
    };
  }, [methods, mutation, setOnSave, setIsSaving, setIsEditMode]);

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
        <form onSubmit={methods.handleSubmit(async (data) => {
          // 保存は AppBarAction の onSave で実行
          // ここでは何もしない（AppBar SAVE ボタンから呼ばれるフロー）
        })}>
          {/* 保存中表示 */}
          {isSaving && <LinearProgress sx={{ mb: 2 }} />}

          {/* エラー表示 */}
          {mutation.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              保存に失敗しました: {(mutation.error as Error).message}
            </Alert>
          )}

          {/* 試験メタデータセクション */}
          <ExamMetaSection isEditMode={isEditMode && !!isAuthor} />

          {/* 大問リスト */}
          <QuestionList isEditMode={isEditMode && !!isAuthor} />

          {/* フォーム状態デバッグ表示（開発時） */}
          {process.env.NODE_ENV === 'development' && (
            <Box
              sx={{
                mt: 4,
                p: 2,
                bgcolor: '#f5f5f5',
                borderRadius: 1,
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                display: 'none', // 通常は非表示
              }}
            >
              <details>
                <summary>Form State</summary>
                <pre>
                  isDirty: {methods.formState.isDirty.toString()}
                  {'\n'}
                  isValid: {methods.formState.isValid.toString()}
                  {'\n'}
                  isSaving: {isSaving.toString()}
                  {'\n'}
                  isEditMode: {isEditMode.toString()}
                  {'\n'}
                  isAuthor: {isAuthor?.toString() || 'unknown'}
                </pre>
              </details>
            </Box>
          )}
        </form>
      </Container>
    </FormProvider>
  );
}
