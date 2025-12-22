import { useEffect, useState } from 'react';
import {
  getGenerationStatus,
  startStructureGeneration,
  type GenerationStatusResponse,
} from '@/services/api/gateway/generation';

export type GenerationPhase = 'uploading' | 'analyzing' | 'structure-review' | 'generating' | 'complete' | 'error';

type Params = {
  initialJobId?: string;
  onComplete?: (result: GenerationStatusResponse) => void;
  onError?: (message: string) => void;
};

const mapStep = (
  status: GenerationStatusResponse['status'],
  currentStep?: string,
): GenerationPhase => {
  if (status === 'pending' || status === 'queued') return 'uploading';
  if (status === 'completed') return 'complete';
  if (status === 'error' || status === 'failed') return 'error';

  const stepLabel = currentStep || '';
  if (stepLabel.includes('解析')) return 'analyzing';
  if (stepLabel.includes('構造')) return 'structure-review';

  return 'generating';
};

export const useGenerationStatus = ({ initialJobId, onComplete, onError }: Params) => {
  const [jobId, setJobId] = useState<string | null>(initialJobId ?? null);
  const [phase, setPhase] = useState<GenerationPhase>(initialJobId ? 'generating' : 'uploading');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationStatusResponse | null>(null);

  const startGeneration = async (structureId: string) => {
    try {
      const { jobId: newJobId } = await startStructureGeneration(structureId);
      setJobId(newJobId);
      setPhase('analyzing');
      setProgress(10);
      return newJobId;
    } catch (error) {
      console.error('Failed to start generation', error);
      setPhase('error');
      setErrorMessage('生成ジョブの開始に失敗しました');
      onError?.('生成ジョブの開始に失敗しました');
      return null;
    }
  };

  const trackExistingJob = (existingJobId: string) => {
    setJobId(existingJobId);
    setPhase('generating');
  };

  const reset = () => {
    setJobId(null);
    setPhase('uploading');
    setProgress(0);
    setErrorMessage(null);
    setResult(null);
  };

  useEffect(() => {
    if (!jobId) return;
    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const status = await getGenerationStatus(jobId);
        if (!isMounted) return;

        const nextPhase = mapStep(status.status, status.currentStep);
        setPhase(nextPhase);
        setProgress(Math.min(status.progress ?? 0, 100));

        if (status.status === 'completed') {
          setResult(status);
          onComplete?.(status);
          clearInterval(interval);
        } else if (status.status === 'error' || status.status === 'failed') {
          const message = status.errorMessage || status.message || '生成に失敗しました';
          setErrorMessage(message);
          onError?.(message);
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Failed to poll generation status', error);
        if (isMounted) {
          setPhase('error');
          setErrorMessage('生成ステータスの取得に失敗しました');
          onError?.('生成ステータスの取得に失敗しました');
          clearInterval(interval);
        }
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [jobId, onComplete, onError]);

  return {
    jobId,
    phase,
    progress,
    errorMessage,
    result,
    startGeneration,
    trackExistingJob,
    reset,
  };
};
