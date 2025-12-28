import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QuestionBlock } from '@/components/page/ProblemViewEditPage/QuestionBlock';
import React from 'react';

describe('QuestionBlock', () => {
    const mockQuestion = {
        question_content: 'What is React?',
        difficulty: 2,
        keywords: [{ id: '1', keyword: 'web' }]
    };

    it('hides question form in structure mode', () => {
        render(<QuestionBlock question={mockQuestion} viewMode="structure" onContentChange={() => { }} />);

        // Check if QuestionForm (which contains the content) is hidden
        // Based on QuestionBlock implementation: {viewMode === 'full' && <QuestionForm ... />}
        expect(screen.queryByText('What is React?')).toBeNull();

        // Metadata should still be visible (assuming QuestionMetaView or similar is shown)
        // Actually QuestionBlock displays either QuestionMetaEdit or QuestionMetaView
        // Let's check for the presence of "Difficulty" or similar labels if they are always there
        expect(screen.getByText('web')).toBeDefined();
    });

    it('shows question form in full mode', () => {
        render(<QuestionBlock question={mockQuestion} viewMode="full" onContentChange={() => { }} />);
        expect(screen.getByText('What is React?')).toBeDefined();
    });
});
