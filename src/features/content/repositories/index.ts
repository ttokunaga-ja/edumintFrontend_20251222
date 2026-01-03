/**
 * Features Layer - Repositories
 *
 * APIリポジトリ層の再エクスポート
 */

// Problem Repository exports
export {
  ProblemRepository,
  getProblemRepository,
  type IProblemRepository,
  type ApiResponse,
  type PaginationParams,
  type PaginatedResponse,
  type ProblemFilter,
  type CreateProblemRequest,
  type UpdateProblemRequest,
} from './problemRepository';

// Question Repository exports
export {
  QuestionRepository,
  getQuestionRepository,
  type IQuestionRepository,
  type QuestionFilter,
  type CreateQuestionRequest,
  type UpdateQuestionRequest,
  type ReorderQuestionsRequest,
} from './questionRepository';

// SubQuestion Repository exports
export {
  SubQuestionRepository,
  type ISubQuestionRepository,
  type SubQuestionFilter,
  type CreateSubQuestionRequest,
  type UpdateSubQuestionRequest,
  type CreateSelectionSubQuestionRequest,
  type CreateMatchingSubQuestionRequest,
  type CreateOrderingSubQuestionRequest,
  type CreateEssaySubQuestionRequest,
} from './subQuestionRepository';
