/**
 * Search Feature Domain Types
 * 
 * Zod schemas + TypeScript types for search functionality
 */

import { z } from 'zod';

// ===============================
// Search Query Types
// ===============================

export const SearchQuerySchema = z.object({
  keyword: z.string().min(1).max(255),
  filters: z.record(z.string(), z.unknown()).optional(),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;

// ===============================
// Search Result Types
// ===============================

export const SearchProblemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  createdAt: z.string().datetime(),
  author: z.object({
    id: z.string(),
    name: z.string(),
  }),
  likes: z.number().int().min(0).default(0),
  comments: z.number().int().min(0).default(0),
});

export type SearchProblem = z.infer<typeof SearchProblemSchema>;

export const SearchResultSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('problem'),
    id: z.string(),
    title: z.string(),
    data: SearchProblemSchema,
  }),
  z.object({
    type: z.literal('reading'),
    id: z.string(),
    title: z.string(),
    url: z.string().url(),
  }),
]);

export type SearchResult = z.infer<typeof SearchResultSchema>;

// ===============================
// Search Response Types
// ===============================

export const SearchResponseSchema = z.object({
  results: z.array(SearchResultSchema),
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  hasMore: z.boolean(),
});

export type SearchResponse = z.infer<typeof SearchResponseSchema>;

// ===============================
// Search Store State
// ===============================

export interface SearchState {
  // Data
  results: SearchResult[];
  total: number;
  currentPage: number;
  pageSize: number;

  // UI State
  isLoading: boolean;
  error: SearchError | null;
  lastQuery: SearchQuery | null;

  // Actions
  setResults: (results: SearchResult[]) => void;
  setPagination: (page: number, total: number, pageSize: number) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: SearchError | null) => void;
  setLastQuery: (query: SearchQuery) => void;
  reset: () => void;
}

// ===============================
// Error Types
// ===============================

export class SearchError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'SearchError';
  }
}

// ===============================
// Filter Types
// ===============================

export interface SearchFilter {
  key: string;
  label: string;
  type: 'text' | 'select' | 'multi-select' | 'range';
  options?: Array<{ value: string; label: string }>;
}

export interface SearchFilterState {
  filters: Record<string, unknown>;
  setFilter: (key: string, value: unknown) => void;
  clearFilter: (key: string) => void;
  clearAllFilters: () => void;
  getActiveFilterCount: () => number;
}
