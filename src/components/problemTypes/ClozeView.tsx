import React from 'react';
import { ProblemTypeViewProps } from '@/types/problemTypes';
import { MarkdownBlock } from '@/components/common/MarkdownBlock';

export default function ClozeView(props: ProblemTypeViewProps) {
  const { questionContent } = props;
  return (
    <div>
      <MarkdownBlock content={questionContent} />
    </div>
  );
}
