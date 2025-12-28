import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProblemCreateView from '@/pages/ProblemCreatePage/ProblemCreateView';

vi.mock('@/components/page/ProblemCreatePage/ProgressHeader', () => ({
  ProgressHeader: () => <div data-testid="progress-header" />,
}));

vi.mock('@/components/generation/GenerationProgressBar', () => ({
  GenerationProgressBar: () => <div data-testid="generation-progress-bar" />,
}));

vi.mock('@/components/page/ProblemCreatePage/GenerationPhase', () => ({
  GenerationPhase: () => <div data-testid="generation-phase" />,
}));

describe('ProblemCreateView', () => {
  it('does not render top inline GenerationProgressBar (no duplicate percent at top)', () => {
    render(
      <ProblemCreateView
        step="start"
        phase="generating"
        progress={42}
        sourceType={0 as any}
        setSourceType={() => { }}
        fileInputRef={{ current: null }}
        onFileInputClick={() => { }}
        onFileSelect={() => { }}
        files={[]}
        isProcessing={false}
        isUploading={false}
        onRemoveFile={() => { }}
        exerciseOptions={{}}
        onChangeExerciseOptions={() => { }}
        documentOptions={{}}
        onChangeDocumentOptions={() => { }}
        proceedFromStart={() => { }}
        examDraft={{}}
        setExamDraft={() => { }}
        goToGeneration={() => { }}
        backToStart={() => { }}
        backToAnalysis={() => { }}
        backFromGeneration={() => { }}
        generationStep={0 as any}
        jobId={null}
        errorMessage={null}
        onPublish={() => { }}
      />
    );

    // Our rule: no top inline GenerationProgressBar should be present
    const topProgress = screen.queryAllByTestId('generation-progress-bar');
    expect(topProgress.length).toBeLessThanOrEqual(0);
  });
});
