/**
 * useSearch - Main search hook
 * 
 * Performs search queries and updates global store
 */

import { useState, useCallback } from 'react';
import { ENDPOINTS } from '@/services/api/endpoints';
import { axiosInstance } from '@/lib/axios';
import {
  SearchQuery,
  SearchResponse,
  SearchResponseSchema,
  SearchQuerySchema,
  SearchError,
} from '../types';
import { useSearchStore } from '../stores/searchStore';
import { AxiosError } from 'axios';

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
        const response = await axiosInstance.get<SearchResponse>(
          ENDPOINTS.search.problems,
          { params }
        );

        const rawData = response.data;

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
      } catch (err: any) {
        let error: SearchError;

        if (err instanceof AxiosError) {
          error = new SearchError(
            err.code || 'SEARCH_FAILED',
            err.message,
            err.response?.status || 500
          );
        } else if (err instanceof SearchError) {
          error = err;
        } else {
          error = new SearchError('UNKNOWN_ERROR', 'An unknown error occurred');
        }

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
