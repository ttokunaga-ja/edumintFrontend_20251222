import React from 'react';
import { KeywordEditor, Keyword } from './KeywordEditor';

type SubQuestionMetaViewProps = {
  keywords?: Keyword[];
};

export const SubQuestionMetaView: React.FC<SubQuestionMetaViewProps> = ({
  keywords = [],
}) => {
  return (
    <div className="space-y-1 mb-4">
      <KeywordEditor keywords={keywords} canEdit={false} />
    </div>
  );
};
