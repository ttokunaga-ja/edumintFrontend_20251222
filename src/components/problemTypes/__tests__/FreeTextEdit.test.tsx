import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FreeTextEdit from '../FreeTextEdit';
import type { ProblemTypeEditProps } from '@/types/problemTypes';
import { vi } from 'vitest';

describe('FreeTextEdit', () => {
  it('renders and matches snapshot', () => {
    const props: ProblemTypeEditProps = {
      subQuestionNumber: 1,
      questionContent: 'Sample question',
      questionFormat: 0,
      answerContent: 'Sample answer',
      answerFormat: 0,
    } as unknown as ProblemTypeEditProps;

    const { container } = render(<FreeTextEdit {...props} />);
    expect(container).toMatchSnapshot();
  });

  it('calls callbacks on input change and toggles formats', () => {
    const onQuestionChange = vi.fn();
    const onAnswerChange = vi.fn();
    const onFormatChange = vi.fn();

    const props: ProblemTypeEditProps = {
      subQuestionNumber: 1,
      questionContent: 'Initial question',
      questionFormat: 0,
      answerContent: 'Initial answer',
      answerFormat: 0,
      onQuestionChange,
      onAnswerChange,
      onFormatChange,
    } as unknown as ProblemTypeEditProps;

    render(<FreeTextEdit {...props} />);

    const qInput = screen.getByLabelText('問題文入力') as HTMLTextAreaElement;
    fireEvent.change(qInput, { target: { value: 'Updated question' } });
    expect(onQuestionChange).toHaveBeenCalledWith('Updated question');

    const qToggle = screen.getByLabelText('問題文フォーマット切替');
    fireEvent.click(qToggle);
    expect(onFormatChange).toHaveBeenCalledWith('question', 1);

    const aInput = screen.getByLabelText('解答入力') as HTMLTextAreaElement;
    fireEvent.change(aInput, { target: { value: 'Updated answer' } });
    expect(onAnswerChange).toHaveBeenCalledWith('Updated answer');

    const aToggle = screen.getByLabelText('解答フォーマット切替');
    fireEvent.click(aToggle);
    expect(onFormatChange).toHaveBeenCalledWith('answer', 1);
  });
});
