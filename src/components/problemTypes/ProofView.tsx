import React from 'react';
import { ProblemTypeViewProps } from '@/types/problemTypes';
import { MarkdownBlock } from '@/components/common/MarkdownBlock';

export default function ProofView(props: ProblemTypeViewProps) {
  const { questionContent } = props;
  return (
    <div>
      <MarkdownBlock content={questionContent} />
      <div >証明問題。解答は論述で表現してください。</div>
    </div>
  );
}
