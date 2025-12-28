import React from 'react';
import { KeywordEditor, Keyword } from './KeywordEditor';

type DifficultyMeta = { label: string; color: string };

type QuestionMetaViewProps = {
  difficulty?: number | null;
  difficultyLabels: Record<number, DifficultyMeta>;
  keywords?: Keyword[];
};

export const QuestionMetaView: React.FC<QuestionMetaViewProps> = ({
  difficulty,
  difficultyLabels,
  keywords = [],
}) => {
  const effectiveDifficulty = difficulty ?? 0;
  const meta = difficultyLabels[effectiveDifficulty] ?? difficultyLabels[0];

  return (
    <div className="space-y-2 mb-4">
      {meta && (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${meta.color}`}>
          {meta.label}
        </span>
      )}
      <KeywordEditor keywords={keywords} canEdit={false} />
    </div>
  );
};
