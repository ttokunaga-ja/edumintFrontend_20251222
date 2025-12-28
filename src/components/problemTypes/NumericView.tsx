import React from 'react';
import { ProblemTypeViewProps } from '@/types/problemTypes';
import { MarkdownBlock } from '@/components/common/MarkdownBlock';

export default function NumericView(props: ProblemTypeViewProps) {
  const { questionContent } = props;
  return (
    <div>
      <MarkdownBlock content={questionContent} />
      <div >数値を入力して解くタイプの問題です。</div>
    </div>
  );
}
