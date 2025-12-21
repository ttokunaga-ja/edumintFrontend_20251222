import React from 'react';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
});

interface MarkdownBlockProps {
  content: string;
  className?: string;
}

export const MarkdownBlock: React.FC<MarkdownBlockProps> = ({ content, className }) => {
  const rendered = React.useMemo(() => md.render(content || ''), [content]);
  return <div className={className} dangerouslySetInnerHTML={{ __html: rendered }} />;
};

export default MarkdownBlock;
