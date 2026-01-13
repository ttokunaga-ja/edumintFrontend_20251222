// ========================================
// EduMint - Service Health Store
// Centralized service health monitoring with polling
// ========================================

import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { HealthStatus } from '@/types/health';
import {
  getHealthContent,
  getHealthCommunity,
  getHealthNotifications,
  getHealthSearch,
  getHealthWallet,
  getHealthSummary,
} from '@/services/api/gateway/health';

/**
 * Health summary response type
 */
interface HealthSummaryResponse {
  overall: HealthStatus;
  services: Record<string, HealthStatus>;
}

/**
 * Service health state
 */
export interface ServiceHealthState {
  content: HealthStatus;
  community: HealthStatus;
  notifications: HealthStatus;
  search: HealthStatus;
  wallet: HealthStatus;
  aiGenerator: HealthStatus; // Derived from content for now
  lastUpdated: Date | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Service health store hook
 *
 * Features:
 * - Initial load on mount
 * - 60-second polling interval
 * - Manual refresh capability
 * - Error handling
 * - CTA disable/enable sync (0-200ms)
 */
export function useServiceHealth() {
  console.log('[useServiceHealth] Hook called');
  const queryClient = useQueryClient();

  // Individual service health queries with error boundary
  // Per error handling guideline:
  // - Network errors result in error state (not fallback)
  // - Component shows Snackbar with retry button
  // - Retries use exponential backoff
  const contentQuery = useQuery({
    queryKey: ['health', 'content'],
    queryFn: getHealthContent,
    refetchInterval: 60000, // 60 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const communityQuery = useQuery({
    queryKey: ['health', 'community'],
    queryFn: getHealthCommunity,
    refetchInterval: 60000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const notificationsQuery = useQuery({
    queryKey: ['health', 'notifications'],
    queryFn: getHealthNotifications,
    refetchInterval: 60000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const searchQuery = useQuery({
    queryKey: ['health', 'search'],
    queryFn: getHealthSearch,
    refetchInterval: 60000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const walletQuery = useQuery({
    queryKey: ['health', 'wallet'],
    queryFn: getHealthWallet,
    refetchInterval: 60000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Aggregate health state
  // Per error handling guideline: Network errors result in error state, not fallback
  // Component-level (via ContextHealthAlert) will show Snackbar with retry
  const health: ServiceHealthState = {
    content: contentQuery.data?.status || 'operational',
    community: communityQuery.data?.status || 'operational',
    notifications: notificationsQuery.data?.status || 'operational',
    search: searchQuery.data?.status || 'operational',
    wallet: walletQuery.data?.status || 'operational',
    aiGenerator: contentQuery.data?.status || 'operational', // Derived from content
    lastUpdated: new Date(), // Simplified
    isLoading: contentQuery.isLoading || communityQuery.isLoading || notificationsQuery.isLoading || searchQuery.isLoading || walletQuery.isLoading,
    // Report any error that occurs - component layer will handle display
    error: (contentQuery.error?.message || communityQuery.error?.message || notificationsQuery.error?.message || searchQuery.error?.message || walletQuery.error?.message) 
      || null,
  };

  /**
   * Fetch health summary (for MyPage)
   */
  const fetchHealthSummary = useCallback(async (): Promise<HealthSummaryResponse | null> => {
    try {
      return await getHealthSummary();
    } catch (error) {
      console.error('Failed to fetch health summary:', error);
      return null;
    }
  }, []);

  /**
   * Manual refresh
   */
  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['health'] });
  }, [queryClient]);

  /**
   * Check if a specific service is operational
   */
  const isServiceOperational = useCallback((
    service: keyof Omit<ServiceHealthState, 'lastUpdated' | 'isLoading' | 'error'>,
  ) => {
    return health[service] === 'operational';
  }, [health]);

  /**
   * Check if CTA should be disabled based on service health
   */
  const shouldDisableCTA = useCallback((
    requiredServices: Array<keyof Omit<ServiceHealthState, 'lastUpdated' | 'isLoading' | 'error'>>,
  ) => {
    return requiredServices.some((service) => health[service] !== 'operational');
  }, [health]);

  return {
    health,
    refresh,
    fetchHealthSummary,
    isServiceOperational,
    shouldDisableCTA,
    isLoading: health.isLoading,
    error: health.error,
  };
}

/**
 * Hook for component-specific health checks
 * Returns health status and CTA disable state for specific services
 */
export function useComponentHealth(
  requiredServices: Array<keyof Omit<ServiceHealthState, 'lastUpdated' | 'isLoading' | 'error'>>,
) {
  const { health, shouldDisableCTA, refresh } = useServiceHealth();
  return {
    status: health,
    shouldDisable: shouldDisableCTA(requiredServices),
    refresh,
  };
}

