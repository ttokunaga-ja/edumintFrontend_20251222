export type ProblemTypeViewProps = {
  subQuestionNumber: number;
  questionContent: string;
  answerContent?: string;
  options?: Array<{ id: string; content: string; isCorrect: boolean }>;
  keywords?: Array<{ id: string; keyword: string }>;
  showAnswer?: boolean;
};

export type ProblemTypeEditProps = ProblemTypeViewProps & {
  onQuestionChange?: (content: string) => void;
  onAnswerChange?: (content: string) => void;
  onOptionsChange?: (options: Array<{ id: string; content: string; isCorrect: boolean }>) => void;

  onQuestionUnsavedChange?: (hasUnsaved: boolean) => void;
  onAnswerUnsavedChange?: (hasUnsaved: boolean) => void;
  mode?: 'preview' | 'edit';
};

import type { ComponentType } from 'react';

export type ProblemTypeRegistration = {
  id: number;
  view: ComponentType<ProblemTypeViewProps>;
  edit?: ComponentType<ProblemTypeEditProps>;
};
