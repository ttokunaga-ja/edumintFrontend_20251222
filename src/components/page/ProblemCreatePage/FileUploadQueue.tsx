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
        return <File className="w-5 h-5 text-gray-400" />;
      case 'uploading':
      case 'validating':
        return <Loader className="w-5 h-5 text-indigo-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
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
    <div className={`space-y-3 ${className}`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm text-gray-700">
          アップロード待機列 ({files.length})
        </h3>
        <p className="text-xs text-gray-500">
          対応形式: {acceptedExtensions.join(', ')} (最大 {maxFileSize}MB)
        </p>
      </div>

      {/* ファイルリスト */}
      <div className="space-y-2">
        {files.map((uploadFile) => {
          const validation = validateFile(uploadFile.file);

          return (
            <div
              key={uploadFile.id}
              className={`
                p-4 rounded-lg border transition-all
                ${uploadFile.status === 'error' ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}
                ${uploadFile.status === 'success' ? 'bg-green-50 border-green-200' : ''}
              `}
            >
              <div className="flex items-start gap-3">
                {/* アイコン */}
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(uploadFile)}
                </div>

                {/* ファイル情報 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">
                        {uploadFile.file.name}
                      </p>
                      <p className={`text-xs mt-0.5 ${getStatusColor(uploadFile)}`}>
                        {getStatusText(uploadFile)}
                      </p>
                      {!validation.valid && uploadFile.status === 'pending' && (
                        <div className="flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                          <p className="text-xs text-amber-600">{validation.error}</p>
                        </div>
                      )}
                    </div>

                    {/* アクションボタン */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {uploadFile.status === 'error' && onRetry && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRetry(uploadFile.id)}
                          className="h-7 px-2 text-xs"
                        >
                          再試行
                        </Button>
                      )}
                      {(uploadFile.status === 'pending' || uploadFile.status === 'error') && (
                        <button
                          onClick={() => onRemove(uploadFile.id)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* プログレスバー */}
                  {(uploadFile.status === 'uploading' || uploadFile.status === 'validating') && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${uploadFile.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* ファイルサイズ */}
                  <p className="text-xs text-gray-500 mt-1">
                    {(uploadFile.file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* サマリー */}
      <div className="pt-2 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
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
