import { useQuery, useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '@/lib/axios';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatar?: string;
  university?: string;
  faculty?: string;
  field?: 'science' | 'humanities';
  language?: 'ja' | 'en';
}

export function useUserProfile(userId: string) {
  return useQuery<UserProfile, AxiosError>({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await api.get<UserProfile>(`/users/${userId}`);
      return response.data;
    },
    enabled: !!userId,
  });
}

export function useUpdateProfile(userId: string) {
  return useMutation<UserProfile, AxiosError, Partial<UserProfile>>({
    mutationFn: async (data) => {
      const response = await api.put<UserProfile>(
        `/users/${userId}`,
        data
      );
      return response.data;
    },
  });
}
