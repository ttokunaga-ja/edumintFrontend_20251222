import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProblemCreateController } from '@/pages/ProblemCreatePage/hooks/useProblemCreateController';
import { mockWebSocket } from '../../../vitest.setup';

// Mock dependencies
vi.mock('@/features/content/hooks/useFileUpload', () => ({
    useFileUpload: () => ({
        files: [],
        isUploading: false,
        uploadFiles: vi.fn(),
        clearFiles: vi.fn(),
        lastUploadJobId: null,
        removeFile: vi.fn(),
    }),
}));

vi.mock('@/features/generation/api', () => ({
    confirmStructure: vi.fn().mockResolvedValue({}),
    getGenerationStatus: vi.fn()
}));

vi.mock('@/stores/jobStore', () => ({
    useJobStore: vi.fn(() => ({
        jobId: 'mock-job-id',
        phase: 'idle',
        data: null,
        error: null,
        setJob: vi.fn(),
        updatePhase: vi.fn(),
        setError: vi.fn(),
    })),
}));

describe('useProblemCreateController', () => {
    const mockOnNavigate = vi.fn();
    const mockOnGenerated = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('initializes with correct default phase', () => {
        const { result } = renderHook(() => useProblemCreateController({
            onNavigate: mockOnNavigate,
            onGenerated: mockOnGenerated
        }));
        expect(result.current.phase).toBe('input');
    });

    it('exposes currentStep and errorCode from useJobStore', () => {
        const { result } = renderHook(() => useProblemCreateController({
            onNavigate: mockOnNavigate,
            onGenerated: mockOnGenerated
        }));
        
        // 新しいフィールドが公開されていることを確認
        expect(result.current.detailedStep).toBeDefined();
        expect(result.current.errorCode).toBeUndefined();
        expect(result.current.generationStep).toBe('idle');
    });

    it('auto confirms structure when shouldConfirmStructure is false (polls until structure_review)', async () => {
        const api = await import('@/features/generation/api');
        const mockConfirmStructure = vi.mocked(api).confirmStructure as unknown as vi.Mock;
        const mockGetGenerationStatus = vi.mocked(api).getGenerationStatus as unknown as vi.Mock;

        // First call returns not-yet-in-review, then returns structure_review
        mockGetGenerationStatus
          .mockResolvedValueOnce({ jobId: 'mock-job-id', status: 'processing', currentStep: 'extracting', progress: 25 })
          .mockResolvedValueOnce({ jobId: 'mock-job-id', status: 'processing', currentStep: 'structure_review', progress: 50 })
          .mockResolvedValue({ jobId: 'mock-job-id', status: 'processing', currentStep: 'waiting_for_slot', progress: 55 });

        const { result } = renderHook(() => useProblemCreateController({
            onNavigate: mockOnNavigate,
            onGenerated: mockOnGenerated,
            shouldConfirmStructure: false,
        }));

        // Wait enough time for polling to observe the structure_review and call confirm
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 1200));
        });

        expect(mockConfirmStructure).toHaveBeenCalledWith('mock-job-id');
    });
});
