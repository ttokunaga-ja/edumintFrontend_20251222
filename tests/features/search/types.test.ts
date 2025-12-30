/**
 * Tests for Search Types and Schemas
 */

import { describe, it, expect } from 'vitest';
import {
  SearchQuerySchema,
  SearchProblemSchema,
  SearchResultSchema,
  SearchResponseSchema,
} from '@/features/search';

describe('Search Schemas', () => {
  describe('SearchQuerySchema', () => {
    it('should validate valid search query', () => {
      const query = {
        keyword: 'test',
        filters: { difficulty: 'easy' },
        page: 1,
        limit: 20,
      };
      expect(() => SearchQuerySchema.parse(query)).not.toThrow();
    });

    it('should reject empty keyword', () => {
      const query = { keyword: '' };
      expect(() => SearchQuerySchema.parse(query)).toThrow();
    });

    it('should reject keyword exceeding 255 chars', () => {
      const query = { keyword: 'a'.repeat(256) };
      expect(() => SearchQuerySchema.parse(query)).toThrow();
    });

    it('should set default page to 1', () => {
      const query = SearchQuerySchema.parse({ keyword: 'test' });
      expect(query.page).toBe(1);
    });

    it('should set default limit to 20', () => {
      const query = SearchQuerySchema.parse({ keyword: 'test' });
      expect(query.limit).toBe(20);
    });
  });

  describe('SearchProblemSchema', () => {
    it('should validate valid problem', () => {
      const problem = {
        id: 'prob-1',
        title: 'Sample Problem',
        createdAt: new Date().toISOString(),
        author: { id: 'author-1', name: 'John Doe' },
      };
      expect(() => SearchProblemSchema.parse(problem)).not.toThrow();
    });

    it('should have default likes and comments', () => {
      const problem = {
        id: 'prob-1',
        title: 'Sample Problem',
        createdAt: new Date().toISOString(),
        author: { id: 'author-1', name: 'John Doe' },
      };
      const parsed = SearchProblemSchema.parse(problem);
      expect(parsed.likes).toBe(0);
      expect(parsed.comments).toBe(0);
    });
  });

  describe('SearchResultSchema', () => {
    it('should validate problem result', () => {
      const result = {
        type: 'problem' as const,
        id: 'result-1',
        title: 'Test Problem',
        data: {
          id: 'prob-1',
          title: 'Sample Problem',
          createdAt: new Date().toISOString(),
          author: { id: 'author-1', name: 'John Doe' },
        },
      };
      expect(() => SearchResultSchema.parse(result)).not.toThrow();
    });

    it('should validate reading result', () => {
      const result = {
        type: 'reading' as const,
        id: 'result-2',
        title: 'Test Reading',
        url: 'https://example.com',
      };
      expect(() => SearchResultSchema.parse(result)).not.toThrow();
    });

    it('should reject invalid URL', () => {
      const result = {
        type: 'reading' as const,
        id: 'result-2',
        title: 'Test Reading',
        url: 'not-a-url',
      };
      expect(() => SearchResultSchema.parse(result)).toThrow();
    });
  });

  describe('SearchResponseSchema', () => {
    it('should validate search response', () => {
      const response = {
        results: [
          {
            type: 'problem' as const,
            id: 'result-1',
            title: 'Test Problem',
            data: {
              id: 'prob-1',
              title: 'Sample Problem',
              createdAt: new Date().toISOString(),
              author: { id: 'author-1', name: 'John Doe' },
            },
          },
        ],
        total: 10,
        page: 1,
        limit: 20,
        hasMore: false,
      };
      expect(() => SearchResponseSchema.parse(response)).not.toThrow();
    });

    it('should reject negative total', () => {
      const response = {
        results: [],
        total: -1,
        page: 1,
        limit: 20,
        hasMore: false,
      };
      expect(() => SearchResponseSchema.parse(response)).toThrow();
    });

    it('should reject invalid page', () => {
      const response = {
        results: [],
        total: 0,
        page: 0,
        limit: 20,
        hasMore: false,
      };
      expect(() => SearchResponseSchema.parse(response)).toThrow();
    });
  });
});
