import api from '@/lib/axios';
import { Exam } from '@/types';
import { CONTENT_ENDPOINTS } from '@/services/api/endpoints';

export const getExam = async (id: number): Promise<Exam> => {
  const response = await api.get<Exam>(CONTENT_ENDPOINTS.detail(id.toString()));
  return response.data;
};

export const updateExam = async (id: number, updates: Partial<Exam>): Promise<Exam> => {
  const response = await api.put<Exam>(CONTENT_ENDPOINTS.update(id.toString()), updates);
  return response.data;
};