import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProofEdit from '../ProofEdit';
import type { ProblemTypeEditProps } from '@/types/problemTypes';
import { vi } from 'vitest';

describe('ProofEdit', () => {
  it('renders question and answer areas', () => {
    const props: ProblemTypeEditProps = {
      subQuestionNumber: 1,
      questionContent: 'Prove this',
      questionFormat: 0,
      answerContent: 'Proof steps',
    } as unknown as ProblemTypeEditProps;

    render(<ProofEdit {...props} />);

    expect(screen.getByLabelText('問題文入力')).toBeInTheDocument();
    expect(screen.getByLabelText(/解答.*入力/)).toBeInTheDocument();
    expect(screen.getAllByText('Prove this').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Proof steps').length).toBeGreaterThanOrEqual(1);
  });

  it('calls callbacks on input change', () => {
    const onQuestionChange = vi.fn();
    const onAnswerChange = vi.fn();
    const props: ProblemTypeEditProps = {
      subQuestionNumber: 1,
      questionContent: 'start',
      questionFormat: 0,
      answerContent: '',
      onQuestionChange,
      onAnswerChange,
    } as unknown as ProblemTypeEditProps;

    render(<ProofEdit {...props} />);

    const qInput = screen.getByLabelText('問題文入力') as HTMLTextAreaElement;
    fireEvent.change(qInput, { target: { value: 'updated' } });
    expect(onQuestionChange).toHaveBeenCalledWith('updated');

    const aInput = screen.getByLabelText(/解答.*入力/) as HTMLTextAreaElement;
    fireEvent.change(aInput, { target: { value: 'QED' } });
    expect(onAnswerChange).toHaveBeenCalledWith('QED');
  });
});
