import type { HealthStatus } from '@/types/health';
import { API_BASE_URL, getHeaders, handleResponse } from '../httpClient';

export interface HealthResponse {
  status: HealthStatus;
  message: string;
  timestamp: string;
}

export interface HealthSummaryResponse {
  services: Array<{
    category: string;
    status: HealthStatus;
    message: string;
  }>;
  overallStatus: HealthStatus;
  timestamp: string;
}

export const getHealthContent = async (): Promise<HealthResponse> => {
  const response = await fetch(`${API_BASE_URL}/health/content`, {
    method: 'GET',
    headers: getHeaders(),
  });

  return handleResponse<HealthResponse>(response);
};

export const getHealthCommunity = async (): Promise<HealthResponse> => {
  const response = await fetch(`${API_BASE_URL}/health/community`, {
    method: 'GET',
    headers: getHeaders(),
  });

  return handleResponse<HealthResponse>(response);
};

export const getHealthNotifications = async (): Promise<HealthResponse> => {
  const response = await fetch(`${API_BASE_URL}/health/notifications`, {
    method: 'GET',
    headers: getHeaders(),
  });

  return handleResponse<HealthResponse>(response);
};

export const getHealthSearch = async (): Promise<HealthResponse> => {
  const response = await fetch(`${API_BASE_URL}/health/search`, {
    method: 'GET',
    headers: getHeaders(),
  });

  return handleResponse<HealthResponse>(response);
};

export const getHealthWallet = async (): Promise<HealthResponse> => {
  const response = await fetch(`${API_BASE_URL}/health/wallet`, {
    method: 'GET',
    headers: getHeaders(),
  });

  return handleResponse<HealthResponse>(response);
};

export const getHealthSummary = async (): Promise<HealthSummaryResponse> => {
  const response = await fetch(`${API_BASE_URL}/health/summary`, {
    method: 'GET',
    headers: getHeaders(),
  });

  return handleResponse<HealthSummaryResponse>(response);
};
