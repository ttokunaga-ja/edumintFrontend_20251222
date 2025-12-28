import React from 'react';
import { KeywordEditor, Keyword } from './KeywordEditor';

type SubQuestionMetaViewProps = {
  keywords?: Keyword[];
};

export const SubQuestionMetaView: React.FC<SubQuestionMetaViewProps> = ({
  keywords = [],
}) => {
  return (
    <div >
      <KeywordEditor keywords={keywords} canEdit={false} />
    </div>
  );
};
