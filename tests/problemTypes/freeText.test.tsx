import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FreeTextView from '@/components/problemTypes/FreeTextView';
import FreeTextEdit from '@/components/problemTypes/FreeTextEdit';

describe('FreeText components', () => {
  it('renders markdown content in view mode', () => {
    render(<FreeTextView subQuestionNumber={1} questionContent="**bold** text" questionFormat={0} />);
    expect(screen.getByText('bold')).toBeInTheDocument();
  });

  it('notifies parent when question and answer change in edit mode', () => {
    const onQuestionChange = vi.fn();
    const onAnswerChange = vi.fn();

    render(
      <FreeTextEdit
        subQuestionNumber={1}
        questionContent="start"
        questionFormat={0}
        answerContent="ans"
        onQuestionChange={onQuestionChange}
        onAnswerChange={onAnswerChange}
      />,
    );

    fireEvent.change(screen.getByLabelText('問題文入力'), {
      target: { value: 'updated question' },
    });
    fireEvent.change(screen.getByLabelText('解答入力'), {
      target: { value: 'updated answer' },
    });

    expect(onQuestionChange).toHaveBeenCalledWith('updated question');
    expect(onAnswerChange).toHaveBeenCalledWith('updated answer');
  });

  it('toggles format and notifies parent', () => {
    const onFormatChange = vi.fn();

    render(
      <FreeTextEdit
        subQuestionNumber={1}
        questionContent="start"
        questionFormat={0}
        answerContent="ans"
        answerFormat={0}
        onFormatChange={onFormatChange}
      />,
    );

    fireEvent.click(screen.getByLabelText('問題文フォーマット切替'));
    expect(onFormatChange).toHaveBeenCalledWith('question', 1);
    expect(screen.getByLabelText('問題文フォーマット切替').textContent).toBe('LaTeX');

    fireEvent.click(screen.getByLabelText('解答フォーマット切替'));
    expect(onFormatChange).toHaveBeenCalledWith('answer', 1);
    expect(screen.getByLabelText('解答フォーマット切替').textContent).toBe('LaTeX');
  });
});
