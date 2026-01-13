/**
 * Search repository: API call wrapper
 * 
 * Updated to use centralized endpoints pattern (Phase 2+)
 * Legacy gateway imports removed
 */

import { ENDPOINTS } from '@/services/api/endpoints';
import { axiosInstance } from '@/lib/axios';
import type { SearchResponse } from './types';

/**
 * Search for problems by query
 * @deprecated Use useSearch hook instead
 */
export async function searchExams(
  query: string,
  filters?: Record<string, unknown>
): Promise<SearchResponse> {
  const params = new URLSearchParams();
  params.append('q', query);

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(`filter[${key}]`, String(value));
      }
    });
  }

  const response = await axiosInstance.get<SearchResponse>(ENDPOINTS.search.problems, {
    params,
  });
  return response.data;
}

/**
 * Suggest readings by query
 * @deprecated Use useSearch hook instead
 */
export async function suggestReadings(
  query: string,
  entityType?: 'university' | 'faculty' | 'subject' | 'teacher'
): Promise<SearchResponse> {
  const params = new URLSearchParams();
  params.append('q', query);

  if (entityType) {
    params.append('type', entityType);
  }

  const response = await axiosInstance.get<SearchResponse>(ENDPOINTS.search.problems, {
    params,
  });
  return response.data;
}
