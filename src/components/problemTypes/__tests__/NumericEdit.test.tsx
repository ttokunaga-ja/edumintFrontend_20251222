import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NumericEdit from '../NumericEdit';
import type { ProblemTypeEditProps } from '@/types/problemTypes';
import { vi } from 'vitest';

describe('NumericEdit', () => {
  it('renders question and answer areas', () => {
    const props: ProblemTypeEditProps = {
      subQuestionNumber: 1,
      questionContent: 'Numeric question',
      questionFormat: 0,
      answerContent: '42',
    } as unknown as ProblemTypeEditProps;

    render(<NumericEdit {...props} />);

    expect(screen.getByLabelText('問題文入力')).toBeInTheDocument();
    expect(screen.getByLabelText(/解答.*入力/)).toBeInTheDocument();
    expect(screen.getAllByText('Numeric question').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('42').length).toBeGreaterThanOrEqual(1);
  });

  it('calls callbacks on input change', () => {
    const onQuestionChange = vi.fn();
    const onAnswerChange = vi.fn();
    const props: ProblemTypeEditProps = {
      subQuestionNumber: 1,
      questionContent: 'start',
      questionFormat: 0,
      answerContent: '0',
      onQuestionChange,
      onAnswerChange,
    } as unknown as ProblemTypeEditProps;

    render(<NumericEdit {...props} />);

    const qInput = screen.getByLabelText('問題文入力') as HTMLTextAreaElement;
    fireEvent.change(qInput, { target: { value: 'updated' } });
    expect(onQuestionChange).toHaveBeenCalledWith('updated');

    const aInput = screen.getByLabelText(/解答.*入力/) as HTMLTextAreaElement;
    fireEvent.change(aInput, { target: { value: '123' } });
    expect(onAnswerChange).toHaveBeenCalledWith('123');
  });
});
