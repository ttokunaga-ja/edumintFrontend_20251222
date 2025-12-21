import { useState } from 'react';
import { createUploadJob, notifyUploadComplete } from '@/services/api/gateway/files';
import type { UploadFile } from '@/components/page/ProblemCreatePage/FileUploadQueue';

const ACCEPTED_EXTENSIONS = ['pdf', 'txt', 'md', 'tex'];
const MAX_FILE_SIZE_MB = 10;

const isValidFile = (file: File) => {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const sizeMB = file.size / (1024 * 1024);
  if (!ACCEPTED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: `対応していない形式です (${ACCEPTED_EXTENSIONS.join(', ')})` };
  }
  if (sizeMB > MAX_FILE_SIZE_MB) {
    return { valid: false, error: `ファイルサイズが大きすぎます（最大 ${MAX_FILE_SIZE_MB}MB）` };
  }
  return { valid: true };
};

export const useFileUpload = () => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [lastUploadJobId, setLastUploadJobId] = useState<string | null>(null);

  const uploadFiles = async (selected: File[]): Promise<string | undefined> => {
    if (!selected.length) return;
    setIsUploading(true);

    const newEntries: UploadFile[] = selected.map((file) => ({
      id: crypto.randomUUID(),
      file,
      status: 'pending',
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...newEntries]);

    let primaryJobId: string | undefined;

    for (const entry of newEntries) {
      const validation = isValidFile(entry.file);
      if (!validation.valid) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id
              ? { ...f, status: 'error', errorMessage: validation.error, progress: 0 }
              : f,
          ),
        );
        continue;
      }

      setFiles((prev) =>
        prev.map((f) => (f.id === entry.id ? { ...f, status: 'uploading', progress: 10 } : f)),
      );

      try {
        const { jobId, uploadUrl } = await createUploadJob(entry.file.name, entry.file.type);
        await fetch(uploadUrl, { method: 'PUT', body: entry.file });
        await notifyUploadComplete(jobId);

        setFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id ? { ...f, status: 'success', progress: 100 } : f,
          ),
        );

        if (!primaryJobId) {
          primaryJobId = jobId;
          setLastUploadJobId(jobId);
        }
      } catch (error) {
        console.error('Upload failed', error);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id
              ? { ...f, status: 'error', errorMessage: 'アップロードに失敗しました', progress: 0 }
              : f,
          ),
        );
      }
    }

    setIsUploading(false);
    return primaryJobId;
  };

  const removeFile = (fileId: string) => setFiles((prev) => prev.filter((f) => f.id !== fileId));
  const clearFiles = () => setFiles([]);

  return {
    files,
    isUploading,
    lastUploadJobId,
    uploadFiles,
    removeFile,
    clearFiles,
  };
};
