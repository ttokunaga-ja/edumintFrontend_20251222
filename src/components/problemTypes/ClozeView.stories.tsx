import React from 'react';
import ClozeView from './ClozeView';
import type { Meta, StoryObj } from '@storybook/react';
import type { ProblemTypeViewProps } from '@/types/problemTypes'; const meta: Meta<typeof ClozeView> = { title: 'ProblemTypes/ClozeView', component: ClozeView,
}; export default meta; type Story = StoryObj<typeof ClozeView>; export const Default: Story = { args: { subQuestionNumber: 1, questionContent: 'Fill the blank: The capital of France is **____**.', questionFormat: 0, showAnswer: false, } as unknown as ProblemTypeViewProps,
}; export const WithAnswer: Story = { args: { subQuestionNumber: 1, questionContent: 'Fill the blank: The capital of France is **Paris**. (answer hidden by default)', questionFormat: 0, showAnswer: true, } as unknown as ProblemTypeViewProps,
};
