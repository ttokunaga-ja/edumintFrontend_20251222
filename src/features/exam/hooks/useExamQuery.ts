import { useQuery } from '@tanstack/react-query';
import { getExam } from '@/services/api/gateway/content';
import { transformToForm } from '../utils/normalization';
import type { ExamFormValues } from '../schema';

/**
 * 試験データを取得するクエリフック
 * 
 * APIから取得したデータを自動的にフォーム用スキーマに変換します。
 * - DB スネークケース → フロント キャメルケース
 * - 数値ID → 文字列ID（フォーム用）
 * - null値 → デフォルト値
 */
export const useExamQuery = (id?: string) => {
  return useQuery({
    queryKey: ['exam', id],
    queryFn: async () => {
      if (!id) throw new Error('Exam ID is required');
      const raw = await getExam(id);
      // API データをフォーム用スキーマに正規化
      return transformToForm(raw);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5分のキャッシュ
    gcTime: 1000 * 60 * 10, // ガベージコレクション 10分
  });
};
