import { Fragment } from 'react';
import type { FC, ReactNode, SyntheticEvent, FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Box, type SxProps, type Theme } from '@mui/material';
import 'katex/dist/katex.min.css';

/**
 * ExamViewer
 * 
 * 数式（LaTeX）やMarkdownのレンダリングを担当する純粋な表示コンポーネント
 * - 軽量でパフォーマンスが良い
 * - ExamEditorのプレビュー部分から再利用される
 * - 編集と閲覧の見た目を統一
 */
export interface ExamViewerProps {
  content: string;
  sx?: SxProps<Theme>;
  className?: string;
}

export const ExamViewer: FC<ExamViewerProps> = ({ 
  content, 
  sx, 
  className 
}) => {
  return (
    <Box 
      sx={{ 
        '& p': { 
          mb: 1.5, 
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        },
        '& h1, & h2, & h3': { 
          mt: 2, 
          mb: 1,
          fontWeight: 'bold',
        },
        '& h1': { fontSize: '1.8rem' },
        '& h2': { fontSize: '1.5rem' },
        '& h3': { fontSize: '1.2rem' },
        '& code': { 
          bgcolor: 'action.hover', 
          px: 0.5, 
          borderRadius: 0.5,
          fontFamily: 'monospace',
          fontSize: '0.9em',
        },
        '& pre': {
          bgcolor: 'action.hover',
          p: 1.5,
          borderRadius: 1,
          overflowX: 'auto',
          mb: 2,
        },
        '& pre code': {
          bgcolor: 'transparent',
          px: 0,
        },
        '& ul, & ol': {
          ml: 2,
          mb: 1.5,
        },
        '& li': {
          mb: 0.5,
        },
        '& blockquote': {
          borderLeft: 4,
          borderColor: 'primary.main',
          pl: 2,
          ml: 0,
          my: 1.5,
          fontStyle: 'italic',
          color: 'text.secondary',
        },
        '& table': {
          width: '100%',
          borderCollapse: 'collapse',
          my: 2,
        },
        '& th, & td': {
          border: 1,
          borderColor: 'divider',
          p: 1,
          textAlign: 'left',
        },
        '& th': {
          bgcolor: 'action.hover',
          fontWeight: 'bold',
        },
        '& img': {
          maxWidth: '100%',
          height: 'auto',
        },
        // LaTeX数式のスタイリング
        '& .math-display': {
          my: 2,
          overflow: 'auto',
        },
        '& .math-inline': {
          mx: 0.5,
        },
        ...sx 
      }} 
      className={className}
    >
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // カスタムレンダリング（必要に応じて拡張可能）
          h1: ({ node, ...props }) => (
            <Box component="h1" sx={{ fontSize: '1.8rem' }} {...props} />
          ),
          h2: ({ node, ...props }) => (
            <Box component="h2" sx={{ fontSize: '1.5rem' }} {...props} />
          ),
          h3: ({ node, ...props }) => (
            <Box component="h3" sx={{ fontSize: '1.2rem' }} {...props} />
          ),
        }}
      >
        {content || '(記述なし)'}
      </ReactMarkdown>
    </Box>
  );
};

export default ExamViewer;
