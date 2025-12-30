/**
 * useSearch - Main search hook
 * 
 * Performs search queries and updates global store
 */

import { useState, useCallback } from 'react';
import { ENDPOINTS, API_BASE_URL } from '@/services/api/endpoints';
import { getHeaders, handleResponse, ApiError } from '@/services/api/httpClient';
import {
  SearchQuery,
  SearchResponse,
  SearchResponseSchema,
  SearchQuerySchema,
  SearchError,
} from '../types';
import { useSearchStore } from '../stores/searchStore';

export function useSearch() {
  const {
    setResults,
    setLoading,
    setError,
    setPagination,
    setLastQuery,
    lastQuery,
  } = useSearchStore();

  const [localError, setLocalError] = useState<SearchError | null>(null);

  const search = useCallback(
    async (query: SearchQuery, page: number = 1) => {
      try {
        // Validate input
        const validatedQuery = SearchQuerySchema.parse({
          ...query,
          page,
        });

        setLoading(true);
        setError(null);
        setLocalError(null);

        // Build URL
        const params = new URLSearchParams();
        params.append('q', validatedQuery.keyword);
        params.append('page', validatedQuery.page.toString());
        params.append('limit', (validatedQuery.limit || 20).toString());

        if (validatedQuery.filters) {
          Object.entries(validatedQuery.filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              params.append(`filter[${key}]`, String(value));
            }
          });
        }

        // API call
        const url = `${API_BASE_URL}${ENDPOINTS.search.problems}?${params.toString()}`;
        const response = await fetch(url, {
          headers: getHeaders(),
        });

        const rawData = await handleResponse<SearchResponse>(response);

        // Validate response schema
        const validatedResponse = SearchResponseSchema.parse(rawData);

        // Update store
        setResults(validatedResponse.results);
        setPagination(
          validatedResponse.page,
          validatedResponse.total,
          validatedResponse.limit
        );
        setLastQuery(validatedQuery);

        return validatedResponse;
      } catch (err) {
        const error = err instanceof ApiError
          ? new SearchError(err.errorCode || 'SEARCH_FAILED', err.message, err.status)
          : err instanceof SearchError
          ? err
          : new SearchError('UNKNOWN_ERROR', 'An unknown error occurred');

        setError(error);
        setLocalError(error);
        console.error('[Search] Error:', error);

        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setResults, setLoading, setError, setPagination, setLastQuery]
  );

  const retry = useCallback(() => {
    if (lastQuery) {
      return search(lastQuery);
    }
  }, [search, lastQuery]);

  return {
    search,
    retry,
    error: localError,
    isRetryAvailable: lastQuery !== null,
  };
}
