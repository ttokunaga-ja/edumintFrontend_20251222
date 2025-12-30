/**
 * Tests for Search Store (Zustand)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useSearchStore } from '@/features/search';
import type { SearchResult } from '@/features/search';

describe('useSearchStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useSearchStore.setState({
      results: [],
      total: 0,
      currentPage: 1,
      pageSize: 20,
      isLoading: false,
      error: null,
      lastQuery: null,
    });
  });

  it('should initialize with default state', () => {
    const state = useSearchStore.getState();
    expect(state.results).toEqual([]);
    expect(state.total).toBe(0);
    expect(state.currentPage).toBe(1);
    expect(state.pageSize).toBe(20);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should set results', () => {
    const mockResults: SearchResult[] = [
      {
        type: 'problem' as const,
        id: 'test-1',
        title: 'Test Problem 1',
        data: {
          id: 'test-1',
          title: 'Test Problem 1',
          createdAt: new Date().toISOString(),
          author: { id: 'author-1', name: 'Author' },
        },
      },
    ];

    useSearchStore.getState().setResults(mockResults);
    expect(useSearchStore.getState().results).toEqual(mockResults);
  });

  it('should set pagination', () => {
    useSearchStore.getState().setPagination(2, 100, 20);
    const state = useSearchStore.getState();
    expect(state.currentPage).toBe(2);
    expect(state.total).toBe(100);
    expect(state.pageSize).toBe(20);
  });

  it('should set loading state', () => {
    useSearchStore.getState().setLoading(true);
    expect(useSearchStore.getState().isLoading).toBe(true);
    useSearchStore.getState().setLoading(false);
    expect(useSearchStore.getState().isLoading).toBe(false);
  });

  it('should reset to initial state', () => {
    // Set some data
    useSearchStore.getState().setPagination(5, 200, 50);
    useSearchStore.getState().setLoading(true);

    // Reset
    useSearchStore.getState().reset();

    const state = useSearchStore.getState();
    expect(state.results).toEqual([]);
    expect(state.total).toBe(0);
    expect(state.currentPage).toBe(1);
    expect(state.pageSize).toBe(20);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should calculate pagination metadata', () => {
    useSearchStore.setState({
      total: 100,
      currentPage: 2,
      pageSize: 20,
    });

    const state = useSearchStore.getState();
    const totalPages = Math.ceil(state.total / state.pageSize);
    const hasMore = state.currentPage < totalPages;

    expect(totalPages).toBe(5);
    expect(hasMore).toBe(true);
  });

  it('should calculate hasMore=false on last page', () => {
    useSearchStore.setState({
      total: 100,
      currentPage: 5,
      pageSize: 20,
    });

    const state = useSearchStore.getState();
    const totalPages = Math.ceil(state.total / state.pageSize);
    const hasMore = state.currentPage < totalPages;

    expect(hasMore).toBe(false);
  });

  it('should report empty when no results', () => {
    useSearchStore.setState({ results: [] });
    const state = useSearchStore.getState();
    expect(state.results).toHaveLength(0);
  });
});
