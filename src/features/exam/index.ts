// Schema & Types
export {
  QuestionTypeEnum,
  QuestionTypeLabels,
  DifficultyEnum,
  DifficultyLabels,
  ExamSchema,
  SubQuestionSchema,
  QuestionSchema,
  createDefaultSubQuestion,
  createDefaultQuestion,
  createDefaultExam,
  type ExamFormValues,
  type Question,
  type SubQuestion,
} from './schema';

// Utilities
export {
  transformToForm,
  transformToApi,
} from './utils/normalization';

// Hooks
export {
  useExamQuery,
  useExamMutation,
} from './hooks';

// Components
export {
  ExamMetaSection,
  QuestionList,
  QuestionItem,
  SubQuestionList,
  SubQuestionItem,
} from './components';
