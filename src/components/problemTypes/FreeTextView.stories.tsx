import React from 'react';
import FreeTextView from './FreeTextView';
import type { Meta, StoryObj } from '@storybook/react';
import type { ProblemTypeViewProps } from '@/types/problemTypes'; const meta: Meta<typeof FreeTextView> = { title: 'ProblemTypes/FreeTextView', component: FreeTextView,
}; export default meta; type Story = StoryObj<typeof FreeTextView>; export const Markdown: Story = { args: { subQuestionNumber: 1, questionContent: '# Heading\nThis is *markdown*', questionFormat: 0, showAnswer: false, } as unknown as ProblemTypeViewProps,
}; export const LaTeX: Story = { args: { subQuestionNumber: 1, questionContent: '\\frac{a}{b}', questionFormat: 1, showAnswer: false, } as unknown as ProblemTypeViewProps,
};
