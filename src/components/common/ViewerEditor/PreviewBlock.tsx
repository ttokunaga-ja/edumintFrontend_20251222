import React from 'react';
import { MarkdownBlock } from '@/components/common/MarkdownBlock';
import { LatexBlock } from '@/components/common/LatexBlock';

type Props = {
  content: string;
  format: 0 | 1;
  className?: string;
};

export default function PreviewBlock({ content, format, className }: Props) {
  return (
    <div className={className}>
      {format === 0 ? (
        <MarkdownBlock content={content} className="prose prose-sm max-w-none" />
      ) : (
        <LatexBlock content={content} displayMode={false} className="text-gray-900" />
      )}
    </div>
  );
}
