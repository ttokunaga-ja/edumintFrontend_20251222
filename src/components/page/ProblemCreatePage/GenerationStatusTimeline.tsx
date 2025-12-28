// @ts-nocheck
import { Check, Clock, Loader, AlertCircle, FileText, Search, Settings, Sparkles, Upload, FileCheck, GitBranch, Hourglass } from 'lucide-react';
import type { GenerationPhase } from '@/features/generation/stateMachine';
import type { GenerationCurrentStep } from '@/services/api/gateway/generation';

export type GenerationStep = GenerationPhase;

interface GenerationStatusTimelineProps {
  currentStep: GenerationStep;
  detailedStep?: GenerationCurrentStep;
  progress: number;
  jobId?: string;
  errorMessage?: string;
  errorCode?: string;
  className?: string;
}

const phaseLabels: Record<GenerationPhase, string> = {
  'queued': 'ジョブ待機中',
  'uploading': 'ファイルアップロード',
  'analyzing': 'コンテンツ解析',
  'structure-review': '構造確認',
  'generating': '問題生成中',
  'postprocessing': '最終検証中',
  'complete': '完了',
  'paused': '一時停止中',
  'error': 'エラー',
};

const stepLabels: Record<GenerationCurrentStep, string> = {
  'waiting_for_upload': 'アップロード待ち',
  'uploading': 'ファイルアップロード中',
  'upload_verifying': 'ファイル検証中',
  'extracting': 'テキスト抽出中',
  'sectioning': 'セクション分割中',
  'structure_detecting': '構造検出中',
  'structure_review': '構造確認待ち',
  'waiting_for_slot': '生成スロット待ち',
  'generating': 'AI生成実行中',
  'postprocessing': '出力検証中',
  'completed': '完了',
};

export function GenerationStatusTimeline({
  currentStep,
  detailedStep,
  progress,
  jobId,
  errorMessage,
  errorCode,
  className = '',
}: GenerationStatusTimelineProps) {
  const isError = currentStep === 'error';
  const isComplete = currentStep === 'complete';
  const isPaused = currentStep === 'paused';

  // 表示するラベル（詳細ステップがあればそちらを優先）
  const displayLabel = detailedStep ? stepLabels[detailedStep] : phaseLabels[currentStep];

  return (
    <div className={className}>
      {/* 現在の状態表示 */}
      {!isError && !isComplete && (
        <div className="mb-4">
          <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }>
            <Loader className="w-4 h-4 animate-spin text-indigo-600" />
            <span className="text-sm font-medium">{displayLabel}</span>
          </div>
          {detailedStep && (
            <p className="text-xs text-gray-500 mt-1 ml-6">
              {getStepDescription(detailedStep)}
            </p>
          )}
        </div>
      )}

      {/* 一時停止表示 */}
      {isPaused && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }>
            <Clock className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">一時停止中</span>
          </div>
        </div>
      )}

      {/* プログレスバー */}
      {!isError && !isComplete && (
        <div className="mt-4">
          <div style={{
      display: "flex"
    }>
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

      {/* 完了表示 */}
      {isComplete && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.75rem"
    }>
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">生成が完了しました</span>
          </div>
        </div>
      )}

      {/* エラーメッセージ */}
      {isError && errorMessage && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div style={{
      display: "flex",
      gap: "0.75rem"
    }>
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              {errorCode && (
                <p className="text-xs text-red-600 font-mono mb-1">{errorCode}</p>
              )}
              <p className="text-sm text-red-800">{errorMessage}</p>
              <p className="text-xs text-red-600 mt-2">
                {getErrorAdvice(errorCode)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 各ステップの説明文
 */
function getStepDescription(step: GenerationCurrentStep): string {
  switch (step) {
    case 'waiting_for_upload':
      return 'ファイルのアップロードを待機しています';
    case 'uploading':
      return 'ファイルをサーバーにアップロード中です';
    case 'upload_verifying':
      return 'アップロードされたファイルを検証しています';
    case 'extracting':
      return 'OCRとテキスト抽出を実行中です（この処理には時間がかかる場合があります）';
    case 'sectioning':
      return 'ドキュメントをセクションに分割しています';
    case 'structure_detecting':
      return '問題の構造（大問・小問）を推定しています';
    case 'structure_review':
      return '構造の確認をお待ちしています';
    case 'waiting_for_slot':
      return 'AI生成の順番待ちです';
    case 'generating':
      return 'AIが問題を生成中です（この処理には時間がかかる場合があります）';
    case 'postprocessing':
      return '生成結果の検証と正規化を実行中です';
    case 'completed':
      return '処理が完了しました';
    default:
      return '';
  }
}

/**
 * エラーコードに応じたアドバイス
 */
function getErrorAdvice(errorCode?: string): string {
  if (!errorCode) return 'しばらく待ってから再試行してください。';
  
  switch (errorCode) {
    case 'upload_failed':
      return 'ネットワーク接続を確認して、再度アップロードしてください。';
    case 'ocr_timeout':
      return 'ファイルが大きすぎるか複雑すぎる可能性があります。ファイルを分割してお試しください。';
    case 'structure_invalid':
      return '問題構造を検出できませんでした。ファイルの形式を確認してください。';
    case 'generation_timeout':
      return 'AI生成に時間がかかりすぎました。問題数を減らして再試行してください。';
    case 'policy_violation':
      return 'コンテンツポリシーに違反する内容が検出されました。ファイルの内容を確認してください。';
    default:
      return 'エラーが発生しました。しばらく待ってから再試行してください。';
  }
}
