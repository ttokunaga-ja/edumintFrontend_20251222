import React from 'react';
import { Upload } from 'lucide-react';
import { Card } from '@/components/primitives/card';
import { Button } from '@/components/primitives/button';
import { FileUploadQueue, type UploadFile } from './FileUploadQueue';
import type { DocumentOptionsState, ExerciseOptionsState, SourceType } from '@/pages/ProblemCreatePage/hooks/useProblemCreateFlow';
import { SourceToggle } from './SourceToggle';
import { DocumentOptions } from './DocumentOptions';
import { ExerciseOptions } from './ExerciseOptions';
import { cn } from '@/shared/utils';

type StartPhaseProps = {
  sourceType: SourceType;
  onSourceTypeChange: (mode: SourceType) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileInputClick: () => void;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  files: UploadFile[];
  isUploading: boolean;
  onRemoveFile: (fileId: string) => void;
  exerciseOptions: ExerciseOptionsState;
  onChangeExerciseOptions: (options: ExerciseOptionsState) => void;
  documentOptions: DocumentOptionsState;
  onChangeDocumentOptions: (options: DocumentOptionsState) => void;
  onProceed: () => void;
};

export function StartPhase({
  sourceType,
  onSourceTypeChange,
  fileInputRef,
  onFileInputClick,
  onFileSelect,
  files,
  isUploading,
  onRemoveFile,
  exerciseOptions,
  onChangeExerciseOptions,
  documentOptions,
  onChangeDocumentOptions,
  onProceed,
}: StartPhaseProps) {
  // At least one file successfully uploaded (not pending/error), or no longer uploading with files present
  const hasSuccessfulFiles = files.some(f => f.status === 'success');
  const canProceed = hasSuccessfulFiles || (files.length > 0 && !isUploading);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div style={{
      display: "flex",
      justifyContent: "center"
    }}>
        <SourceToggle value={sourceType} onChange={onSourceTypeChange} />
      </div>

      <div className="space-y-6">
        <Card className="p-8 border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-700 to-blue-900" />
          <div style={{
      display: "flex",
      alignItems: "center"
    }}>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {sourceType === 'exercise' ? '過去問・既存問題のアップロード' : '学習資料のアップロード'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {sourceType === 'exercise'
                  ? '既存の演習問題（PDF/Text）をベースに類題を生成します。'
                  : '講義資料やレジュメ（PDF/Text）を解析して問題を生成します。'}
              </p>
            </div>
            <Upload className="w-8 h-8 text-indigo-400 opacity-50" />
          </div>

          <div
            style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
            onClick={onFileInputClick}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                if (fileInputRef.current) {
                  fileInputRef.current.files = e.dataTransfer.files;
                  const event = new Event('change', { bubbles: true });
                  fileInputRef.current.dispatchEvent(event);
                }
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.md,.tex"
              multiple
              className="hidden"
              onChange={onFileSelect}
            />
            <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
              <Upload className="w-8 h-8 text-indigo-600" />
            </div>
            <p className="font-bold text-indigo-900">ファイルを選択またはドラッグ＆ドロップ</p>
            <p className="text-xs text-indigo-400 mt-2">PDF, Text, Markdown, LaTeX (最大 20MB)</p>
          </div>

          <div className="mt-8">
            <FileUploadQueue files={files} onRemove={onRemoveFile} />
          </div>
        </Card>

        {sourceType === 'document' ? (
          <DocumentOptions options={documentOptions} onChange={onChangeDocumentOptions} />
        ) : (
          <ExerciseOptions options={exerciseOptions} onChange={onChangeExerciseOptions} />
        )}

        <Button
          className={cn(
            'w-full py-8 text-lg font-bold rounded-2xl shadow-indigo-200 shadow-xl bg-indigo-600 hover:bg-indigo-700 transition-all',
            !canProceed && 'opacity-60 cursor-not-allowed hover:translate-y-0',
          )}
          disabled={!canProceed}
          onClick={onProceed}
        >
          問題生成を開始する
        </Button>
      </div>
    </div>
  );
}
