import React from 'react';
import MultipleChoiceView from './MultipleChoiceView';
import type { Meta, StoryObj } from '@storybook/react';
import type { ProblemTypeViewProps } from '@/types/problemTypes'; const meta: Meta<typeof MultipleChoiceView> = { title: 'ProblemTypes/MultipleChoiceView', component: MultipleChoiceView,
}; export default meta; type Story = StoryObj<typeof MultipleChoiceView>; const options = [ { id: 'a', content: 'Option A', isCorrect: false }, { id: 'b', content: 'Option B', isCorrect: true }, { id: 'c', content: 'Option C', isCorrect: false },
]; export const Default: Story = { args: { subQuestionNumber: 1, questionContent: 'Choose the correct option', questionFormat: 0, options, showAnswer: false, } as unknown as ProblemTypeViewProps,
}; export const ShowAnswer: Story = { args: { subQuestionNumber: 1, questionContent: 'Choose the correct option', questionFormat: 0, options, showAnswer: true, } as unknown as ProblemTypeViewProps,
};
