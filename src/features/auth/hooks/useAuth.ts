import { useQuery, useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '@/lib/axios';

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
    displayName?: string;
  };
}

export function useLogin() {
  return useMutation<AuthResponse, AxiosError, LoginRequest>({
    mutationFn: async (data) => {
      const response = await api.post<AuthResponse>('/auth/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('authToken', data.token);
      }
    },
  });
}

export function useRegister() {
  return useMutation<AuthResponse, AxiosError, RegisterRequest>({
    mutationFn: async (data) => {
      // confirmPasswordはバックエンドに送信しない
      const { confirmPassword, ...registerData } = data;
      const response = await api.post<AuthResponse>('/auth/register', registerData);
      return response.data;
    },
    onSuccess: (data) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('authToken', data.token);
      }
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSuccess: () => {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('authToken');
      }
    },
  });
}

interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
}

export function useAuth() {
  const query = useQuery<User | null, AxiosError>({
    queryKey: ['auth'],
    queryFn: async () => {
      try {
        const response = await api.get<User>('/auth/me');
        return response.data;
      } catch (error) {
        return null;
      }
    },
    retry: false,
  });

  return {
    user: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
