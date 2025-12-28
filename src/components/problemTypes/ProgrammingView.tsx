import React from 'react';
import { ProblemTypeViewProps } from '@/types/problemTypes';

export default function ProgrammingView(props: ProblemTypeViewProps) {
  const { questionContent } = props;
  return (
    <div>
      <div className="mb-2 text-sm text-gray-700">プログラミング問題</div>
      <pre className="whitespace-pre-wrap bg-gray-50 p-3 rounded text-sm">{questionContent}</pre>
    </div>
  );
}
