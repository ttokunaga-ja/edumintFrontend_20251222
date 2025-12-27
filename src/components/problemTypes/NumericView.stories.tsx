import React from 'react';
import NumericView from './NumericView';
import type { Meta, StoryObj } from '@storybook/react';
import type { ProblemTypeViewProps } from '@/types/problemTypes';

const meta: Meta<typeof NumericView> = {
  title: 'ProblemTypes/NumericView',
  component: NumericView,
};

export default meta;

type Story = StoryObj<typeof NumericView>;

export const Default: Story = {
  args: {
    subQuestionNumber: 1,
    questionContent: 'Solve: 2 + 2 = ____',
    questionFormat: 0,
    showAnswer: false,
  } as unknown as ProblemTypeViewProps,
};

export const WithAnswer: Story = {
  args: {
    subQuestionNumber: 1,
    questionContent: 'Answer: 4',
    questionFormat: 0,
    showAnswer: true,
  } as unknown as ProblemTypeViewProps,
};
