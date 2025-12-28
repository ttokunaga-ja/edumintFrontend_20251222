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
    <div >
      <div style={{
      display: "flex"
    }>
        <span>{text}</span>
        <span>{safeProgress}%</span>
      </div>
      <div >
        <div
          
          style={{ width: `${safeProgress}%` }}
          data-testid="generation-progress-bar"
          aria-label="generation-progress"
        />
      </div>
    </div>
  );
};
