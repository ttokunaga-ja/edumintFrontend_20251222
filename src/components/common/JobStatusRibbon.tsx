// @ts-nocheck
// ========================================
// EduMint - JobStatusRibbon Component
// Storybook ID: features/job/JobStatusRibbon/*
// 5 States: queued/processing/paused/completed/error
// Position: sticky top-16
// Grid: 12px padding (py-3)
// ========================================

import React from 'react';
import { Clock, Cog, PauseCircle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/primitives/button';
import { cn } from '@/components/primitives/utils';
import type { JobStatus } from '@/types/health';

export interface JobStatusRibbonProps {
  /** Job identifier */
  jobId: string;

  /** Current job status */
  status: JobStatus;

  /** Progress percentage (0-100) */
  progress?: number;

  /** Status message */
  message?: string;

  /** Estimated time remaining */
  estimatedTimeRemaining?: string;

  /** Error message */
  errorMessage?: string;

  /** Pause handler */
  onPause?: () => void;

  /** Resume handler */
  onResume?: () => void;

  /** Cancel handler */
  onCancel?: () => void;

  /** Retry handler (for errors) */
  onRetry?: () => void;

  /** View result handler (for completed) */
  onViewResult?: () => void;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Configuration for each job status
 */
const statusConfig = {
  queued: {
    border: 'border-gray-200',
    accent: 'border-gray-300',
    text: 'text-gray-900',
    icon: Clock,
    iconColor: 'text-gray-600',
    label: 'ジョブを準備中...',
  },
  processing: {
    border: 'border-indigo-200',
    accent: 'border-indigo-600',
    text: 'text-indigo-900',
    icon: Cog,
    iconColor: 'text-indigo-600',
    label: '問題を生成中...',
  },
  paused: {
    border: 'border-yellow-200',
    accent: 'border-yellow-500',
    text: 'text-yellow-900',
    icon: PauseCircle,
    iconColor: 'text-yellow-600',
    label: '一時停止中',
  },
  completed: {
    border: 'border-green-200',
    accent: 'border-green-500',
    text: 'text-green-900',
    icon: CheckCircle,
    iconColor: 'text-green-600',
    label: '生成が完了しました！',
  },
  error: {
    border: 'border-red-200',
    accent: 'border-red-500',
    text: 'text-red-900',
    icon: XCircle,
    iconColor: 'text-red-600',
    label: 'エラーが発生しました',
  },
} as const;

/**
 * JobStatusRibbon Component
 * 
 * Sticky ribbon showing job generation status with actions
 * Position: sticky top-16 (below TopMenuBar)
 * 
 * States:
 * 1. Queued: Gray, no progress bar
 * 2. Processing: Indigo, animated progress bar + pause/cancel
 * 3. Paused: Yellow, static progress bar + resume/cancel
 * 4. Completed: Green, no progress bar + view result
 * 5. Error: Red, no progress bar + retry
 * 
 * @example
 * <JobStatusRibbon
 *   jobId="job_abc123"
 *   status="processing"
 *   progress={35}
 *   estimatedTimeRemaining="約 3 分"
 *   onPause={() => {}}
 *   onCancel={() => {}}
 * />
 */
export function JobStatusRibbon({
  jobId,
  status,
  progress,
  message,
  estimatedTimeRemaining,
  errorMessage,
  onPause,
  onResume,
  onCancel,
  onRetry,
  onViewResult,
  className,
}: JobStatusRibbonProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'sticky top-16 z-app-bar bg-white', // Below TopMenuBar (h-16), explicit L1 opacity
        `border-b ${config.border} border-l-4 ${config.accent}`,
        'py-3', // 12px padding (grid)
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4"> {/* 16px gap (grid) */}
          {/* Left: Icon + Status + Job ID */}
          <div className="flex items-center gap-3"> {/* 12px gap (grid) */}
            <Icon
              className={cn(
                'w-5 h-5',
                config.iconColor,
                status === 'processing' && 'animate-spin'
              )}
              aria-hidden="true"
            />
            <div>
              <span className={cn('text-sm font-medium', config.text)}>
                {config.label}
              </span>
              <span className="text-xs text-gray-600 ml-3">
                Job ID: {jobId}
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2"> {/* 8px gap (grid) */}
            {status === 'processing' && onPause && (
              <Button variant="outline" size="sm" onClick={onPause}>
                一時停止
              </Button>
            )}
            {status === 'paused' && onResume && (
              <Button variant="outline" size="sm" onClick={onResume}>
                再開
              </Button>
            )}
            {status === 'error' && onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                再試行
              </Button>
            )}
            {status === 'completed' && onViewResult && (
              <Button variant="default" size="sm" onClick={onViewResult}>
                結果を見る
              </Button>
            )}
            {(status === 'queued' || status === 'processing' || status === 'paused') && onCancel && (
              <Button variant="ghost" size="sm" onClick={onCancel}>
                キャンセル
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar (processing/paused only) */}
        {(status === 'processing' || status === 'paused') && progress !== undefined && (
          <div className="mt-3"> {/* 12px margin (grid) */}
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  'absolute inset-y-0 left-0 rounded-full transition-all duration-300',
                  status === 'processing' ? 'bg-indigo-600' : 'bg-yellow-600'
                )}
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            {estimatedTimeRemaining && (
              <p className="text-xs text-gray-600 mt-2">
                推定残り時間: {estimatedTimeRemaining}
              </p>
            )}
          </div>
        )}

        {/* Error Message */}
        {status === 'error' && errorMessage && (
          <p className="text-sm text-red-700 mt-2">
            {errorMessage}
          </p>
        )}

        {/* Completion Message */}
        {status === 'completed' && message && (
          <p className="text-sm text-green-700 mt-2">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
