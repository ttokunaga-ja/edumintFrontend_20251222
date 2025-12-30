import { useEffect, useRef, useState } from 'react';
import type { Page } from '@/types';
import type { GenerationPhase as GenerationStep } from '@/features/generation/types';
import { useFileUpload } from '@/features/content/hooks/useFileUpload';
import type { ProblemSettings } from '@/components/page/ProblemCreatePage/ProblemSettingsBlock';
import { confirmStructure, getGenerationStatus } from '@/features/generation/api';
import { useJobStore } from '@/features/generation/stores/jobStore';

const defaultProblemSettings: ProblemSettings = {
  autoGenerateQuestions: true,
  questionCount: 5,
  includeAnswers: true,
  includeSolutions: true,
  difficultyLevel: 2,
  questionTypes: [1, 2],
  extractKeywords: true,
  isPublic: true,
};

export const useProblemCreateController = ({
  onNavigate,
  onGenerated,
  jobId,
  allowStructureReanalysis = true,
  allowStructureSkip = true,
  shouldConfirmStructure = true,
}: {
  onNavigate: (page: Page, problemId?: string) => void;
  onGenerated?: (problemId: string) => void;
  jobId?: string;
  allowStructureReanalysis?: boolean;
  allowStructureSkip?: boolean;
  shouldConfirmStructure?: boolean;
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [problemSettings, setProblemSettings] = useState<ProblemSettings>(defaultProblemSettings);
  const [generatedProblemId, setGeneratedProblemId] = useState<string | undefined>();
  const [localError, setLocalError] = useState<string | null>(null);
  const autoConfirmedRef = useRef<string | null>(null);

  const { files, isUploading, uploadFiles, clearFiles, lastUploadJobId, removeFile } = useFileUpload();
  const { jobId: activeJobId, phase: generationPhase, data, error: storeError } = useJobStore();

  // 構造確認OFFの場合、ジョブが 'structure_review' のステップに達したら構造確定APIを送って後半フェーズへ進ませる
  useEffect(() => {
    if (shouldConfirmStructure) return;
    if (!activeJobId) return;
    if (autoConfirmedRef.current === activeJobId) return;

    let isMounted = true;
    let interval: number | undefined;

    const pollAndConfirm = async () => {
      try {
        const status = await getGenerationStatus(activeJobId);
        if (!isMounted) return;

        // If we've reached structure_review, call confirmStructure to advance
        if (status.currentStep === 'structure_review') {
          try {
            await confirmStructure(activeJobId);
            // verify it advanced by re-fetching
            const after = await getGenerationStatus(activeJobId);
            if (!isMounted) return;
            if (after.currentStep !== 'structure_review') {
              autoConfirmedRef.current = activeJobId;
            } else {
              console.warn('confirmStructure called but job still in structure_review');
            }
          } catch (e) {
            console.warn('auto confirmStructure failed', e);
          } finally {
            if (interval) window.clearInterval(interval);
          }
        }
      } catch (e) {
        // ignore transient polling errors, try again
        console.warn('polling generation status failed', e);
      }
    };

    // start polling at short interval
    interval = window.setInterval(pollAndConfirm, 500);
    // run once immediately
    pollAndConfirm();

    return () => {
      isMounted = false;
      if (interval) window.clearInterval(interval);
    };
  }, [shouldConfirmStructure, activeJobId]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    if (!selected.length) return;

    const uploadJobId = await uploadFiles(selected);
    if (!uploadJobId) {
      setLocalError('アップロードに失敗しました');
      return;
    }

    // Zustand に jobId をセット
    useJobStore.getState().setJob(uploadJobId);
  };

  const handleStartClick = () => fileInputRef.current?.click();

  const handleReset = () => {
    clearFiles();
    setLocalError(null);
  };

  if (jobId) {
    // 既存ジョブの場合は Zustand にセット
    useJobStore.getState().setJob(jobId);
  }

  const uiPhase = files.length === 0 && !isUploading ? 'input' : generationPhase || 'uploading';

  return {
    fileInputRef,
    phase: uiPhase,
    problemSettings,
    setProblemSettings,
    files,
    isUploading,
    lastUploadJobId,
    activeJobId,
    generationStep: generationPhase,
    detailedStep: 'generating', // 仮
    progress: 50, // 仮
    errorMessage: localError || storeError,
    errorCode: undefined,
    generatedProblemId,
    removeFile,
    handleFileSelect,
    handleStartClick,
    handleReset,
  };
};
