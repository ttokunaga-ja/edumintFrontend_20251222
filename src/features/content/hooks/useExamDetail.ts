import { useQuery } from '@tanstack/react-query';
import { getExam } from '@/services/api/gateway/content';
import type { Exam } from '../models';

/**
 * 難易度のデフォルト値を確保する
 * APIから取得した問題データに難易度が含まれていない場合は 1 (基礎) を設定
 */
function ensureDifficultyDefaults(exam: any): any {
  if (!exam?.questions) return exam;
  
  return {
    ...exam,
    questions: exam.questions.map((question: any) => ({
      ...question,
      difficulty: question.difficulty ?? 1,
      sub_questions: question.sub_questions?.map((subQ: any) => ({
        ...subQ,
        difficulty: subQ.difficulty ?? 1,
      })) || [],
    })),
  };
}

export function useExamDetail(id: string) {
  return useQuery({
    queryKey: ['exam', id],
    queryFn: () => getExam(id),
    select: (data) => ensureDifficultyDefaults(data),
    enabled: !!id,
  });
}
