import React from 'react';
import CodeReadingEdit from './CodeReadingEdit';
import type { Meta, StoryObj } from '@storybook/react';
import type { ProblemTypeEditProps } from '@/types/problemTypes';

const meta: Meta<typeof CodeReadingEdit> = {
  title: 'ProblemTypes/CodeReadingEdit',
  component: CodeReadingEdit,
};

export default meta;

type Story = StoryObj<typeof CodeReadingEdit>;

export const Default: Story = {
  args: {
    subQuestionNumber: 1,
    questionContent: 'What does foo return?',
    questionFormat: 0,
    answerContent: 'function foo() { return 42; }',
    answerFormat: 0,
  } as unknown as ProblemTypeEditProps,
};
