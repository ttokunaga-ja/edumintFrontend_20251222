import React from 'react';
import CodeReadingView from './CodeReadingView';
import type { Meta, StoryObj } from '@storybook/react';
import type { ProblemTypeViewProps } from '@/types/problemTypes'; const meta: Meta<typeof CodeReadingView> = { title: 'ProblemTypes/CodeReadingView', component: CodeReadingView,
}; export default meta; type Story = StoryObj<typeof CodeReadingView>; export const Default: Story = { args: { subQuestionNumber: 1, questionContent: 'What does the following code output?\nconsole.log(1+1);', questionFormat: 0, showAnswer: false, } as unknown as ProblemTypeViewProps,
}; export const WithAnswer: Story = { args: { subQuestionNumber: 1, questionContent: 'Answer: 2', questionFormat: 0, showAnswer: true, } as unknown as ProblemTypeViewProps,
};
