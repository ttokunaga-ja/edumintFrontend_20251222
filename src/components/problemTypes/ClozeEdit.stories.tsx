import React from 'react';
import ClozeEdit from './ClozeEdit';
import type { Meta, StoryObj } from '@storybook/react';
import type { ProblemTypeEditProps } from '@/types/problemTypes';

const meta: Meta<typeof ClozeEdit> = {
  title: 'ProblemTypes/ClozeEdit',
  component: ClozeEdit,
};

export default meta;

type Story = StoryObj<typeof ClozeEdit>;

export const Default: Story = {
  args: {
    subQuestionNumber: 1,
    questionContent: 'Fill in the blank: 2 + 2 = ___',
    questionFormat: 0,
    answerContent: '4',
    answerFormat: 0,
  } as unknown as ProblemTypeEditProps,
};
