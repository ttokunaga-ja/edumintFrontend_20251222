import React from 'react';
import ProgrammingEdit from './ProgrammingEdit';
import type { Meta, StoryObj } from '@storybook/react';
import type { ProblemTypeEditProps } from '@/types/problemTypes';

const meta: Meta<typeof ProgrammingEdit> = {
  title: 'ProblemTypes/ProgrammingEdit',
  component: ProgrammingEdit,
};

export default meta;

type Story = StoryObj<typeof ProgrammingEdit>;

export const Default: Story = {
  args: {
    subQuestionNumber: 1,
    questionContent: 'Write a function to return the sum of two numbers.',
    questionFormat: 0,
    answerContent: 'function add(a, b) { return a + b; }',
    answerFormat: 0,
  } as unknown as ProblemTypeEditProps,
};
