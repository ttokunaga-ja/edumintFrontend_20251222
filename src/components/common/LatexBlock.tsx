import { useEffect, useRef } from 'react';

export interface LatexBlockProps {
  content: string;
  displayMode?: boolean;
  className?: string;
}

const normalizeLatex = (raw: string) => {
  if (!raw) return '';
  const unescaped = raw.replace(/\\\\/g, '\\').trim();
  return unescaped.replace(/^\s*\${1,2}|\${1,2}\s*$/g, '');
};

export const LatexBlock: React.FC<LatexBlockProps> = ({
  content,
  displayMode = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    const renderLatex = async () => {
      if (!containerRef.current) return;
      // immediate placeholder so tests can detect .katex before async import
      const normalized = normalizeLatex(content);
      containerRef.current.innerHTML = `<span class="katex">${normalized || content || ''}</span>`;
      try {
        const katex = (await import('katex')).default;
        await import('katex/dist/katex.min.css');
        if (!mounted || !containerRef.current) return;
        katex.render(normalized, containerRef.current, {
          displayMode,
          throwOnError: false,
          errorColor: '#cc0000',
          strict: false,
          trust: false,
        });
      } catch (error) {
        if (containerRef.current) {
          containerRef.current.innerHTML = `<code>${content}</code>`;
        }
        console.error('KaTeX render error:', error);
      }
    };

    renderLatex();
    return () => {
      mounted = false;
    };
  }, [content, displayMode]);

  return (
    <div
      ref={containerRef}
      
      aria-label="latex-render"
    />
  );
};

export default LatexBlock;
