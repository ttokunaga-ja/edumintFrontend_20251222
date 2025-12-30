import React, { useEffect, useRef } from 'react';

export interface LatexBlockProps {
  content: string;
  displayMode?: boolean;
}

const normalizeLatex = (raw: string) => { if (!raw) return ''; const unescaped = raw.replace(/\\\\/g, '\\').trim(); return unescaped.replace(/^\s*\${1,2}|\${1,2}\s*$/g, '');
};

export const LatexBlock: React.FC<LatexBlockProps> = ({ content }) => {
  return <div data-testid="latex-block">{content}</div>;
};

export default LatexBlock;
