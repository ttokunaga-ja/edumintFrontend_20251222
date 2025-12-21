import { API_BASE_URL, getHeaders, handleResponse, ApiError } from '../httpClient';

export interface UploadJobResponse {
  jobId: string;
  uploadUrl: string;
  expiresAt: string;
}

export const createUploadJob = async (fileName: string, fileType: string): Promise<UploadJobResponse> => {
  const response = await fetch(`${API_BASE_URL}/files/upload-job`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ fileName, fileType }),
  });

  return handleResponse<UploadJobResponse>(response);
};

export const notifyUploadComplete = async (jobId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/files/upload-complete`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ jobId }),
  });

  if (!response.ok) {
    throw new ApiError(response.status, 'Failed to notify upload complete');
  }
};
