import React from 'react';
import { render, screen } from '@testing-library/react';
import SelectionEditor from '../Selection';

test('selection renders choices manager', () => {
  render(<SelectionEditor questionContent="q" questionFormat={0} options={[]} onQuestionChange={() => {}} onOptionsChange={() => {}} />);
  expect(screen.getByText('選択肢')).toBeInTheDocument();
});
