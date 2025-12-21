import { useEffect, useRef } from 'react';

export interface LatexBlockProps {
  content: string;
  displayMode?: boolean;
  className?: string;
}

export const LatexBlock: React.FC<LatexBlockProps> = ({
  content,
  displayMode = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const katex = (typeof window !== 'undefined' && (window as any).katex) || null;
    if (katex) {
      try {
        katex.render(content, containerRef.current, {
          displayMode,
          throwOnError: false,
          errorColor: '#cc0000',
          strict: false,
          trust: false,
        });
        return;
      } catch (error) {
        console.error('KaTeX render error:', error);
      }
    }

    // Fallback: show raw content
    if (containerRef.current) {
      containerRef.current.innerHTML = `<code>${content}</code>`;
    }
  }, [content, displayMode]);

  return (
    <div
      ref={containerRef}
      className={`latex-block ${displayMode ? 'text-center my-4' : 'inline'} ${className}`}
    />
  );
};

export default LatexBlock;
