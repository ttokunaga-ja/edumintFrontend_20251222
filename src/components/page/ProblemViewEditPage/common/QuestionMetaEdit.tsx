import React from 'react';
import { MetaSelect } from './MetaSelect';
import { KeywordEditor, Keyword } from './KeywordEditor'; type Option = { value: number; label: string }; type QuestionMetaEditProps = { difficulty?: number | null; difficultyOptions: Option[]; keywords?: Keyword[]; onDifficultyChange?: (value: number) => void; onKeywordAdd?: (keyword: string) => void; onKeywordRemove?: (id: string) => void;
}; export const QuestionMetaEdit: React.FC<QuestionMetaEditProps> = ({ difficulty, difficultyOptions, keywords = [], onDifficultyChange, onKeywordAdd, onKeywordRemove,
}) => { return ( <div > <MetaSelect label="難易度" ariaLabel="大問の難易度" value={difficulty ?? 0} options={difficultyOptions} onChange={onDifficultyChange} /> <KeywordEditor keywords={keywords} onAdd={onKeywordAdd} onRemove={onKeywordRemove} ariaLabelInput="大問キーワード入力" canEdit /> </div> );
};
