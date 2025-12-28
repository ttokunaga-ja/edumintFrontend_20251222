import React from 'react';
import FreeTextEdit from './FreeTextEdit';
import type { Meta, StoryObj } from '@storybook/react';
import type { ProblemTypeEditProps } from '@/types/problemTypes'; const meta: Meta<typeof FreeTextEdit> = { title: 'ProblemTypes/FreeTextEdit', component: FreeTextEdit,
}; export default meta; type Story = StoryObj<typeof FreeTextEdit>; export const Default: Story = { args: { subQuestionNumber: 1, questionContent: 'Explain the Pythagorean theorem.', questionFormat: 0, answerContent: 'a^2 + b^2 = c^2', answerFormat: 0, } as unknown as ProblemTypeEditProps,
}; export const LatexQuestion: Story = { args: { subQuestionNumber: 1, questionContent: '\\(a^2 + b^2 = c^2\\)', questionFormat: 1, answerContent: 'Proof sketch...', answerFormat: 0, } as unknown as ProblemTypeEditProps,
};
