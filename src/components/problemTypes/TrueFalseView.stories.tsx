import React from 'react';
import TrueFalseView from './TrueFalseView';
import type { Meta, StoryObj } from '@storybook/react';
import type { ProblemTypeViewProps } from '@/types/problemTypes'; const meta: Meta<typeof TrueFalseView> = { title: 'ProblemTypes/TrueFalseView', component: TrueFalseView,
}; export default meta; type Story = StoryObj<typeof TrueFalseView>; export const Default: Story = { args: { subQuestionNumber: 1, questionContent: 'Is 2 prime?', questionFormat: 0, showAnswer: false, } as unknown as ProblemTypeViewProps,
}; export const WithAnswer: Story = { args: { subQuestionNumber: 1, questionContent: 'Answer: True', questionFormat: 0, showAnswer: true, } as unknown as ProblemTypeViewProps,
};
