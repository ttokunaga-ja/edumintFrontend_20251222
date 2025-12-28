import React from 'react';
import { MetaSelect } from './MetaSelect';
import { KeywordEditor, Keyword } from './KeywordEditor';

type Option = { value: number; label: string };

type SubQuestionMetaEditProps = {
  questionTypeId: number;
  questionTypeOptions: Option[];
  keywords?: Keyword[];
  onTypeChange?: (value: number) => void;
  onKeywordAdd?: (keyword: string) => void;
  onKeywordRemove?: (id: string) => void;
};

export const SubQuestionMetaEdit: React.FC<SubQuestionMetaEditProps> = ({
  questionTypeId,
  questionTypeOptions,
  keywords = [],
  onTypeChange,
  onKeywordAdd,
  onKeywordRemove,
}) => {
  return (
    <div className="mb-4 space-y-2">
      <MetaSelect
        label="小問タイプ"
        ariaLabel="小問タイプ"
        value={questionTypeId}
        options={questionTypeOptions}
        onChange={onTypeChange}
      />
      <KeywordEditor
        keywords={keywords}
        onAdd={onKeywordAdd}
        onRemove={onKeywordRemove}
        ariaLabelInput="小問キーワード入力"
        canEdit
      />
    </div>
  );
};
