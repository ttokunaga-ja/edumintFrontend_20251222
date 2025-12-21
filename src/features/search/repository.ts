// Search repository: thin wrappers around gateway clients
import {
  searchExams as searchExamsClient,
  suggestReadings as suggestReadingsClient,
} from '@/services/api/gateway/search';
import type { SearchFilters, ReadingSuggestion } from './models';

export const searchExams = (filters: SearchFilters) => searchExamsClient(filters);

export const suggestReadings = (
  query: string,
  entityType?: 'university' | 'faculty' | 'subject' | 'teacher'
): Promise<ReadingSuggestion[]> => suggestReadingsClient(query, entityType);

export type { SearchFilters } from './models';
