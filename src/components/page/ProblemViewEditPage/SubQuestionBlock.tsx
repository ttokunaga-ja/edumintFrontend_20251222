import React, { forwardRef } from 'react';
import SubQuestionSection, { SubQuestionSectionProps, SubQuestionSectionHandle } from './SubQuestionSection/SubQuestionSection';

/**
 * SubQuestionBlock
 *
 * ProblemViewEditPage で使用される SubQuestion ブロック
 * Repository と Hooks を統合した SubQuestionSection にデリゲートする
 * ref を通じて SubQuestionSectionHandle を公開
 */
export const SubQuestionBlock = forwardRef<SubQuestionSectionHandle, SubQuestionBlockProps>(
  function SubQuestionBlockComponent(props, ref) {
    return (
      <SubQuestionSection
        ref={ref}
        id={props.id}
        subQuestionNumber={props.subQuestionNumber}
        questionTypeId={props.questionTypeId}
        questionContent={props.questionContent}
        answerContent={props.answerContent}
        explanation={props.explanation}
        keywords={props.keywords}
        options={props.options}
        pairs={props.pairs}
        items={props.items}
        answers={props.answers}
        canEdit={props.canEdit}
        showAnswer={props.showAnswer}
        onQuestionChange={props.onQuestionChange}
        onAnswerChange={props.onAnswerChange}
        onQuestionsUnsavedChange={props.onQuestionUnsavedChange}
        onAnswersUnsavedChange={props.onAnswerUnsavedChange}
        onKeywordAdd={props.onKeywordAdd}
        onKeywordRemove={props.onKeywordRemove}
        onTypeChange={props.onTypeChange}
        onDelete={props.onDelete}
        onSaveSuccess={props.onSaveSuccess}
        onSaveError={props.onSaveError}
        mode={props.mode}
      />
    );
  }
);

export type SubQuestionBlockProps = {
  id?: string;
  subQuestionNumber: number;
  questionTypeId: number;
  questionContent: string;
  answerContent?: string;
  explanation?: string;
  keywords?: Array<{ id: string; keyword: string }>;
  options?: Array<{ id: string; content: string; isCorrect: boolean }>;
  pairs?: Array<{ id: string; question: string; answer: string }>;
  items?: Array<{ id: string; text: string; correctOrder: number }>;
  answers?: Array<{ id: string; sampleAnswer: string; gradingCriteria: string; pointValue: number }>;
  canEdit?: boolean;
  showAnswer?: boolean;
  onQuestionChange?: (content: string) => void;
  onAnswerChange?: (content: string) => void;
  onQuestionUnsavedChange?: (hasUnsaved: boolean) => void;
  onAnswerUnsavedChange?: (hasUnsaved: boolean) => void;
  onKeywordAdd?: (keyword: string) => void;
  onKeywordRemove?: (keywordId: string) => void;
  onTypeChange?: (typeId: number) => void;
  onDelete?: () => void;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
  mode?: 'preview' | 'edit';
};

export default SubQuestionBlock;
