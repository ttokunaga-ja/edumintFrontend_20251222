import React, { Suspense } from 'react';
import { ProblemTypeEditProps } from '@/types/problemTypes';
import { SubQuestionMetaEdit } from './common/SubQuestionMetaEdit';
import ProblemTypeRegistry from '@/components/problemTypes/ProblemTypeRegistry';

type SubQuestionCardEditProps = { subQuestion: any; editComponent?: React.LazyExoticComponent<React.ComponentType<ProblemTypeEditProps>> | null; fallbackComponent?: React.ComponentType<ProblemTypeEditProps>; typeOptions: Array<{ value: number; label: string }>; onQuestionChange: (content: string) => void; onAnswerChange: (content: string) => void; onOptionsChange?: (options: Array<{ id: string; content: string; isCorrect: boolean }>) => void; onFormatChange?: (field: 'question' | 'answer', format: 0 | 1) => void; onKeywordAdd?: (kw: string) => void; onKeywordRemove?: (id: string) => void; onTypeChange?: (typeId: number) => void; viewMode?: 'full' | 'structure';
};

export const SubQuestionCardEdit: React.FC<SubQuestionCardEditProps> = ({
  subQuestion,
  editComponent,
  fallbackComponent,
  typeOptions,
  onQuestionChange,
  onAnswerChange,
  onOptionsChange,
  onFormatChange,
  onKeywordAdd,
  onKeywordRemove,
  onTypeChange,
  viewMode = 'full',
}) => {
  const typeId = subQuestion.sub_question_type_id ?? subQuestion.question_type_id ?? subQuestion.questionTypeId ?? 1;
  const number = subQuestion.sub_question_number ?? subQuestion.subQuestionNumber ?? 1;
  const Comp = editComponent ?? ProblemTypeRegistry.getProblemTypeEdit(typeId);
  const Fallback = fallbackComponent;

  const normalizedProps: ProblemTypeEditProps = {
    subQuestionNumber: number,
    questionContent: subQuestion.sub_question_content ?? subQuestion.question_content ?? '',
    questionFormat: (subQuestion.sub_question_format ?? subQuestion.question_format ?? 0) as 0 | 1,
    answerContent: subQuestion.answer_content ?? '',
    answerFormat: (subQuestion.answer_format ?? 0) as 0 | 1,
    options: subQuestion.options ?? [],
    keywords: subQuestion.keywords ?? [],
    onQuestionChange,
    onAnswerChange,
    onOptionsChange,
    onFormatChange,
  };

  return (
    <div>
      <div>
        <div style={{ alignItems: 'center', justifyContent: 'center' }}>({number})</div>
        <div>
          <div style={{ alignItems: 'center', gap: '0.5rem' }}>
            <span>小問{number}</span>
          </div>

          <SubQuestionMetaEdit
            questionTypeId={typeId}
            questionTypeOptions={typeOptions}
            keywords={subQuestion.keywords ?? []}
            onTypeChange={onTypeChange}
            onKeywordAdd={onKeywordAdd}
            onKeywordRemove={onKeywordRemove}
          />
        </div>
      </div>

      {viewMode === 'full' && (
        <Suspense fallback={<div style={{ borderRadius: '0.375rem' }}>Loading editor...</div>}>
          {Comp ? <Comp {...normalizedProps} /> : Fallback ? <Fallback {...normalizedProps} /> : null}
        </Suspense>
      )}
    </div>
  );
};
