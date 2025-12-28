import React from 'react';
import type { GenerationPhase } from '@/features/generation/types';

// 要件: 3つのステージのみ表示（生成開始、構造確定、生成完了）
// 詳細な状態はプログレスバーの進み方で示す
const PHASE_LABELS: Record<GenerationPhase, string> = {
  queued: '待機中',
  uploading: 'アップロード',
  analyzing: '解析',
  'structure-review': '構造確認',
  generating: '生成',
  postprocessing: '検証',
  complete: '完了',
  paused: '一時停止',
  error: 'エラー',
};

// 詳細なフェーズを3つの主要ステージにマッピング
type DisplayStage = 'start' | 'structure' | 'complete';

const STAGE_LABELS: Record<DisplayStage, string> = {
  start: '生成開始',
  structure: '構造確定',
  complete: '生成完了',
};

const mapPhaseToStage = (phase: GenerationPhase): DisplayStage => {
  // queued, uploading, analyzing → 生成開始
  if (phase === 'queued' || phase === 'uploading' || phase === 'analyzing') {
    return 'start';
  }
  // structure-review → 構造確定
  if (phase === 'structure-review') {
    return 'structure';
  }
  // generating, postprocessing, complete, paused → 生成完了
  // error も complete ステージとして扱う（エラー表示は別途行う）
  return 'complete';
};

type Props = {
  current: GenerationPhase;
};

export const GenerationTimeline: React.FC<Props> = ({ current }) => {
  const stages: DisplayStage[] = ['start', 'structure', 'complete'];
  const currentStage = mapPhaseToStage(current);
  const currentStageIndex = stages.indexOf(currentStage);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.75rem"
    }} data-testid="generation-timeline">
      {stages.map((stage, idx) => {
        const isActive = idx <= currentStageIndex;
        const isCurrent = stage === currentStage;
        
        return (
          <React.Fragment key={stage}>
            <div
              
            >
              <span>{STAGE_LABELS[stage]}</span>
            </div>
            {idx < stages.length - 1 && (
              <div 
                 
                aria-hidden="true" 
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
