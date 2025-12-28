// @ts-nocheck
import { useState } from 'react';
import { Upload, File, CheckCircle, XCircle, Loader, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/primitives/button';

export interface UploadFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'validating' | 'success' | 'error';
  progress: number;
  errorMessage?: string;
}

interface FileUploadQueueProps {
  files: UploadFile[];
  onRemove: (fileId: string) => void;
  onRetry?: (fileId: string) => void;
  acceptedExtensions?: string[];
  maxFileSize?: number; // in MB
  className?: string;
}

const ACCEPTED_EXTENSIONS = ['pdf', 'txt', 'md', 'tex', "docx", "pptx", "xlsx", "csv", "png", "jpg", "jpeg", "json"];
const MAX_FILE_SIZE = 10; // MB

export function FileUploadQueue({
  files,
  onRemove,
  onRetry,
  acceptedExtensions = ACCEPTED_EXTENSIONS,
  maxFileSize = MAX_FILE_SIZE,
  className = '',
}: FileUploadQueueProps) {
  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const ext = getFileExtension(file.name);
    const sizeMB = file.size / (1024 * 1024);

    if (!acceptedExtensions.includes(ext)) {
      return {
        valid: false,
        error: `対応していない形式です。対応形式: ${acceptedExtensions.join(', ')}`,
      };
    }

    if (sizeMB > maxFileSize) {
      return {
        valid: false,
        error: `ファイルサイズが大きすぎます（最大: ${maxFileSize}MB）`,
      };
    }

    return { valid: true };
  };

  const getStatusIcon = (file: UploadFile) => {
    switch (file.status) {
      case 'pending':
        return <File  />;
      case 'uploading':
      case 'validating':
        return <Loader  />;
      case 'success':
        return <CheckCircle  />;
      case 'error':
        return <XCircle  />;
    }
  };

  const getStatusText = (file: UploadFile) => {
    switch (file.status) {
      case 'pending':
        return '待機中';
      case 'uploading':
        return `アップロード中 (${file.progress}%)`;
      case 'validating':
        return '検証中...';
      case 'success':
        return 'アップロード完了';
      case 'error':
        return file.errorMessage || 'エラーが発生しました';
    }
  };

  const getStatusColor = (file: UploadFile) => {
    switch (file.status) {
      case 'pending':
        return 'text-gray-600';
      case 'uploading':
      case 'validating':
        return 'text-indigo-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
    }
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div >
      {/* ヘッダー */}
      <div style={{
      display: "flex",
      alignItems: "center"
    }>
        <h3 >
          アップロード待機列 ({files.length})
        </h3>
        <p >
          対応形式: {acceptedExtensions.join(', ')} (最大 {maxFileSize}MB)
        </p>
      </div>

      {/* ファイルリスト */}
      <div >
        {files.map((uploadFile) => {
          const validation = validateFile(uploadFile.file);

          return (
            <div
              key={uploadFile.id}
              
            >
              <div style={{
      display: "flex",
      gap: "0.75rem"
    }>
                {/* アイコン */}
                <div >
                  {getStatusIcon(uploadFile)}
                </div>

                {/* ファイル情報 */}
                <div >
                  <div style={{
      display: "flex",
      gap: "0.5rem"
    }>
                    <div >
                      <p >
                        {uploadFile.file.name}
                      </p>
                      <p >
                        {getStatusText(uploadFile)}
                      </p>
                      {!validation.valid && uploadFile.status === 'pending' && (
                        <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.25rem"
    }>
                          <AlertTriangle  />
                          <p >{validation.error}</p>
                        </div>
                      )}
                    </div>

                    {/* アクションボタン */}
                    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.25rem"
    }>
                      {uploadFile.status === 'error' && onRetry && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRetry(uploadFile.id)}
                          
                        >
                          再試行
                        </Button>
                      )}
                      {(uploadFile.status === 'pending' || uploadFile.status === 'error') && (
                        <button
                          onClick={() => onRemove(uploadFile.id)}
                          
                        >
                          <X  />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* プログレスバー */}
                  {(uploadFile.status === 'uploading' || uploadFile.status === 'validating') && (
                    <div >
                      <div >
                        <div
                          
                          style={{ width: `${uploadFile.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* ファイルサイズ */}
                  <p >
                    {(uploadFile.file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* サマリー */}
      <div >
        <div style={{
      display: "flex",
      alignItems: "center"
    }>
          <span>
            成功: {files.filter(f => f.status === 'success').length} /
            エラー: {files.filter(f => f.status === 'error').length}
          </span>
          <span>
            待機中: {files.filter(f => f.status === 'pending').length}
          </span>
        </div>
      </div>
    </div>
  );
}
