import { render } from '@testing-library/react';
import React from 'react';
import TrueFalseView from '../TrueFalseView';
import type { ProblemTypeViewProps } from '@/types/problemTypes';

describe('TrueFalseView', () => {
  it('renders question prompt', () => {
    const props: ProblemTypeViewProps = {
      subQuestionNumber: 1,
      questionContent: 'Is 2 prime?',
      questionFormat: 0,
      showAnswer: false,
    };
    const { container } = render(<TrueFalseView {...props} />);
    expect(container).toMatchSnapshot();
  });

  it('renders with answer shown', () => {
    const props: ProblemTypeViewProps = {
      subQuestionNumber: 1,
      questionContent: 'Answer: True',
      questionFormat: 0,
      showAnswer: true,
    };
    const { container } = render(<TrueFalseView {...props} />);
    expect(container).toMatchSnapshot();
  });
});
