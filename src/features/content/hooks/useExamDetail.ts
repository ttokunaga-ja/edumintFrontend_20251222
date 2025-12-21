import { useState, useEffect } from 'react';
import { getExam } from '@/services/api/gateway/content';
import type { ExamDetail } from '../models';

export function useExamDetail(id: string) {
  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchExam() {
      try {
        const data = await getExam(id);
        if (isMounted) setExam(data as ExamDetail);
      } catch (err) {
        if (isMounted) setError(err as Error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (id) fetchExam();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return { exam, loading, error };
}
