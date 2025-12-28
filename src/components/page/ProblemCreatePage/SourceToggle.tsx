import React from 'react';
import { cn } from '@/shared/utils';
import type { SourceType } from '@/pages/ProblemCreatePage/hooks/useProblemCreateFlow';

type SourceToggleProps = {
  value: SourceType;
  onChange: (value: SourceType) => void;
};

export const SourceToggle = React.memo(function SourceToggle({
  value,
  onChange,
}: SourceToggleProps) {
  const options: { id: SourceType; label: string }[] = [
    { id: 'exercise', label: '演習問題から生成' },
    { id: 'document', label: '資料から生成' },
  ];

  return (
    <div style={{
      display: "flex"
    }>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          
          aria-pressed={value === option.id}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
});
