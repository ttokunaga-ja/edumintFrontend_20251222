// hooks/useStructurePhase.ts
import { useEffect } from 'react';
import { useJobStore } from '../stores/jobStore';
import { useWebSocket } from './useWebSocket';

export const useStructurePhase = (jobId: string | null) => {
  const { phase, updatePhase } = useJobStore();
  useWebSocket(jobId);

  useEffect(() => {
    if (phase === 'Structure_confirmed') {
      // 構造確定後の処理
    }
  }, [phase]);

  const confirmStructure = () => {
    // 構造確定API
    fetch(`/api/jobs/${jobId}/confirm`, { method: 'POST' });
  };

  return { phase, confirmStructure };
};