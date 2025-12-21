import { useRef, useState } from 'react';
import type { Page } from '@/types';
import type { GenerationStep } from '@/components/page/ProblemCreatePage/GenerationStatusTimeline';
import { useFileUpload } from '@/features/content/hooks/useFileUpload';
import { useGenerationStatus } from '@/features/content/hooks/useGenerationStatus';
import type { ProblemSettings } from '@/components/page/ProblemCreatePage/ProblemSettingsBlock';
import type { GenerationOptions } from '@/components/page/ProblemCreatePage/GenerationOptionsBlock';

type Phase = 'input' | 'uploading' | 'generating' | 'complete' | 'error';

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

const defaultGenerationOptions: GenerationOptions = {
  useAdvancedAI: true,
  preserveFormatting: true,
  detectDiagrams: true,
  splitBySection: true,
  generatePracticeTests: false,
  optimizeForMobile: true,
};

export const useProblemCreateController = ({
  onNavigate,
  onGenerated,
  jobId,
}: {
  onNavigate: (page: Page, problemId?: string) => void;
  onGenerated?: (problemId: string) => void;
  jobId?: string;
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [phase, setPhase] = useState<Phase>(jobId ? 'generating' : 'input');
  const [problemSettings, setProblemSettings] = useState<ProblemSettings>(defaultProblemSettings);
  const [generationOptions, setGenerationOptions] = useState<GenerationOptions>(defaultGenerationOptions);
  const [generatedProblemId, setGeneratedProblemId] = useState<string | undefined>();

  const { files, isUploading, uploadFiles, clearFiles, lastUploadJobId, removeFile } = useFileUpload();
  const {
    jobId: activeJobId,
    phase: generationPhase,
    progress,
    errorMessage,
    startGeneration,
    trackExistingJob,
  } = useGenerationStatus({
    initialJobId: jobId,
    onComplete: (status) => {
      setPhase('complete');
      const problemId = status.problemId || status.data?.problemId;
      if (problemId) {
        setGeneratedProblemId(problemId);
        onGenerated?.(problemId);
        onNavigate('problem-view', problemId);
      }
    },
    onError: () => setPhase('error'),
  });

  const currentStep: GenerationStep =
    generationPhase === 'complete'
      ? 'complete'
      : generationPhase === 'analyzing'
        ? 'analyzing'
        : generationPhase === 'uploading'
          ? 'uploading'
          : 'generating';

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    if (!selected.length) return;

    setPhase('uploading');
    const uploadJobId = await uploadFiles(selected);
    if (!uploadJobId) {
      setPhase('input');
      return;
    }

    const startedJobId = await startGeneration(uploadJobId);
    if (startedJobId) {
      setPhase('generating');
    } else {
      setPhase('error');
    }
  };

  const handleStartClick = () => fileInputRef.current?.click();

  const handleReset = () => {
    clearFiles();
    setPhase('input');
  };

  if (jobId) {
    trackExistingJob(jobId);
  }

  return {
    fileInputRef,
    phase,
    problemSettings,
    generationOptions,
    setProblemSettings,
    setGenerationOptions,
    files,
    isUploading,
    lastUploadJobId,
    activeJobId,
    generationStep: currentStep,
    progress,
    errorMessage,
    generatedProblemId,
    removeFile,
    handleFileSelect,
    handleStartClick,
    handleReset,
  };
};
