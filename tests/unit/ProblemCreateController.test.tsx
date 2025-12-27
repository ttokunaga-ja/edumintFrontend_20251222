import React from 'react';
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

// Mock the Generation API confirmStructure
vi.mock('@/features/generation/api', () => ({
  confirmStructure: vi.fn(() => Promise.resolve()),
}));

// Mock the hooks used by the controller
const mockGoToGeneration = vi.fn();
vi.mock('@/pages/ProblemCreatePage/hooks/useProblemCreateFlow', () => ({
  useProblemCreateFlow: () => ({
    step: 'start',
    proceedFromStart: vi.fn(),
    goToAnalysis: vi.fn(),
    goToGeneration: mockGoToGeneration,
    backToStart: vi.fn(),
    backToAnalysis: vi.fn(),
    backFromGeneration: vi.fn(),
    exerciseOptions: {},
    setExerciseOptions: vi.fn(),
    documentOptions: {},
    setDocumentOptions: vi.fn(),
    examDraft: undefined,
    setExamDraft: vi.fn(),
  }),
}));

vi.mock('@/pages/ProblemCreatePage/hooks/useProblemCreateController', () => ({
  useProblemCreateController: () => ({
    fileInputRef: { current: null },
    phase: 'analysis',
    files: [],
    isUploading: false,
    removeFile: vi.fn(),
    handleFileSelect: vi.fn(),
    handleStartClick: vi.fn(),
    generationStep: 'structure_review',
    progress: 0,
    errorMessage: undefined,
    activeJobId: 'job-123',
    generatedProblemId: undefined,
  }),
}));

// Replace the actual view with a simple test harness that exposes the goToGeneration prop
vi.mock('@/pages/ProblemCreatePage/ProblemCreateView', () => ({
  __esModule: true,
  default: (props: any) => (
    <div>
      <button onClick={props.goToGeneration}>GoToGen</button>
    </div>
  ),
}));

import ProblemCreateController from '@/pages/ProblemCreatePage/ProblemCreateController';
import { confirmStructure } from '@/features/generation/api';

describe('ProblemCreateController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls confirmStructure with active job id before navigating to generation', async () => {
    render(<ProblemCreateController onNavigate={vi.fn()} />);

    const btn = screen.getByRole('button', { name: /GoToGen/i });
    fireEvent.click(btn);

    expect(confirmStructure).toHaveBeenCalledWith('job-123');
    // goToGeneration is called after the async confirmStructure resolves
    await (await import('@testing-library/react')).waitFor(() => expect(mockGoToGeneration).toHaveBeenCalled());
  });
});
