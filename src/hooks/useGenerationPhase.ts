// hooks/useGenerationPhase.ts
import { useEffect } from 'react';
import { useJobStore } from '../stores/jobStore';
import { useWebSocket } from './useWebSocket';

export const useGenerationPhase = (jobId: string | null) => {
  const { phase, updatePhase } = useJobStore();
  useWebSocket(jobId);

  useEffect(() => {
    if (phase === 'Generation_completed') {
      // 生成完了後の処理
    }
  }, [phase]);

  const publish = () => {
    // 公開API
    fetch(`/api/jobs/${jobId}/publish`, { method: 'POST' });
  };

  return { phase, publish };
};