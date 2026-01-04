// ========================================
// EduMint - Service Health Context
// Shared service health state across all pages
// Polling interval: 60s
// CTA sync: 0-200ms
// ========================================

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useServiceHealth, type ServiceHealthState } from '../hooks/useServiceHealth';

interface ServiceHealthContextValue {
  health: ServiceHealthState;
  refresh: () => void;
  fetchHealthSummary: () => Promise<any>;
  isServiceOperational: (service: keyof Omit<ServiceHealthState, 'lastUpdated' | 'isLoading' | 'error'>) => boolean;
  shouldDisableCTA: (requiredServices: Array<keyof Omit<ServiceHealthState, 'lastUpdated' | 'isLoading' | 'error'>>) => boolean;
  isLoading: boolean;
  error: string | null;
}

const ServiceHealthContext = createContext<ServiceHealthContextValue | undefined>(undefined); interface ServiceHealthProviderProps { children: ReactNode;
} /** * ServiceHealthProvider * * Provides centralized service health state to all components * - Polls health status every 60 seconds * - Syncs CTA disable state within 0-200ms * - Shared across HomePage, ProblemViewEditPage, ProblemCreatePage, GeneratingPage, MyPage * * @example * // In App.tsx * <ServiceHealthProvider> * <YourApp /> * </ServiceHealthProvider> * * // In any component * const { health, shouldDisableCTA } = useServiceHealthContext(); */
export function ServiceHealthProvider({ children }: ServiceHealthProviderProps) { const serviceHealth = useServiceHealth(); return ( <ServiceHealthContext.Provider value={serviceHealth}> {children} </ServiceHealthContext.Provider> );
} /** * useServiceHealthContext * * Hook to access service health state from context * Must be used within ServiceHealthProvider * * @example * const { health, shouldDisableCTA } = useServiceHealthContext(); * const isDisabled = shouldDisableCTA(['content', 'wallet']); */
export function useServiceHealthContext(): ServiceHealthContextValue { const context = useContext(ServiceHealthContext); if (!context) { throw new Error('useServiceHealthContext must be used within ServiceHealthProvider'); } return context;
}