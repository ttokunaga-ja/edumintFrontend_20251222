import React from 'react';
import type { GenerationPhase } from '@/features/generation/types';

type Props = {
  progress: number;
  phase: GenerationPhase;
  label?: string;
};

export const GenerationProgressBar: React.FC<Props> = ({ progress, phase, label }) => {
  const safeProgress = Math.max(0, Math.min(progress, 100));
  const text = label ?? phase;

  return (
    <div className="space-y-1">
      <div style={{
      display: "flex"
    }>
        <span>{text}</span>
        <span>{safeProgress}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div
          className="h-2 rounded-full bg-indigo-500 transition-all"
          style={{ width: `${safeProgress}%` }}
          data-testid="generation-progress-bar"
          aria-label="generation-progress"
        />
      </div>
    </div>
  );
};
