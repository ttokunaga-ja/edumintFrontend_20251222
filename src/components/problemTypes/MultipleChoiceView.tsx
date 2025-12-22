import React from 'react';
import { ProblemTypeViewProps } from '@/types/problemTypes';
import { MarkdownBlock } from '@/components/common/MarkdownBlock';

export default function MultipleChoiceView(props: ProblemTypeViewProps) {
  const { questionContent, questionFormat, options = [] } = props;
  return (
    <div>
      {questionFormat === 0 ? (
        <MarkdownBlock content={questionContent} />
      ) : (
        <div className="mb-2 text-sm">(LaTeX 問題)</div>
      )}

      <div className="mt-3 space-y-2">
        {options.map((opt, idx) => (
          <div key={opt.id} className="p-3 rounded-lg border bg-white">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs">
                {String.fromCharCode(65 + idx)}
              </div>
              <div className="text-sm text-gray-900">{opt.content}</div>
              {opt.isCorrect && <div className="ml-auto text-xs px-2 py-0.5 bg-green-600 text-white rounded">正解</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
