import React from 'react';
import { QuestionCardView } from './QuestionCardView';
import { SubQuestionCardView } from './SubQuestionCardView';

type QuestionSectionViewProps = {
  question: any;
};

export const QuestionSectionView: React.FC<QuestionSectionViewProps> = ({ question }) => {
  return (
    <div className="space-y-6">
      <QuestionCardView question={question} />
      <div className="space-y-4 pl-8">
        {(question.sub_questions || []).map((sq: any, idx: number) => (
          <SubQuestionCardView key={sq.id || idx} subQuestion={sq} />
        ))}
      </div>
    </div>
  );
};
