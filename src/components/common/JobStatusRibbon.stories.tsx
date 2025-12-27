// @ts-nocheck
// ========================================
// JobStatusRibbon Storybook Stories
// ========================================

import type { Meta, StoryObj } from '@storybook/react';
import { JobStatusRibbon } from './JobStatusRibbon';

const meta: Meta<typeof JobStatusRibbon> = {
  title: 'Features/Job/JobStatusRibbon',
  component: JobStatusRibbon,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
JobStatusRibbon Component - Sticky ribbon showing job generation status

**Position:** sticky top-16 (below TopMenuBar)

**5 States:**
1. **Queued**: Gray background, clock icon, no progress bar
2. **Processing**: Indigo background, spinning cog icon, progress bar + pause/cancel buttons
3. **Paused**: Yellow background, pause icon, static progress bar + resume/cancel buttons
4. **Completed**: Green background, checkmark icon, no progress bar + view result button
5. **Error**: Red background, X icon, error message + retry button

**Grid System:**
- Padding: 12px vertical (py-3)
- Gap: 16px (gap-4), 12px (gap-3), 8px (gap-2)

**Use Cases:**
- GeneratingPage (job status tracking)
- Any long-running job with progress tracking
        `,
      },
    },
  },
  argTypes: {
    jobId: {
      description: 'Job identifier',
      control: 'text',
    },
    status: {
      description: 'Current job status',
      control: 'select',
      options: ['queued', 'processing', 'paused', 'completed', 'error'],
    },
    progress: {
      description: 'Progress percentage (0-100)',
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
    message: {
      description: 'Status message',
      control: 'text',
    },
    estimatedTimeRemaining: {
      description: 'Estimated time remaining',
      control: 'text',
    },
    errorMessage: {
      description: 'Error message',
      control: 'text',
    },
    onPause: {
      description: 'Handler called when user pauses the job',
      action: 'onPause',
    },
    onResume: {
      description: 'Handler called when user resumes the job',
      action: 'onResume',
    },
    onCancel: {
      description: 'Handler called when user cancels the job',
      action: 'onCancel',
    },
    onRetry: {
      description: 'Handler called when user retries a failed job',
      action: 'onRetry',
    },
    onViewResult: {
      description: 'Handler called when user views the result',
      action: 'onViewResult',
    },
  },
};

export default meta;
type Story = StoryObj<typeof JobStatusRibbon>;

// ========================================
// Story 1: Queued State
// ========================================
export const Queued: Story = {
  args: {
    jobId: 'job_abc123',
    status: 'queued',
    onCancel: () => console.log('Cancel job'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Initial state when job is created but not yet started processing.',
      },
    },
  },
};

// ========================================
// Story 2: Processing - Early Stage
// ========================================
export const ProcessingEarly: Story = {
  args: {
    jobId: 'job_def456',
    status: 'processing',
    progress: 15,
    estimatedTimeRemaining: '約 4 分',
    onPause: () => console.log('Pause job'),
    onCancel: () => console.log('Cancel job'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Job is processing - early stage (15% complete).',
      },
    },
  },
};

// ========================================
// Story 3: Processing - Mid Stage
// ========================================
export const ProcessingMid: Story = {
  args: {
    jobId: 'job_ghi789',
    status: 'processing',
    progress: 47,
    estimatedTimeRemaining: '約 2 分',
    onPause: () => console.log('Pause job'),
    onCancel: () => console.log('Cancel job'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Job is processing - mid stage (47% complete).',
      },
    },
  },
};

// ========================================
// Story 4: Processing - Late Stage
// ========================================
export const ProcessingLate: Story = {
  args: {
    jobId: 'job_jkl012',
    status: 'processing',
    progress: 85,
    estimatedTimeRemaining: '約 30 秒',
    onPause: () => console.log('Pause job'),
    onCancel: () => console.log('Cancel job'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Job is processing - late stage (85% complete).',
      },
    },
  },
};

// ========================================
// Story 5: Paused State
// ========================================
export const Paused: Story = {
  args: {
    jobId: 'job_mno345',
    status: 'paused',
    progress: 42,
    onResume: () => console.log('Resume job'),
    onCancel: () => console.log('Cancel job'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Job is paused at 42%. User can resume or cancel.',
      },
    },
  },
};

// ========================================
// Story 6: Completed State
// ========================================
export const Completed: Story = {
  args: {
    jobId: 'job_pqr678',
    status: 'completed',
    message: '演習問題の生成が完了しました！',
    onViewResult: () => console.log('View result'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Job completed successfully. User can view the result.',
      },
    },
  },
};

// ========================================
// Story 7: Error - Network Error
// ========================================
export const ErrorNetwork: Story = {
  args: {
    jobId: 'job_stu901',
    status: 'error',
    errorMessage: 'ネットワークエラー: サーバーに接続できませんでした',
    onRetry: () => console.log('Retry job'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Job failed due to network error. User can retry.',
      },
    },
  },
};

// ========================================
// Story 8: Error - File Processing Error
// ========================================
export const ErrorFileProcessing: Story = {
  args: {
    jobId: 'job_vwx234',
    status: 'error',
    errorMessage: 'ファイル処理エラー: アップロードされたファイルを解析できませんでした',
    onRetry: () => console.log('Retry job'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Job failed due to file processing error. User can retry.',
      },
    },
  },
};

// ========================================
// Story 9: Error - AI Generation Error
// ========================================
export const ErrorAIGeneration: Story = {
  args: {
    jobId: 'job_yz567',
    status: 'error',
    errorMessage: 'AI生成エラー: 問題の生成中にエラーが発生しました。設定を確認して再試行してください。',
    onRetry: () => console.log('Retry job'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Job failed due to AI generation error. User can retry with different settings.',
      },
    },
  },
};

// ========================================
// Story 10: Long Job ID
// ========================================
export const LongJobId: Story = {
  args: {
    jobId: 'job_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567',
    status: 'processing',
    progress: 50,
    estimatedTimeRemaining: '約 3 分',
    onPause: () => console.log('Pause job'),
    onCancel: () => console.log('Cancel job'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Test with a very long job ID to verify text truncation.',
      },
    },
  },
};

// ========================================
// Story 11: Interactive Demo (Default)
// ========================================
export const InteractiveDemo: Story = {
  args: {
    jobId: 'job_interactive',
    status: 'processing',
    progress: 30,
    estimatedTimeRemaining: '約 3 分',
    onPause: () => console.log('Pause job'),
    onResume: () => console.log('Resume job'),
    onCancel: () => console.log('Cancel job'),
    onRetry: () => console.log('Retry job'),
    onViewResult: () => console.log('View result'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo - try changing the status and progress controls to see different states.',
      },
    },
  },
};
