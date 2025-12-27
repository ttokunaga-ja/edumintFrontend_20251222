import { render } from '@testing-library/react';
import React from 'react';
import ProgrammingView from '../ProgrammingView';
import type { ProblemTypeViewProps } from '@/types/problemTypes';

describe('ProgrammingView', () => {
  it('renders programming prompt', () => {
    const props: ProblemTypeViewProps = {
      subQuestionNumber: 1,
      questionContent: 'Write add(a,b)',
      questionFormat: 0,
      showAnswer: false,
    };
    const { container } = render(<ProgrammingView {...props} />);
    expect(container).toMatchSnapshot();
  });

  it('renders programming with answer shown', () => {
    const props: ProblemTypeViewProps = {
      subQuestionNumber: 1,
      questionContent: 'function add(a,b){return a+b}',
      questionFormat: 0,
      showAnswer: true,
    };
    const { container } = render(<ProgrammingView {...props} />);
    expect(container).toMatchSnapshot();
  });
});
