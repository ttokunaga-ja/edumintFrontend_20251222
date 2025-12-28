import { render } from '@testing-library/react';
import React from 'react';
import CodeReadingView from '../CodeReadingView';
import type { ProblemTypeViewProps } from '@/types/problemTypes'; describe('CodeReadingView', () => { it('renders code snippet', () => { const props: ProblemTypeViewProps = { subQuestionNumber: 1, questionContent: 'console.log(1+1);', questionFormat: 0, showAnswer: false, }; const { container } = render(<CodeReadingView {...props} />); expect(container).toMatchSnapshot(); }); it('renders with answer', () => { const props: ProblemTypeViewProps = { subQuestionNumber: 1, questionContent: 'Answer: 2', questionFormat: 0, showAnswer: true, }; const { container } = render(<CodeReadingView {...props} />); expect(container).toMatchSnapshot(); });
});
