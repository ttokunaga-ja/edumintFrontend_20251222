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
    <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={cn(
            'px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 whitespace-nowrap',
            value === option.id
              ? 'bg-indigo-600 text-white shadow-md ring-1 ring-indigo-300'
              : 'text-gray-500 hover:text-gray-900',
          )}
          aria-pressed={value === option.id}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
});
