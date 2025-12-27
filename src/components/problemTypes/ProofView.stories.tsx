import React from 'react';
import ProofView from './ProofView';
import type { Meta, StoryObj } from '@storybook/react';
import type { ProblemTypeViewProps } from '@/types/problemTypes';

const meta: Meta<typeof ProofView> = {
  title: 'ProblemTypes/ProofView',
  component: ProofView,
};

export default meta;

type Story = StoryObj<typeof ProofView>;

export const Default: Story = {
  args: {
    subQuestionNumber: 1,
    questionContent: 'Prove that for all n, n(n+1)/2 is integer',
    questionFormat: 0,
    showAnswer: false,
  } as unknown as ProblemTypeViewProps,
};

export const WithAnswer: Story = {
  args: {
    subQuestionNumber: 1,
    questionContent: 'Proof: ... (detailed steps)',
    questionFormat: 0,
    showAnswer: true,
  } as unknown as ProblemTypeViewProps,
};
