/**
 * Search Store - Zustand
 * 
 * Manages search results, pagination, and UI state globally
 */

import { create } from 'zustand';
import type { SearchState, SearchResult, SearchError, SearchQuery } from '../types';

export const useSearchStore = create<SearchState>((set) => ({
  // Initial state
  results: [],
  total: 0,
  currentPage: 1,
  pageSize: 20,
  isLoading: false,
  error: null,
  lastQuery: null,

  // Actions
  setResults: (results: SearchResult[]) =>
    set({ results }),

  setPagination: (page: number, total: number, pageSize: number) =>
    set({ currentPage: page, total, pageSize }),

  setLoading: (isLoading: boolean) =>
    set({ isLoading }),

  setError: (error: SearchError | null) =>
    set({ error }),

  setLastQuery: (query: SearchQuery) =>
    set({ lastQuery: query }),

  reset: () =>
    set({
      results: [],
      total: 0,
      currentPage: 1,
      pageSize: 20,
      isLoading: false,
      error: null,
      lastQuery: null,
    }),
}));
