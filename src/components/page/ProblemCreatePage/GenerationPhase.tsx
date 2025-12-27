import React, { useMemo } from 'react';
import { AlertTriangle, Loader2, PauseCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/primitives/button';
import { Card } from '@/components/primitives/card';
import { ProblemMetaBlock } from '@/components/page/ProblemViewEditPage/ProblemMetaBlock';
import type { GenerationCurrentStep } from '@/services/api/gateway/generation';
import { GenerationResultEditor } from '../ProblemEditor/GenerationResultEditor';
import type { GenerationPhase as GenerationStep } from '@/features/generation/types';

type GenerationPhaseProps = {
  exam: any;
  onChange: (exam: any) => void;
  onBack: () => void;
  onPublish: () => void;
  currentStep?: GenerationStep;
  detailedStep?: GenerationCurrentStep;
  progress?: number;
  jobId?: string | null;
  errorMessage?: string | null;
  shouldConfirmStructure?: boolean;
};

function StructureStatusCard({
  currentStep,
  shouldConfirmStructure,
  isPaused,
  isError,
  errorMessage,
}: {
  currentStep: GenerationCurrentStep;
  shouldConfirmStructure: boolean;
  isPaused: boolean;
  isError: boolean;
  errorMessage?: string | null;
}) {
  return (
    <Card className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4" aria-busy={!isPaused && !isError}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {isError ? (
            <AlertTriangle className="w-5 h-5 text-red-500" />
          ) : isPaused ? (
            <PauseCircle className="w-5 h-5 text-amber-500" />
          ) : (
            <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
          )}
          <div className="text-sm font-semibold text-gray-900">
            Structure_{currentStep}
            {!shouldConfirmStructure && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 px-2 py-0.5 text-[11px] font-semibold">
                構造確認スキップ
              </span>
            )}
          </div>
        </div>
        <div className="text-[11px] text-gray-500 uppercase tracking-wide">
          {isError ? 'error' : isPaused ? 'paused' : 'processing'}
        </div>
      </div>
      {errorMessage && isError && (
        <p className="mt-3 text-xs text-red-700 leading-relaxed">{errorMessage}</p>
      )}
    </Card>
  );
}

function GenerationStatusCard({
  currentStep,
  shouldConfirmStructure,
  isPaused,
  isError,
  errorMessage,
}: {
  currentStep: GenerationCurrentStep;
  shouldConfirmStructure: boolean;
  isPaused: boolean;
  isError: boolean;
  errorMessage?: string | null;
}) {
  return (
    <Card className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4" aria-busy={!isPaused && !isError}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {isError ? (
            <AlertTriangle className="w-5 h-5 text-red-500" />
          ) : isPaused ? (
            <PauseCircle className="w-5 h-5 text-amber-500" />
          ) : (
            <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
          )}
          <div className="text-sm font-semibold text-gray-900">
            Generation_{currentStep}
            {!shouldConfirmStructure && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 px-2 py-0.5 text-[11px] font-semibold">
                構造確認スキップ
              </span>
            )}
          </div>
        </div>
        <div className="text-[11px] text-gray-500 uppercase tracking-wide">
          {isError ? 'error' : isPaused ? 'paused' : 'processing'}
        </div>
      </div>
      {errorMessage && isError && (
        <p className="mt-3 text-xs text-red-700 leading-relaxed">{errorMessage}</p>
      )}
    </Card>
  );
}

