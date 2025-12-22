import React from 'react';
import { cn } from '@/shared/utils';
import type { CreateStep } from '@/pages/ProblemCreatePage/hooks/useProblemCreateFlow';

const steps: { id: CreateStep; label: string }[] = [
  { id: 'start', label: '生成開始' },
  { id: 'analysis', label: '構造解析' },
  { id: 'generation', label: '生成完了' },
];

type ProgressHeaderProps = {
  currentStep: CreateStep;
};

function ProgressHeaderComponent({ currentStep }: ProgressHeaderProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <div className="w-full bg-white border-b border-gray-200 sticky top-16 z-10 pt-4 pb-4 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex justify-between">
          {/* Background Line - aligned with center of 32px (h-8) circles */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-100 -translate-y-1/2" />

          {/* Progress Line */}
          <div
            className="absolute top-4 left-0 h-0.5 bg-indigo-600 -translate-y-1/2 transition-all duration-500"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((step, index) => (
            <div key={step.id} className="relative flex flex-col items-center z-10">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 bg-white ring-2', // Add bg-white to hide line behind
                  index < currentIndex
                    ? 'bg-indigo-600 text-white ring-indigo-600 border-none'
                    : index === currentIndex
                      ? 'bg-indigo-600 text-white ring-indigo-50 ring-offset-2 ring-offset-white' // Ring effect
                      : 'bg-white text-gray-400 ring-gray-200',
                )}
              >
                {index < currentIndex ? '✓' : index + 1}
              </div>
              <span
                className={cn(
                  'mt-2 whitespace-nowrap text-xs font-medium',
                  index <= currentIndex ? 'text-indigo-600 font-bold' : 'text-gray-400',
                )}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const ProgressHeader = React.memo(ProgressHeaderComponent);
