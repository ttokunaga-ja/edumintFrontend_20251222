import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HomePage } from '@/pages/HomePage';

const mockUseServiceHealthContext = vi.fn();
const mockSearchExams = vi.fn();

vi.mock('@/contexts/ServiceHealthContext', () => ({
  useServiceHealthContext: () => mockUseServiceHealthContext(),
}));

vi.mock('@/features/search/repository', () => ({
  searchExams: (...args: any[]) => mockSearchExams(...args),
}));

describe('HomePage - service health and search', () => {
  beforeEach(() => {
    mockSearchExams.mockResolvedValue({
      exams: [],
      total: 0,
      page: 1,
      limit: 20,
      hasMore: false,
    });
  });

  it('disables search controls and shows alert when search service is outage', async () => {
    mockUseServiceHealthContext.mockReturnValue({
      health: {
        search: 'outage',
        content: 'operational',
        community: 'operational',
        notifications: 'operational',
        wallet: 'operational',
        aiGenerator: 'operational',
        lastUpdated: null,
        isLoading: false,
        error: null,
      },
      refresh: vi.fn(),
      fetchHealthSummary: vi.fn(),
      isServiceOperational: vi.fn(),
      shouldDisableCTA: () => true,
      isLoading: false,
      error: null,
    });

    render(<HomePage initialQuery="線形代数" />);

    await waitFor(() => expect(mockSearchExams).toHaveBeenCalled());

    expect(screen.getByText(/検索機能が一時的にご利用いただけません/)).toBeInTheDocument();
    const recommended = screen.getByRole('button', { name: 'おすすめ' });
    expect(recommended).toBeDisabled();
  });

  it('shows empty state when search returns zero results', async () => {
    mockUseServiceHealthContext.mockReturnValue({
      health: {
        search: 'operational',
        content: 'operational',
        community: 'operational',
        notifications: 'operational',
        wallet: 'operational',
        aiGenerator: 'operational',
        lastUpdated: null,
        isLoading: false,
        error: null,
      },
      refresh: vi.fn(),
      fetchHealthSummary: vi.fn(),
      isServiceOperational: vi.fn(),
      shouldDisableCTA: () => false,
      isLoading: false,
      error: null,
    });

    render(<HomePage initialQuery="微分積分" />);

    await waitFor(() => expect(mockSearchExams).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText('検索結果が見つかりませんでした')).toBeInTheDocument());

    const recommended = screen.getByRole('button', { name: 'おすすめ' });
    expect(recommended).not.toBeDisabled();
  });
});
