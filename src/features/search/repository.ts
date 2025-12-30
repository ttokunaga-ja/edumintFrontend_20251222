/**
 * Search repository: API call wrapper
 * 
 * Updated to use centralized endpoints pattern (Phase 2+)
 * Legacy gateway imports removed
 */

import { ENDPOINTS, API_BASE_URL } from '@/services/api/endpoints';
import { getHeaders, handleResponse } from '@/services/api/httpClient';
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

  const url = `${API_BASE_URL}${ENDPOINTS.search.problems}?${params.toString()}`;
  const response = await fetch(url, { headers: getHeaders() });
  return handleResponse<SearchResponse>(response);
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

  const url = `${API_BASE_URL}${ENDPOINTS.search.problems}?${params.toString()}`;
  const response = await fetch(url, { headers: getHeaders() });
  return handleResponse<SearchResponse>(response);
}
