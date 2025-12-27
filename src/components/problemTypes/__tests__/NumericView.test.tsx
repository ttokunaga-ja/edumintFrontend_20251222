import { render } from '@testing-library/react';
import React from 'react';
import NumericView from '../NumericView';
import type { ProblemTypeViewProps } from '@/types/problemTypes';

describe('NumericView', () => {
  it('renders numeric prompt', () => {
    const props: ProblemTypeViewProps = {
      subQuestionNumber: 1,
      questionContent: 'Solve: 2 + 2 = ____',
      questionFormat: 0,
      showAnswer: false,
    };
    const { container } = render(<NumericView {...props} />);
    expect(container).toMatchSnapshot();
  });

  it('renders numeric with answer shown', () => {
    const props: ProblemTypeViewProps = {
      subQuestionNumber: 1,
      questionContent: 'Answer: 4',
      questionFormat: 0,
      showAnswer: true,
    };
    const { container } = render(<NumericView {...props} />);
    expect(container).toMatchSnapshot();
  });
});
