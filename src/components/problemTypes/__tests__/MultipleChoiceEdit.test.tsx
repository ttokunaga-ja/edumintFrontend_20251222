import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MultipleChoiceEdit from '../MultipleChoiceEdit';
import type { ProblemTypeEditProps } from '@/types/problemTypes';
import { vi } from 'vitest';

describe('MultipleChoiceEdit', () => {
  it('renders and matches snapshot', () => {
    const props: ProblemTypeEditProps = {
      subQuestionNumber: 1,
      questionContent: 'Sample MCQ',
      questionFormat: 0,
      options: [
        { id: 'a', content: 'Opt A', isCorrect: false },
        { id: 'b', content: 'Opt B', isCorrect: true },
      ],
    } as unknown as ProblemTypeEditProps;

    const { container } = render(<MultipleChoiceEdit {...props} />);
    expect(container).toMatchSnapshot();
  });

  it('adds/removes options and toggles correct flag', () => {
    const onOptionsChange = vi.fn();
    const props: ProblemTypeEditProps = {
      subQuestionNumber: 1,
      questionContent: 'MCQ Question',
      questionFormat: 0,
      options: [],
      onOptionsChange,
    } as unknown as ProblemTypeEditProps;

    render(<MultipleChoiceEdit {...props} />);

    const addBtn = screen.getByText('追加');
    fireEvent.click(addBtn);
    expect(onOptionsChange).toHaveBeenCalled();

    // After adding, the newly created option should be in the document
    const input = screen.getByPlaceholderText('選択肢 A') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'New opt' } });
    expect(onOptionsChange).toHaveBeenCalled();

    const markBtn = screen.getByLabelText('正解としてマーク');
    fireEvent.click(markBtn);
    expect(onOptionsChange).toHaveBeenCalled();

    const removeBtn = screen.getByLabelText('選択肢を削除');
    fireEvent.click(removeBtn);
    expect(onOptionsChange).toHaveBeenCalled();
  });
});
