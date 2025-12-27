import React from 'react';
import ProgrammingView from './ProgrammingView';
import type { Meta, StoryObj } from '@storybook/react';
import type { ProblemTypeViewProps } from '@/types/problemTypes';

const meta: Meta<typeof ProgrammingView> = {
  title: 'ProblemTypes/ProgrammingView',
  component: ProgrammingView,
};

export default meta;

type Story = StoryObj<typeof ProgrammingView>;

export const Default: Story = {
  args: {
    subQuestionNumber: 1,
    questionContent: 'Write a function to add two numbers',
    questionFormat: 0,
    showAnswer: false,
  } as unknown as ProblemTypeViewProps,
};

export const WithAnswer: Story = {
  args: {
    subQuestionNumber: 1,
    questionContent: 'function add(a, b) { return a + b; }',
    questionFormat: 0,
    showAnswer: true,
  } as unknown as ProblemTypeViewProps,
};
