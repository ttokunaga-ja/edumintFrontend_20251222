import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '@/lib/axios';

interface UserProblemsResponse {
  exams: Array<{
    id: string;
    title: string;
    authorName?: string;
    university?: string;
    examName?: string;
    subjectName?: string;
    difficulty?: string;
    content?: string;
    views?: number;
    likes?: number;
  }>;
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export function useUserLiked(userId: string, page: number = 1, limit: number = 20) {
  return useQuery<UserProblemsResponse, AxiosError>({
    queryKey: ['user', userId, 'liked', page, limit],
    queryFn: async () => {
      const response = await api.get<UserProblemsResponse>(`/user/${userId}/liked`, {
        params: { page, limit },
      });
      return response.data;
    },
    enabled: !!userId,
  });
}