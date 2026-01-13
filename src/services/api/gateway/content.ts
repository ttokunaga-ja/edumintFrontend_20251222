import api from '@/lib/axios';
import { Exam } from '@/features/content/models';
import { CONTENT_ENDPOINTS } from '@/services/api/endpoints';

export const getExam = async (id: string): Promise<Exam> => {
  const response = await api.get<Exam>(CONTENT_ENDPOINTS.detail(id));
  return response.data;
};

export const updateExam = async (id: string, updates: Partial<Exam>): Promise<Exam> => {
  const response = await api.put<Exam>(CONTENT_ENDPOINTS.update(id), updates);
  return response.data;
};