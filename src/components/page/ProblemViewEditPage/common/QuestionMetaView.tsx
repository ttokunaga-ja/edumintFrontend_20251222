import React from 'react';
import { KeywordEditor, Keyword } from './KeywordEditor'; type DifficultyMeta = { label: string; color: string }; type QuestionMetaViewProps = { difficulty?: number | null; difficultyLabels: Record<number, DifficultyMeta>; keywords?: Keyword[];
}; export const QuestionMetaView: React.FC<QuestionMetaViewProps> = ({ difficulty, difficultyLabels, keywords = [],
}) => { const effectiveDifficulty = difficulty ?? 0; const meta = difficultyLabels[effectiveDifficulty] ?? difficultyLabels[0]; return ( <div > {meta && ( <span > {meta.label} </span> )} <KeywordEditor keywords={keywords} canEdit={false} /> </div> );
};
