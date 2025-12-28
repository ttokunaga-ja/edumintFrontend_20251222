import React from 'react';
import { QuestionBlock } from './QuestionBlock'; type QuestionCardViewProps = { question: any;
}; export const QuestionCardView: React.FC<QuestionCardViewProps> = ({ question }) => { return ( <QuestionBlock questionNumber={question.question_number ?? question.questionNumber ?? 1} content={question.question_content ?? ''} format={(question.question_format ?? 0) as 0 | 1} difficulty={question.difficulty ?? 0} keywords={question.keywords ?? []} canEdit={false} canSwitchFormat={false} /> );
};
