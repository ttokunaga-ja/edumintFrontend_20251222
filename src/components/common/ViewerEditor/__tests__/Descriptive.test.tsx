import React from 'react';
import { render, screen } from '@testing-library/react';
import DescriptiveEditor from '../Type1_Descriptive';

test('descriptive renders question and answer editors', () => {
  render(<DescriptiveEditor questionContent="q" questionFormat={0} onQuestionChange={() => {}} onAnswerChange={() => {}} />);
  expect(screen.getByLabelText('問題文入力')).toBeInTheDocument();
  expect(screen.getByLabelText('解答 / メモ入力')).toBeInTheDocument();
});
