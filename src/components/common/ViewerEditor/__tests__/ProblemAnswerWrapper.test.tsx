import React from 'react';
import { render, screen } from '@testing-library/react';
import ProblemAnswerWrapper from '../ProblemAnswerWrapper';

test('renders descriptive editor for id 1', () => {
  render(<ProblemAnswerWrapper formatId={1} questionContent="q" questionFormat={0} onQuestionChange={() => {}} />);
  expect(screen.getByLabelText('問題文入力')).toBeInTheDocument();
});

test('renders selection editor for id 2', () => {
  render(<ProblemAnswerWrapper formatId={2} questionContent="q" questionFormat={0} onQuestionChange={() => {}} />);
  expect(screen.getByText('選択肢')).toBeInTheDocument();
});
