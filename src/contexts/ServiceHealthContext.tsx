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

const ServiceHealthContext = createContext<ServiceHealthContextValue | undefined>(undefined);

interface ServiceHealthProviderProps {
  children: ReactNode;
}

export function ServiceHealthProvider({ children }: ServiceHealthProviderProps) {
  const serviceHealth = useServiceHealth();
  return (
    <ServiceHealthContext.Provider value={serviceHealth}>
      {children}
    </ServiceHealthContext.Provider>
  );
}

export function useServiceHealthContext(): ServiceHealthContextValue {
  const context = useContext(ServiceHealthContext);
  if (!context) {
    throw new Error('useServiceHealthContext must be used within ServiceHealthProvider');
  }
  return context;
}
