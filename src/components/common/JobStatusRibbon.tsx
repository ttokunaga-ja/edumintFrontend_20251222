// @ts-nocheck
// ========================================
// EduMint - JobStatusRibbon Component
// Storybook ID: features/job/JobStatusRibbon/*
// 5 States: queued/processing/paused/completed/error
// Position: sticky top-16
// Grid: 12px padding (py-3)
// ======================================== import React from 'react';
import { Clock, Cog, PauseCircle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/primitives/button'; import type { JobStatus } from '@/types/health'; export interface JobStatusRibbonProps { /** Job identifier */ jobId: string; /** Current job status */ status: JobStatus; /** Progress percentage (0-100) */ progress?: number; /** Status message */ message?: string; /** Estimated time remaining */ estimatedTimeRemaining?: string; /** Error message */ errorMessage?: string; /** Pause handler */ onPause?: () => void; /** Resume handler */ onResume?: () => void; /** Cancel handler */ onCancel?: () => void; /** Retry handler (for errors) */ onRetry?: () => void; /** View result handler (for completed) */ onViewResult?: () => void; /** Additional CSS classes */ ?: string;
} /** * Configuration for each job status */
const statusConfig = { queued: { border: undefined, accent: undefined, text: undefined, icon: Clock, iconColor: undefined, label: 'ジョブを準備中...', }, processing: { border: undefined, accent: undefined, text: undefined, icon: Cog, iconColor: undefined, label: '問題を生成中...', }, paused: { border: undefined, accent: undefined, text: undefined, icon: PauseCircle, iconColor: undefined, label: '一時停止中', }, completed: { border: undefined, accent: undefined, text: undefined, icon: CheckCircle, iconColor: undefined, label: '生成が完了しました！', }, error: { border: undefined, accent: undefined, text: undefined, icon: XCircle, iconColor: undefined, label: 'エラーが発生しました', },
} as const; /** * JobStatusRibbon Component * * Sticky ribbon showing job generation status with actions * Position: sticky top-16 (below TopMenuBar) * * States: * 1. Queued: Gray, no progress bar * 2. Processing: Indigo, animated progress bar + pause/cancel * 3. Paused: Yellow, static progress bar + resume/cancel * 4. Completed: Green, no progress bar + view result * 5. Error: Red, no progress bar + retry * * @example * <JobStatusRibbon * jobId="job_abc123" * status="processing" * progress={35} * estimatedTimeRemaining="約 3 分" * onPause={() => {}} * onCancel={() => {}} * /> */
export function JobStatusRibbon({ jobId, status, progress, message, estimatedTimeRemaining, errorMessage, onPause, onResume, onCancel, onRetry, onViewResult,
}: JobStatusRibbonProps) { const config = statusConfig[status]; const Icon = config.icon; return ( <div border-l-4 ${config.accent}${progress}%