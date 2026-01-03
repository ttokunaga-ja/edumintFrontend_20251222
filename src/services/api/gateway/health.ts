import api from '@/lib/axios';

export interface HealthStatus {
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  message?: string;
}

/**
 * Health API calls - throws on connection errors
 * 
 * Per error handling guideline:
 * - Network errors should result in error state (not fallback)
 * - Errors are logged and thrown for component-level handling
 * - UI layer will show Snackbar with retry option
 */
export const getHealthContent = async (): Promise<HealthStatus> => {
  try {
    const response = await api.get<HealthStatus>('/health/content');
    return response.data;
  } catch (error) {
    console.error('[Health API] Failed to fetch content health:', error);
    throw error; // Propagate to useQuery error handler
  }
};

export const getHealthCommunity = async (): Promise<HealthStatus> => {
  try {
    const response = await api.get<HealthStatus>('/health/community');
    return response.data;
  } catch (error) {
    console.error('[Health API] Failed to fetch community health:', error);
    throw error;
  }
};

export const getHealthNotifications = async (): Promise<HealthStatus> => {
  try {
    const response = await api.get<HealthStatus>('/health/notifications');
    return response.data;
  } catch (error) {
    console.error('[Health API] Failed to fetch notifications health:', error);
    throw error;
  }
};

export const getHealthSearch = async (): Promise<HealthStatus> => {
  try {
    const response = await api.get<HealthStatus>('/health/search');
    return response.data;
  } catch (error) {
    console.error('[Health API] Failed to fetch search health:', error);
    throw error;
  }
};

export const getHealthWallet = async (): Promise<HealthStatus> => {
  try {
    const response = await api.get<HealthStatus>('/health/wallet');
    return response.data;
  } catch (error) {
    console.error('[Health API] Failed to fetch wallet health:', error);
    throw error;
  }
};

export const getHealthSummary = async (): Promise<HealthStatus> => {
  try {
    const response = await api.get<HealthStatus>('/health/summary');
    return response.data;
  } catch (error) {
    console.error('[Health API] Failed to fetch summary health:', error);
    throw error;
  }
};