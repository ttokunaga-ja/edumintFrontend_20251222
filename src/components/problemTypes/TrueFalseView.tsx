import React from 'react';
import { ProblemTypeViewProps } from '@/types/problemTypes';
import { MarkdownBlock } from '@/components/common/MarkdownBlock';

export default function TrueFalseView(props: ProblemTypeViewProps) {
  const { questionContent, options = [] } = props;
  return (
    <div>
      <MarkdownBlock content={questionContent} />
      <div style={{
      display: "flex",
      gap: "0.5rem"
    }>
        <div >True</div>
        <div >False</div>
      </div>
    </div>
  );
}
