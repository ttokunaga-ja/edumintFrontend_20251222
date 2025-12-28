import { render } from '@testing-library/react';
import React from 'react';
import FreeTextView from '../FreeTextView';
import type { ProblemTypeViewProps } from '@/types/problemTypes'; describe('FreeTextView', () => { it('renders markdown content', () => { const props: ProblemTypeViewProps = { subQuestionNumber: 1, questionContent: '# Title\nSome **bold** text', questionFormat: 0, showAnswer: false, }; const { container } = render(<FreeTextView {...props} />); expect(container).toMatchSnapshot(); }); it('renders latex content', () => { const props: ProblemTypeViewProps = { subQuestionNumber: 1, questionContent: '\\frac{1}{2}', questionFormat: 1, showAnswer: false, }; const { container } = render(<FreeTextView {...props} />); expect(container).toMatchSnapshot(); });
});
