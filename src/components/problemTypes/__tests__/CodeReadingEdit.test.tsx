import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CodeReadingEdit from '../CodeReadingEdit';
import type { ProblemTypeEditProps } from '@/types/problemTypes';
import { vi } from 'vitest';

describe('CodeReadingEdit', () => {
  it('renders question and answer areas', () => {
    const props: ProblemTypeEditProps = {
      subQuestionNumber: 1,
      questionContent: 'What does foo do?',
      questionFormat: 0,
      answerContent: 'It returns 42',
    } as unknown as ProblemTypeEditProps;

    render(<CodeReadingEdit {...props} />);

    expect(screen.getByLabelText('問題文入力')).toBeInTheDocument();
    expect(screen.getByLabelText(/解答.*入力/)).toBeInTheDocument();
    expect(screen.getAllByText('What does foo do?').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('It returns 42').length).toBeGreaterThanOrEqual(1);
  });

  it('calls callbacks on input change', () => {
    const onQuestionChange = vi.fn();
    const onAnswerChange = vi.fn();
    const props: ProblemTypeEditProps = {
      subQuestionNumber: 1,
      questionContent: 'start',
      questionFormat: 0,
      answerContent: 'ans',
      onQuestionChange,
      onAnswerChange,
    } as unknown as ProblemTypeEditProps;

    render(<CodeReadingEdit {...props} />);

    const qInput = screen.getByLabelText('問題文入力') as HTMLTextAreaElement;
    fireEvent.change(qInput, { target: { value: 'updated' } });
    expect(onQuestionChange).toHaveBeenCalledWith('updated');

    const aInput = screen.getByLabelText(/解答.*入力/) as HTMLTextAreaElement;
    fireEvent.change(aInput, { target: { value: 'Updated ans' } });
    expect(onAnswerChange).toHaveBeenCalledWith('Updated ans');
  });
});
