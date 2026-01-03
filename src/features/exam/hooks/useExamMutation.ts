import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateExam as updateExamApi } from '@/services/api/gateway/content';
import { transformToApi, transformToForm } from '../utils/normalization';
import type { ExamFormValues } from '../schema';

/**
 * 試験データを保存するミューテーションフック
 * 
 * フォーム用スキーマ（キャメルケース）を自動的に API 用ペイロード（スネークケース）に変換して送信します。
 * 成功時は TanStack Query のキャッシュを更新し、フォームをリセットします。
 */
export const useExamMutation = (id?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: ExamFormValues) => {
      if (!id) throw new Error('Exam ID is required');
      
      // フォーム用データを API 用ペイロードに変換
      const payload = transformToApi(formData);
      
      // API送信
      const apiResponse = await updateExamApi(id, payload);
      
      return apiResponse;
    },
    onSuccess: (apiResponse) => {
      // APIレスポンスをフォーム用に正規化
      const normalizedData = transformToForm(apiResponse);
      
      // キャッシュ更新（自動リフェッチのトリガー）
      queryClient.setQueryData(['exam', id], normalizedData);
      queryClient.invalidateQueries({ queryKey: ['exam', id] });
    },
    onError: (error) => {
      console.error('[useExamMutation] Save failed:', error);
      // エラーハンドリングは呼び出し元で実装
    },
  });
};