export function GenerationPhase({
  exam,
  onChange,
  onBack,
  onPublish,
  currentStep = 'generating',
  detailedStep,
  progress = 0,
  jobId,
  errorMessage,
  shouldConfirmStructure = true,
}: GenerationPhaseProps) {
  const isComplete = currentStep === 'complete';
  const isPaused = currentStep === 'paused';
  const isError = currentStep === 'error';

  const busyMeta = useMemo(() => {
    type Stage = 'structure' | 'generation';
    type Meta = {
      stage: Stage;
      title: string;
      description: string;
      hint?: string;
      status?: 'info' | 'warning' | 'error' | 'paused' | 'done';
      allow?: string;
      showProgress?: boolean;
    };

    const stageFromStep: Record<GenerationCurrentStep, Stage> = {
      waiting_for_upload: 'structure',
      uploading: 'structure',
      upload_verifying: 'structure',
      extracting: 'structure',
      sectioning: 'structure',
      structure_detecting: 'structure',
      structure_review: 'structure',
      waiting_for_slot: 'generation',
      generating: 'generation',
      postprocessing: 'generation',
      completed: 'generation',
    };

    const metaByStep: Partial<Record<GenerationCurrentStep, Meta>> = {
      waiting_for_upload: {
        stage: 'structure',
        title: 'アップロード待機中',
        description: 'ジョブ登録済みです。ファイルのアップロード完了を待っています。',
        hint: 'キャンセルのみ可能です。',
        allow: 'キャンセル',
        showProgress: true,
      },
      uploading: {
        stage: 'structure',
        title: 'アップロード中',
        description: 'ファイルを送信しています。失敗したファイルのみ再送可能です。',
        hint: 'アップロード完了まで操作できません。',
        allow: '再送 / キャンセル',
        showProgress: true,
      },
      upload_verifying: {
        stage: 'structure',
        title: 'アップロード検証中',
        description: 'サーバーでMIME/サイズ検証とメタ登録を実行しています。',
        hint: '処理完了までお待ちください。',
        allow: 'キャンセル',
        showProgress: true,
      },
      extracting: {
        stage: 'structure',
        title: '資料を解析中',
        description: 'OCR/テキスト抽出を実行しています。',
        hint: '処理中のため操作できません。',
        allow: '一時停止 / キャンセル',
        showProgress: true,
      },
      sectioning: {
        stage: 'structure',
        title: 'セクションを抽出中',
        description: '段落検出と分割を実行しています。',
        hint: '処理中のため操作できません。',
        allow: '一時停止 / キャンセル',
        showProgress: true,
      },
      structure_detecting: {
        stage: 'structure',
        title: '問題構造を推定中',
        description: '大問・小問の構造を推定しています。',
        hint: 'プレビュー準備ができたら構造確認へ進めます。',
        allow: '一時停止 / キャンセル',
        showProgress: true,
      },
      structure_review: {
        stage: 'structure',
        title: '構造確認待ち',
        description: '検出した構造を確認・編集してください。',
        hint: '保存またはスキップすると次の工程に進みます。',
        allow: '編集 / 保存 / スキップ',
        showProgress: false,
      },
      waiting_for_slot: {
        stage: 'generation',
        title: '生成キュー待ち',
        description: 'AI生成ワーカーの空き待ちです。',
        hint: 'この間は操作できません。',
        allow: '一時停止 / キャンセル',
        showProgress: false,
      },
      generating: {
        stage: 'generation',
        title: 'AI生成中',
        description: '問題と解答を生成しています。',
        hint: '処理中のため操作できません。',
        allow: '一時停止 / キャンセル',
        showProgress: false,
      },
      postprocessing: {
        stage: 'generation',
        title: '生成結果を検証中',
        description: '出力の正規化・毒性/著作権チェックを実行しています。',
        hint: '処理中のため操作できません。',
        allow: '一時停止 / キャンセル',
        showProgress: false,
      },
      completed: {
        stage: 'generation',
        title: '完了',
        description: '生成が完了しました。',
        status: 'done',
        showProgress: false,
      },
    };

    const metaByPhase: Partial<Record<GenerationStep, Meta>> = {
      queued: {
        stage: 'structure',
        title: '待機中',
        description: '処理キューに登録されています。',
        hint: 'キャンセルのみ可能です。',
        allow: 'キャンセル',
        showProgress: false,
      },
      uploading: metaByStep.uploading!,
      analyzing: metaByStep.extracting!,
      'structure-review': metaByStep.structure_review!,
      generating: metaByStep.generating!,
      postprocessing: metaByStep.postprocessing!,
      paused: {
        stage: (detailedStep && stageFromStep[detailedStep]) || 'generation',
        title: '一時停止中',
        description: '処理を一時停止しています。再開できます。',
        status: 'paused',
        allow: '再開 / キャンセル',
        showProgress: false,
      },
      error: {
        stage: (detailedStep && stageFromStep[detailedStep]) || 'generation',
        title: 'エラーが発生しました',
        description: '処理を継続できませんでした。リトライまたはキャンセルしてください。',
        status: 'error',
        allow: 'リトライ / キャンセル',
        showProgress: false,
      },
      complete: metaByStep.completed!,
    };

    let meta =
      (detailedStep && metaByStep[detailedStep]) ||
      metaByPhase[currentStep] ||
      metaByPhase.generating!;

    const stageTitle = meta.stage === 'structure'
      ? '1.5 問題構造を解析中'
      : '2.5 演習問題を生成中';

    return {
      ...meta,
      stageTitle,
      stage: meta.stage,
    } as Meta & { stageTitle: string; stage: Stage };
  }, [currentStep, detailedStep, shouldConfirmStructure]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 relative isolation:isolate">
      <div className="flex items-center justify-between">
        <div>
          {isComplete ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900">最終確認と微調整</h2>
              <p className="text-gray-600 font-medium">全自動で生成された問題と解答を微調整し、公開してください。</p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900">問題生成中</h2>
              <p className="text-gray-600 font-medium">AIが問題と解答を生成しています。しばらくお待ちください。</p>
            </>
          )}
        </div>
        {!isComplete && (
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} className="rounded-xl px-6">
              キャンセル
            </Button>
          </div>
        )}
        {isComplete && (
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} className="rounded-xl px-6">
              戻る
            </Button>
            <Button onClick={onPublish} className="rounded-xl px-8 bg-indigo-600">
              公開して保存
            </Button>
          </div>
        )}
      </div>

      {!isComplete && (
        (currentStep === 'queued' ||
          currentStep === 'uploading' ||
          detailedStep === 'upload_verifying' ||
          detailedStep === 'extracting' ||
          detailedStep === 'sectioning' ||
          detailedStep === 'structure_detecting' ||
          detailedStep === 'structure_review') ? (
          <StructureStatusCard
            currentStep={detailedStep && detailedStep !== 'waiting_for_slot' ? detailedStep : 'waiting_for_upload'}
            shouldConfirmStructure={shouldConfirmStructure}
            isPaused={isPaused}
            isError={isError}
            errorMessage={errorMessage}
          />
        ) : (
          <GenerationStatusCard
            currentStep={detailedStep || 'waiting_for_slot'}
            shouldConfirmStructure={shouldConfirmStructure}
            isPaused={isPaused}
            isError={isError}
            errorMessage={errorMessage}
          />
        )
      )}

      {isComplete && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="p-8 rounded-2xl shadow-xl bg-white border-none">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">問題本文・解答</h3>
              <GenerationResultEditor exam={exam} onChange={onChange} />
            </Card>
          </div>
          <div className="lg:col-span-1">
            <ProblemMetaBlock
              exam={exam}
              isOwner
              onLike={() => { }}
              onDislike={() => { }}
              onBookmark={() => { }}
              onShare={() => { }}
              onReport={() => { }}
              onExportPDF={() => { }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
