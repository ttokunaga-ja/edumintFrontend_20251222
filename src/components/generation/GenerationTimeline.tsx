import { Fragment } from 'react';
import type { FC } from 'react';
import type { GenerationPhase } from '@/features/generation/types'; // 要件: 3つのステージのみ表示（生成開始、構造確定、生成完了）
// 詳細な状態はプログレスバーの進み方で示す
import { useTranslation } from 'react-i18next';

const PHASE_LABEL_KEYS: Record<GenerationPhase, string> = { queued: 'status.queued', uploading: 'status.uploading', analyzing: 'status.analyzing', 'structure-review': 'status.structure-review', generating: 'status.generating', postprocessing: 'status.postprocessing', complete: 'status.complete', paused: 'status.paused', error: 'status.error', };

// 詳細なフェーズを3つの主要ステージにマッピング
export type DisplayStage = 'start' | 'structure' | 'complete';
const STAGE_LABEL_KEYS: Record<DisplayStage, string> = { start: 'generation.timeline.start', structure: 'generation.timeline.structure', complete: 'generation.timeline.complete' };

const mapPhaseToStage = (phase: GenerationPhase): DisplayStage => {
  // queued, uploading, analyzing → start
  if (phase === 'queued' || phase === 'uploading' || phase === 'analyzing') {
    return 'start';
  }

  // structure-review → structure
  if (phase === 'structure-review') {
    return 'structure';
  }

  // generating, postprocessing, complete, paused → complete
  // error も complete ステージとして扱う（エラー表示は別途行う）
  return 'complete';
}; type Props = { current: GenerationPhase;
export const GenerationTimeline: FC<Props> = ({ current }) => {
  const { t } = useTranslation();
  const stages: DisplayStage[] = ['start', 'structure', 'complete'];
  const currentStage = mapPhaseToStage(current);
  const currentStageIndex = stages.indexOf(currentStage);

  return (
    <div style={{ display: undefined, alignItems: 'center', gap: '0.75rem' }} data-testid="generation-timeline">
      {stages.map((stage, idx) => {
        const isActive = idx <= currentStageIndex;
        const isCurrent = stage === currentStage;
        return (
          <Fragment key={stage}>
            <div>
              <span>{t(STAGE_LABEL_KEYS[stage])}</span>
            </div>
            {idx < stages.length - 1 && <div hidden="true" />}
          </Fragment>
        );
      })}
    </div>
  );
};
};
