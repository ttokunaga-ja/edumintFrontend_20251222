import api from '@/lib/axios';
import { AUTH_ENDPOINTS } from '@/services/api/endpoints';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  confirmPassword?: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

interface User {
  id: string;
  email: string;
  username: string;
}

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(AUTH_ENDPOINTS.login, data);
  return response.data;
};

export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(AUTH_ENDPOINTS.register, data);
  return response.data;
};

export const getMe = async (): Promise<User> => {
  const response = await api.get<User>(AUTH_ENDPOINTS.profile);
  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.post(AUTH_ENDPOINTS.logout);
};