import { render } from '@testing-library/react';
import React from 'react';
import ClozeView from '../ClozeView';
import type { ProblemTypeViewProps } from '@/types/problemTypes'; describe('ClozeView', () => { it('renders cloze markdown content', () => { const props: ProblemTypeViewProps = { subQuestionNumber: 1, questionContent: 'Fill the blank: The capital of France is **____**.', questionFormat: 0, showAnswer: false, }; const { container } = render(<ClozeView {...props} />); expect(container).toMatchSnapshot(); }); it('renders cloze with answer shown', () => { const props: ProblemTypeViewProps = { subQuestionNumber: 1, questionContent: 'Fill the blank: The capital of France is **Paris**.', questionFormat: 0, showAnswer: true, }; const { container } = render(<ClozeView {...props} />); expect(container).toMatchSnapshot(); });
});
