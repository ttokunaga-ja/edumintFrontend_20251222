// @ts-nocheck
import { Check, Clock, Loader, AlertCircle, FileText, Search, Settings, Sparkles } from 'lucide-react';

export type GenerationStep = 'uploading' | 'analyzing' | 'structure-review' | 'generating' | 'complete' | 'error';

interface GenerationStatusTimelineProps {
  currentStep: GenerationStep;
  progress: number;
  jobId?: string;
  errorMessage?: string;
  className?: string;
}

const steps = [
  {
    id: 'uploading' as GenerationStep,
    label: 'ファイルアップロード',
    icon: FileText,
  },
  {
    id: 'analyzing' as GenerationStep,
    label: 'コンテンツ解析',
    icon: Search,
  },
  {
    id: 'structure-review' as GenerationStep,
    label: '構造確認',
    icon: Settings,
  },
  {
    id: 'generating' as GenerationStep,
    label: '問題生成中',
    icon: Sparkles,
  },
  {
    id: 'complete' as GenerationStep,
    label: '完了',
    icon: Check,
  },
];

export function GenerationStatusTimeline({
  currentStep,
  progress,
  jobId,
  errorMessage,
  className = '',
}: GenerationStatusTimelineProps) {
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const isError = currentStep === 'error';

  const getStepStatus = (stepIndex: number): 'complete' | 'current' | 'pending' | 'error' => {
    if (isError && stepIndex === currentStepIndex) return 'error';
    if (stepIndex < currentStepIndex) return 'complete';
    if (stepIndex === currentStepIndex) return 'current';
    return 'pending';
  };

  return (
    <div className={className}>
      {/* ジョブID表示 */}
      {jobId && (
        <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500">ジョブID</p>
          <p className="text-sm font-mono text-gray-700">{jobId}</p>
        </div>
      )}

      {/* タイムライン（デスクトップ） */}
      <div className="hidden md:block">
        <div className="relative">
          {/* 背景ライン */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />
          
          {/* プログレスライン */}
          <div 
            className="absolute top-5 left-0 h-0.5 bg-indigo-600 transition-all duration-500"
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          />

          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const status = getStepStatus(index);
              const StepIcon = step.icon;

              return (
                <div key={step.id} className="flex flex-col items-center">
                  {/* アイコン */}
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                      ${status === 'complete' ? 'bg-indigo-600 border-indigo-600 text-white' : ''}
                      ${status === 'current' ? 'bg-white border-indigo-600 text-indigo-600 animate-pulse' : ''}
                      ${status === 'pending' ? 'bg-white border-gray-300 text-gray-400' : ''}
                      ${status === 'error' ? 'bg-red-500 border-red-500 text-white' : ''}
                    `}
                  >
                    {status === 'complete' ? (
                      <Check className="w-5 h-5" />
                    ) : status === 'error' ? (
                      <AlertCircle className="w-5 h-5" />
                    ) : status === 'current' ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>

                  {/* ラベル */}
                  <p
                    className={`
                      mt-2 text-xs text-center whitespace-nowrap
                      ${status === 'complete' || status === 'current' ? 'text-gray-900' : 'text-gray-400'}
                      ${status === 'error' ? 'text-red-600' : ''}
                    `}
                  >
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* タイムライン（モバイル） */}
      <div className="md:hidden space-y-3">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const StepIcon = step.icon;

          return (
            <div key={step.id} className="flex items-center gap-3">
              {/* アイコン */}
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-all duration-300
                  ${status === 'complete' ? 'bg-indigo-600 border-indigo-600 text-white' : ''}
                  ${status === 'current' ? 'bg-white border-indigo-600 text-indigo-600 animate-pulse' : ''}
                  ${status === 'pending' ? 'bg-white border-gray-300 text-gray-400' : ''}
                  ${status === 'error' ? 'bg-red-500 border-red-500 text-white' : ''}
                `}
              >
                {status === 'complete' ? (
                  <Check className="w-4 h-4" />
                ) : status === 'error' ? (
                  <AlertCircle className="w-4 h-4" />
                ) : status === 'current' ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <StepIcon className="w-4 h-4" />
                )}
              </div>

              {/* ラベル */}
              <p
                className={`
                  text-sm flex-1
                  ${status === 'complete' || status === 'current' ? 'text-gray-900' : 'text-gray-400'}
                  ${status === 'error' ? 'text-red-600' : ''}
                `}
              >
                {step.label}
              </p>

              {/* 進行中インジケーター */}
              {status === 'current' && !isError && (
                <div className="text-xs text-indigo-600 font-medium">
                  {progress}%
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* プログレスバー */}
      {!isError && currentStep !== 'complete' && (
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>進行状況</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* エラーメッセージ */}
      {isError && errorMessage && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
