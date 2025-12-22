import React from 'react';
import { ProblemTypeViewProps } from '@/types/problemTypes';
import { MarkdownBlock } from '@/components/common/MarkdownBlock';

export default function TrueFalseView(props: ProblemTypeViewProps) {
  const { questionContent, options = [] } = props;
  return (
    <div>
      <MarkdownBlock content={questionContent} />
      <div className="mt-2 flex gap-2">
        <div className="px-3 py-1 bg-white border rounded">True</div>
        <div className="px-3 py-1 bg-white border rounded">False</div>
      </div>
    </div>
  );
}
