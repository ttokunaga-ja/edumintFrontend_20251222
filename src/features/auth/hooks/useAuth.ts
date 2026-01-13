import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { login, register, getMe, logout } from '@/services/api/gateway/auth';

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
  const queryClient = useQueryClient();
  return useMutation<AuthResponse, Error, LoginRequest>({
    mutationFn: login,
    onSuccess: (data) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('authToken', data.token);
      }
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation<AuthResponse, Error, RegisterRequest>({
    mutationFn: (data) => {
      // confirmPasswordはバックエンドに送信しない
      const { confirmPassword, ...registerData } = data;
      return register(registerData);
    },
    onSuccess: (data) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('authToken', data.token);
      }
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('authToken');
      }
      queryClient.setQueryData(['auth'], null);
    },
  });
}

interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  role?: 'user' | 'admin';
}

export function useAuth() {
  const query = useQuery<User | null, Error>({
    queryKey: ['auth'],
    queryFn: async () => {
      try {
        return await getMe();
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
