import React from 'react';
import TopMenuBar from '@/components/common/TopMenuBar';
import { Button } from '@/components/primitives/button';
import { Card } from '@/components/primitives/card';
import { ProblemSettingsBlock } from '@/components/page/ProblemCreatePage/ProblemSettingsBlock';
import { GenerationOptionsBlock } from '@/components/page/ProblemCreatePage/GenerationOptionsBlock';
import { FileUploadQueue } from '@/components/page/ProblemCreatePage/FileUploadQueue';
import { GenerationStatusTimeline } from '@/components/page/ProblemCreatePage/GenerationStatusTimeline';
import { useProblemCreateController } from './ProblemCreatePage/hooks/useProblemCreateController';
import type { Page, User } from '@/types';

export interface ProblemCreatePageProps {
  user: User;
  onNavigate: (page: Page, problemId?: string) => void;
  onLogout: () => void;
  jobId?: string;
  onGenerated?: (problemId: string) => void;
}

export function ProblemCreatePage({
  user,
  onNavigate,
  onLogout,
  jobId,
  onGenerated,
}: ProblemCreatePageProps) {
  const {
    fileInputRef,
    phase,
    problemSettings,
    generationOptions,
    setProblemSettings,
    setGenerationOptions,
    files,
    isUploading,
    lastUploadJobId,
    activeJobId,
    generationStep,
    progress,
    errorMessage,
    generatedProblemId,
    removeFile,
    handleFileSelect,
    handleStartClick,
    handleReset,
  } = useProblemCreateController({ onNavigate, onGenerated, jobId });

  return (
    <div className="min-h-screen bg-gray-50">
      <TopMenuBar />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">ようこそ、{user.username} さん</p>
            <h1 className="text-2xl font-semibold text-gray-900">ProblemCreatePage</h1>
            <p className="text-gray-600">問題の設定とアップロードを行い、AI 生成を開始します。</p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            ログアウト
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ProblemSettingsBlock
            settings={problemSettings}
            onChange={setProblemSettings}
            className="lg:col-span-2"
          />
          <GenerationOptionsBlock
            options={generationOptions}
            onChange={setGenerationOptions}
            isProcessing={phase === 'generating' || phase === 'uploading'}
            className="lg:col-span-1"
          />
        </div>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">資料アップロード</h3>
              <p className="text-sm text-gray-600">PDF やテキストをアップロードし、AI 生成を開始します。</p>
            </div>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.md,.tex"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button onClick={handleStartClick} disabled={isUploading || phase === 'generating'}>
                ファイルを選択してアップロード
              </Button>
              {files.length > 0 && (
                <Button variant="ghost" onClick={handleReset} disabled={isUploading || phase === 'generating'}>
                  リセット
                </Button>
              )}
            </div>
          </div>

          <FileUploadQueue files={files} onRemove={removeFile} />
        </Card>

        {(phase === 'generating' || phase === 'complete' || phase === 'error') && (
          <Card className="p-6">
            <GenerationStatusTimeline
              currentStep={generationStep}
              progress={progress}
              jobId={activeJobId ?? lastUploadJobId ?? undefined}
              errorMessage={errorMessage ?? undefined}
            />

            {phase === 'complete' && (
              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={() => onNavigate('home')}>ホームへ戻る</Button>
                {generatedProblemId && (
                  <Button variant="outline" onClick={() => onNavigate('problem-view', generatedProblemId)}>
                    生成した問題を確認
                  </Button>
                )}
              </div>
            )}

            {phase === 'error' && (
              <div className="mt-4 text-sm text-red-600">
                エラーが発生しました。再度アップロードをお試しください。
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

export default ProblemCreatePage;
