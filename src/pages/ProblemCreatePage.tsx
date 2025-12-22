import React from 'react';
import type { Page, User } from '@/types';
import { StartPhase } from '@/components/page/ProblemCreatePage/StartPhase';
import { AnalysisPhase } from '@/components/page/ProblemCreatePage/AnalysisPhase';
import { GenerationPhase } from '@/components/page/ProblemCreatePage/GenerationPhase';
import { ProgressHeader } from '@/components/page/ProblemCreatePage/ProgressHeader';
import { useProblemCreateController } from './ProblemCreatePage/hooks/useProblemCreateController';
import { useProblemCreateFlow } from './ProblemCreatePage/hooks/useProblemCreateFlow';

export interface ProblemCreatePageProps {
  user: User;
  onNavigate: (page: Page, problemId?: string) => void;
  onLogout: () => void;
  jobId?: string;
  onGenerated?: (problemId: string) => void;
}

export function ProblemCreatePage({
  user: _user,
  onNavigate,
  onLogout: _onLogout,
  jobId,
  onGenerated,
}: ProblemCreatePageProps) {
  const {
    sourceType,
    setSourceType,
    step,
    proceedFromStart,
    goToAnalysis,
    goToGeneration,
    backToStart,
    backToAnalysis,
    backFromGeneration,
    exerciseOptions,
    setExerciseOptions,
    documentOptions,
    setDocumentOptions,
    examDraft,
    setExamDraft,
  } = useProblemCreateFlow();

  const {
    fileInputRef,
    phase,
    generationOptions,
    setGenerationOptions,
    files,
    isUploading,
    removeFile,
    handleFileSelect,
    handleStartClick,
    generationStep,
    progress,
    errorMessage,
    activeJobId,
  } = useProblemCreateController({ onNavigate, onGenerated, jobId });

  const isProcessing = phase === 'generating' || phase === 'uploading';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ProgressHeader currentStep={step} />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-12 space-y-8">
        {step === 'start' && (
          <StartPhase
            sourceType={sourceType}
            onSourceTypeChange={setSourceType}
            fileInputRef={fileInputRef}
            onFileInputClick={handleStartClick}
            onFileSelect={handleFileSelect}
            files={files}
            isUploading={isProcessing || isUploading}
            onRemoveFile={removeFile}
            exerciseOptions={exerciseOptions}
            onChangeExerciseOptions={setExerciseOptions}
            documentOptions={documentOptions}
            onChangeDocumentOptions={setDocumentOptions}
            generationOptions={generationOptions}
            onChangeGenerationOptions={setGenerationOptions}
            onProceed={proceedFromStart}
          />
        )}

        {step === 'analysis' && (
          <AnalysisPhase
            exam={examDraft}
            onChange={setExamDraft}
            onBack={backToStart}
            onNext={goToGeneration}
          />
        )}

        {step === 'generation' && (
          <GenerationPhase
            exam={examDraft}
            onChange={setExamDraft}
            onBack={backFromGeneration}
            currentStep={generationStep}
            progress={progress}
            jobId={activeJobId}
            errorMessage={errorMessage}
            onPublish={() => onNavigate('home')}
          />
        )}
      </main>
    </div>
  );
}

export default ProblemCreatePage;
