import { axiosInstance } from '@/lib/axios';
import { FILE_ENDPOINTS } from '@/services/api/endpoints';

export interface CreateUploadJobResponse {
  jobId: string;
  uploadUrl: string;
}

export const createUploadJob = async (fileName: string, fileType: string): Promise<CreateUploadJobResponse> => {
  const { data } = await axiosInstance.post<CreateUploadJobResponse>(FILE_ENDPOINTS.createUploadJob, {
    fileName,
    fileType,
  });
  return data;
};

export const notifyUploadComplete = async (jobId: string): Promise<void> => {
  await axiosInstance.post(FILE_ENDPOINTS.notifyUploadComplete(jobId));
};
