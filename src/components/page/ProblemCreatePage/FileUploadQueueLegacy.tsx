// @ts-nocheck
// ========================================
// EduMint - FileUploadQueue Component
// Storybook ID: features/upload/FileUploadQueue/*
// 4 States: pending/uploading/success/error
// Grid: 16px padding (p-4), 8px spacing (space-y-2)
// ========================================

import React from 'react';
import { CheckCircle, XCircle, Loader2, FileIcon, X, RotateCw } from 'lucide-react';
import { Button } from '@/components/primitives/button';
import { cn } from '@/components/primitives/utils';
import type { UploadFile } from '@/types/health';

export interface FileUploadQueueProps {
  /** Array of files with upload status */
  files: UploadFile[];

  /** Remove file handler */
  onRemove: (fileId: string) => void;

  /** Retry failed upload handler */
  onRetry: (fileId: string) => void;

  /** Accepted file extensions */
  acceptedExtensions?: string[];

  /** Maximum file size in MB */
  maxFileSize?: number;

  /** Maximum number of files */
  maxFiles?: number;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Get icon component based on upload status
 */
function getStatusIcon(status: UploadFile['status']) {
  switch (status) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'error':
      return <XCircle className="w-5 h-5 text-red-600" />;
    case 'uploading':
      return <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />;
    case 'pending':
      return <FileIcon className="w-5 h-5 text-gray-400" />;
  }
}

/**
 * Get background and border styles based on upload status
 */
function getStatusStyles(status: UploadFile['status']) {
  switch (status) {
    case 'success':
      return 'bg-green-50 border-green-200';
    case 'error':
      return 'bg-red-50 border-red-200';
    case 'uploading':
      return 'bg-white border-indigo-300';
    case 'pending':
      return 'bg-gray-50 border-gray-200';
  }
}

/**
 * FileUploadQueue Component
 * 
 * Displays file upload queue with 4 states:
 * 1. Pending: Gray, 0% progress
 * 2. Uploading: White, animated progress bar
 * 3. Success: Green, 100% progress
 * 4. Error: Red, error message + retry button
 * 
 * @example
 * <FileUploadQueue
 *   files={[
 *     { id: '1', file: File, status: 'uploading', progress: 45 },
 *     { id: '2', file: File, status: 'success', progress: 100 },
 *   ]}
 *   onRemove={(id) => handleRemove(id)}
 *   onRetry={(id) => handleRetry(id)}
 *   acceptedExtensions={['pdf', 'txt', 'md', 'tex']}
 *   maxFileSize={10}
 * />
 */
export function FileUploadQueue({
  files,
  onRemove,
  onRetry,
  acceptedExtensions = ['pdf', 'txt', 'md', 'tex'],
  maxFileSize = 10,
  maxFiles = 10,
  className,
}: FileUploadQueueProps) {
  return (
    <div className={cn('space-y-2', className)}> {/* 8px spacing (grid) */}
      {files.map((file) => (
        <div
          key={file.id}
          className={cn(
            'p-4 rounded-lg border', // 16px padding (grid)
            getStatusStyles(file.status),
            'transition-all duration-200'
          )}
          role="listitem"
          aria-label={`${file.file.name} - ${file.status}`}
        >
          {/* Header: Icon + Name + Size + Remove */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 flex-1 min-w-0"> {/* 12px gap (grid) */}
              {getStatusIcon(file.status)}
              <span className="text-sm font-medium truncate">
                {file.file.name}
              </span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0"> {/* 12px gap (grid) */}
              <span className="text-xs text-gray-500">
                {(file.file.size / 1024 / 1024).toFixed(1)} MB
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(file.id)}
                className="h-8 w-8 p-0"
                aria-label={`${file.file.name}を削除`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          {(file.status === 'uploading' || file.status === 'pending' || file.status === 'success') && (
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  'absolute inset-y-0 left-0 rounded-full transition-all duration-300',
                  file.status === 'success' && 'bg-green-500',
                  file.status === 'uploading' && 'bg-indigo-600',
                  file.status === 'pending' && 'bg-gray-200'
                )}
                style={{ width: `${file.progress}%` }}
                role="progressbar"
                aria-valuenow={file.progress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          )}

          {/* Error Message + Retry */}
          {file.status === 'error' && (
            <>
              <p className="text-sm text-red-700 mt-2 mb-3">
                ⚠️ {file.errorMessage || 'アップロードに失敗しました'}
              </p>
              <div className="flex gap-2"> {/* 8px gap (grid) */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRetry(file.id)}
                  className="h-9" // 36px height
                >
                  <RotateCw className="w-4 h-4 mr-2" />
                  再試行
                </Button>
              </div>
            </>
          )}
        </div>
      ))}

      {/* Info footer */}
      {files.length > 0 && (
        <div className="text-xs text-gray-500 mt-2">
          {files.length} / {maxFiles} ファイル •
          対応形式: {acceptedExtensions.join(', ')} •
          最大 {maxFileSize}MB
        </div>
      )}
    </div>
  );
}
