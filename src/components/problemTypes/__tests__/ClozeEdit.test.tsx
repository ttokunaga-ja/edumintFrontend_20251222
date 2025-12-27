import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ClozeEdit from '../ClozeEdit';
import type { ProblemTypeEditProps } from '@/types/problemTypes';
import { vi } from 'vitest';

describe('ClozeEdit', () => {
  it('renders question and answer areas', () => {
    const props: ProblemTypeEditProps = {
      subQuestionNumber: 1,
      questionContent: 'Cloze sample',
      questionFormat: 0,
      answerContent: 'gap answer',
    } as unknown as ProblemTypeEditProps;

    render(<ClozeEdit {...props} />);

    expect(screen.getByLabelText('問題文入力')).toBeInTheDocument();
    expect(screen.getByLabelText(/解答.*入力/)).toBeInTheDocument();
    expect(screen.getAllByText('Cloze sample').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('gap answer').length).toBeGreaterThanOrEqual(1);
  });

  it('calls onQuestionChange and onAnswerChange', () => {
    const onQuestionChange = vi.fn();
    const onAnswerChange = vi.fn();
    const props: ProblemTypeEditProps = {
      subQuestionNumber: 1,
      questionContent: 'Initial',
      questionFormat: 0,
      answerContent: 'Ans',
      onQuestionChange,
      onAnswerChange,
    } as unknown as ProblemTypeEditProps;

    render(<ClozeEdit {...props} />);

    const qInput = screen.getByLabelText('問題文入力') as HTMLTextAreaElement;
    fireEvent.change(qInput, { target: { value: 'Updated' } });
    expect(onQuestionChange).toHaveBeenCalledWith('Updated');

    const aInput = screen.getByLabelText(/解答.*入力/) as HTMLTextAreaElement;
    fireEvent.change(aInput, { target: { value: 'Updated ans' } });
    expect(onAnswerChange).toHaveBeenCalledWith('Updated ans');
  });
});
