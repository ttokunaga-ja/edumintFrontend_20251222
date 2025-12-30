/**
 * useSearchFilters - Filter state management
 * 
 * Manages search filters independently from results
 */

import { useState, useCallback } from 'react';
import type { SearchFilterState } from '../types';

export function useSearchFilters(): SearchFilterState {
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  const setFilter = useCallback((key: string, value: unknown) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearFilter = useCallback((key: string) => {
    setFilters((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({});
  }, []);

  const getActiveFilterCount = useCallback(() => {
    return Object.values(filters).filter(
      (v) => v !== undefined && v !== null && v !== ''
    ).length;
  }, [filters]);

  return {
    filters,
    setFilter,
    clearFilter,
    clearAllFilters,
    getActiveFilterCount,
  };
}
