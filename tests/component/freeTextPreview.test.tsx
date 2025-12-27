import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FreeTextEdit from '@/components/problemTypes/FreeTextEdit';

describe('FreeTextEdit preview', () => {
  it('updates preview when toggling format for question and answer', async () => {
    render(
      <FreeTextEdit
        subQuestionNumber={1}
        questionContent="f(x)=x^2"
        answerContent="\\frac{1}{x}"
        questionFormat={0}
        answerFormat={1}
      />,
    );

    expect(screen.getAllByText('f(x)=x^2').length).toBeGreaterThanOrEqual(1);
    await waitFor(() => {
      expect(screen.getByLabelText('latex-render').querySelector('.katex')).not.toBeNull();
    });

    fireEvent.click(screen.getByLabelText(/問題文.*フォーマット切替/));
    await waitFor(() => {
      const latexNodes = screen.getAllByLabelText('latex-render');
      expect(latexNodes.length).toBeGreaterThanOrEqual(1);
    });
  });
});
