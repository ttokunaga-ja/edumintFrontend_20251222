import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MarkdownBlock } from '@/components/common/MarkdownBlock';
import { LatexBlock } from '@/components/common/LatexBlock';

describe('content blocks', () => {
  it('renders markdown as HTML', () => {
    const { container } = render(<MarkdownBlock content="**bold** _italic_ `code`" />);
    expect(container.querySelector('strong')).not.toBeNull();
    expect(container.querySelector('em')).not.toBeNull();
    expect(container.querySelector('code')).not.toBeNull();
  });

  it('renders latex with katex', async () => {
    render(<LatexBlock content="\\frac{1}{x}" />);
    await waitFor(() => {
      const latex = screen.getByLabelText('latex-render');
      expect(latex.querySelector('.katex')).not.toBeNull();
    });
  });
});
