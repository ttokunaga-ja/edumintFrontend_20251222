import React from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify'; const processor = unified() .use(remarkParse) .use(remarkGfm)
) .use(rehypeSanitize) .use(rehypeStringify); interface MarkdownBlockProps { content: string; ?: string;
} export const MarkdownBlock: React.FC<MarkdownBlockProps> = ({ content, }) => { const rendered = React.useMemo(() => { const source = content || ''; const file = processor.processSync(source); return String(file); }, [content]); return <div dangerouslySetInnerHTML={{ __html: rendered }} />;
}; export default MarkdownBlock;
