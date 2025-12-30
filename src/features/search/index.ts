/**
 * Search Feature Barrel Export
 * 
 * Exports domain types, hooks, and stores
 * Components should be imported directly from ./components
 */

// Domain types and schemas
export * from './types';

// Custom hooks
export { useSearch, useSearchFilters } from './hooks';

// Zustand store
export { useSearchStore } from './stores/searchStore';

// Legacy compatibility (models & repository)
export * from './models';
export * from './repository';
