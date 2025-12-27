import React from 'react';
import MultipleChoiceEdit from './MultipleChoiceEdit';
import type { Meta, StoryObj } from '@storybook/react';
import type { ProblemTypeEditProps } from '@/types/problemTypes';

const meta: Meta<typeof MultipleChoiceEdit> = {
  title: 'ProblemTypes/MultipleChoiceEdit',
  component: MultipleChoiceEdit,
};

export default meta;

type Story = StoryObj<typeof MultipleChoiceEdit>;

export const Default: Story = {
  args: {
    subQuestionNumber: 1,
    questionContent: 'Which of the following are prime numbers?',
    questionFormat: 0,
    answerContent: 'A and C are prime.',
    answerFormat: 0,
    options: [
      { id: 'a', content: '2', isCorrect: true },
      { id: 'b', content: '4', isCorrect: false },
      { id: 'c', content: '3', isCorrect: true },
    ],
  } as unknown as ProblemTypeEditProps,
};
