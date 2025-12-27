import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProgrammingEdit from '../ProgrammingEdit';
import type { ProblemTypeEditProps } from '@/types/problemTypes';
import { vi } from 'vitest';

describe('ProgrammingEdit', () => {
  it('renders and matches snapshot', () => {
    const props: ProblemTypeEditProps = {
      subQuestionNumber: 1,
      questionContent: 'Implement foo',
      questionFormat: 0,
      answerContent: 'function foo() {}',
    } as unknown as ProblemTypeEditProps;

    const { container } = render(<ProgrammingEdit {...props} />);
    expect(container).toMatchSnapshot();
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

    render(<ProgrammingEdit {...props} />);

    const qInput = screen.getByLabelText('問題文入力') as HTMLTextAreaElement;
    fireEvent.change(qInput, { target: { value: 'Updated' } });
    expect(onQuestionChange).toHaveBeenCalledWith('Updated');

    const aInput = screen.getByLabelText('解答入力') as HTMLTextAreaElement;
    fireEvent.change(aInput, { target: { value: 'Updated ans' } });
    expect(onAnswerChange).toHaveBeenCalledWith('Updated ans');
  });
});
