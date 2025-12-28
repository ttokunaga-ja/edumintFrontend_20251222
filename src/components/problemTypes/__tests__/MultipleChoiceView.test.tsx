import { render } from '@testing-library/react';
import React from 'react';
import MultipleChoiceView from '../MultipleChoiceView';
import type { ProblemTypeViewProps } from '@/types/problemTypes'; const options = [ { id: 'a', content: 'Option A', isCorrect: false }, { id: 'b', content: 'Option B', isCorrect: true }, { id: 'c', content: 'Option C', isCorrect: false },
]; describe('MultipleChoiceView', () => { it('renders options without showing answers', () => { const props: ProblemTypeViewProps = { subQuestionNumber: 1, questionContent: 'Choose one', questionFormat: 0, options, showAnswer: false, }; const { container } = render(<MultipleChoiceView {...props} />); expect(container).toMatchSnapshot(); }); it('renders options with answers revealed', () => { const props: ProblemTypeViewProps = { subQuestionNumber: 1, questionContent: 'Choose one', questionFormat: 0, options, showAnswer: true, }; const { container } = render(<MultipleChoiceView {...props} />); expect(container).toMatchSnapshot(); });
});
