import { render } from '@testing-library/react';
import React from 'react';
import ProofView from '../ProofView';
import type { ProblemTypeViewProps } from '@/types/problemTypes'; describe('ProofView', () => { it('renders proof content', () => { const props: ProblemTypeViewProps = { subQuestionNumber: 1, questionContent: 'Prove something important.', questionFormat: 0, showAnswer: false, }; const { container } = render(<ProofView {...props} />); expect(container).toMatchSnapshot(); }); it('renders proof with answer shown', () => { const props: ProblemTypeViewProps = { subQuestionNumber: 1, questionContent: 'Proof steps...', questionFormat: 0, showAnswer: true, }; const { container } = render(<ProofView {...props} />); expect(container).toMatchSnapshot(); });
});
