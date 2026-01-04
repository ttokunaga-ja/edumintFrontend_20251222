/**
 * Question Repository
 *
 * 大問（Question）のAPIインターフェース層
 */

import { Question, SubQuestion } from '../types';
import { ApiResponse, PaginationParams, PaginatedResponse } from './problemRepository';

/**
 * Question検索フィルタ
 */
export interface QuestionFilter {
  problemId?: string;
  difficultySince?: number;
  difficultyUpto?: number;
  hasKeywords?: string[];
}

/**
 * Question作成リクエスト
 */
export interface CreateQuestionRequest {
  problemId: string;
  questionNumber: number;
  content: string;
  difficulty?: number;
  keywords?: string[];
}

/**
 * Question更新リクエスト
 */
export interface UpdateQuestionRequest {
  questionNumber?: number;
  content?: string;
  difficulty?: number;
  keywords?: string[];
} 

/**
 * Question並び替えリクエスト
 */
export interface ReorderQuestionsRequest {
  questionId: string;
  newOrder: number;
}

/**
 * QuestionRepository インターフェース
 */
export interface IQuestionRepository {
  // CRUD操作
  getById(id: string): Promise<Question>;
  create(request: CreateQuestionRequest): Promise<Question>;
  update(id: string, request: UpdateQuestionRequest): Promise<Question>;
  delete(id: string): Promise<void>;

  // リスト取得
  listByProblem(
    problemId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<Question>>;
  list(
    pagination: PaginationParams,
    filter?: QuestionFilter
  ): Promise<PaginatedResponse<Question>>;

  // 検索
  search(keyword: string, pagination: PaginationParams): Promise<PaginatedResponse<Question>>;

  // 操作
  reorder(problemId: string, items: ReorderQuestionsRequest[]): Promise<Question[]>;
  duplicate(id: string): Promise<Question>;
  addKeyword(questionId: string, keyword: string): Promise<Question>;
  removeKeyword(questionId: string, keywordId: string): Promise<Question>;

  // バルク操作
  deleteMultiple(ids: string[]): Promise<void>;
  updateMultiple(
    updates: Array<{ id: string; data: UpdateQuestionRequest }>
  ): Promise<Question[]>;
}

/**
 * QuestionRepository 実装クラス
 */
export class QuestionRepository implements IQuestionRepository {
  private baseUrl = '/api/questions';
  private cache = new Map<string, Question>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5分

  /**
   * キャッシュから取得
   */
  private getFromCache(key: string): Question | null {
    const expiry = this.cacheExpiry.get(key);
    if (!expiry || Date.now() > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    return this.cache.get(key) || null;
  }

  /**
   * キャッシュに保存
   */
  private saveToCache(key: string, value: Question): void {
    this.cache.set(key, value);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);
  }

  /**
   * キャッシュをクリア
   */
  private clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  /**
   * APIリクエストを実行
   */
  private async request<T>(
    method: string,
    endpoint: string,
    data?: unknown
  ): Promise<T> {
    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, options);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const apiResponse: ApiResponse<T> = await response.json();
      if (!apiResponse.success) {
        throw new Error(apiResponse.error?.message || 'Unknown error');
      }

      return apiResponse.data as T;
    } catch (error) {
      throw new Error(`API Request Error: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  }

  async getById(id: string): Promise<Question> {
    const cached = this.getFromCache(id);
    if (cached) return cached;

    const question = await this.request<Question>('GET', `/${id}`);
    this.saveToCache(id, question);
    return question;
  }

  async create(request: CreateQuestionRequest): Promise<Question> {
    const question = await this.request<Question>('POST', '', request);
    this.saveToCache(question.id, question);
    return question;
  }

  async update(id: string, request: UpdateQuestionRequest): Promise<Question> {
    const question = await this.request<Question>('PUT', `/${id}`, request);
    this.saveToCache(id, question);
    return question;
  }

  async delete(id: string): Promise<void> {
    await this.request<void>('DELETE', `/${id}`);
    this.cache.delete(id);
    this.cacheExpiry.delete(id);
  }

  async listByProblem(
    problemId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<Question>> {
    const params = new URLSearchParams();
    params.append('problemId', problemId);
    params.append('page', String(pagination.page));
    params.append('limit', String(pagination.limit));

    return this.request<PaginatedResponse<Question>>(
      'GET',
      `?${params.toString()}`
    );
  }

  async list(
    pagination: PaginationParams,
    filter?: QuestionFilter
  ): Promise<PaginatedResponse<Question>> {
    const params = new URLSearchParams();
    params.append('page', String(pagination.page));
    params.append('limit', String(pagination.limit));

    if (filter) {
      if (filter.problemId) params.append('problemId', filter.problemId);
      if (filter.difficultySince) params.append('difficultySince', String(filter.difficultySince));
      if (filter.difficultyUpto) params.append('difficultyUpto', String(filter.difficultyUpto));
      if (filter.hasKeywords?.length) {
        params.append('keywords', filter.hasKeywords.join(','));
      } 
    }

    return this.request<PaginatedResponse<Question>>(
      'GET',
      `?${params.toString()}`
    );
  }

  async search(keyword: string, pagination: PaginationParams): Promise<PaginatedResponse<Question>> {
    const params = new URLSearchParams();
    params.append('keyword', keyword);
    params.append('page', String(pagination.page));
    params.append('limit', String(pagination.limit));

    return this.request<PaginatedResponse<Question>>(
      'GET',
      `/search?${params.toString()}`
    );
  }

  async reorder(
    problemId: string,
    items: ReorderQuestionsRequest[]
  ): Promise<Question[]> {
    const questions = await this.request<Question[]>('POST', '/reorder', {
      problemId,
      items,
    });

    // キャッシュを更新
    questions.forEach((q) => {
      this.saveToCache(q.id, q);
    });

    return questions;
  }

  async duplicate(id: string): Promise<Question> {
    const question = await this.request<Question>('POST', `/${id}/duplicate`);
    this.saveToCache(question.id, question);
    return question;
  }

  async addKeyword(questionId: string, keyword: string): Promise<Question> {
    const question = await this.request<Question>('POST', `/${questionId}/keywords`, {
      keyword,
    });
    this.saveToCache(questionId, question);
    return question;
  }

  async removeKeyword(questionId: string, keywordId: string): Promise<Question> {
    const question = await this.request<Question>(
      'DELETE',
      `/${questionId}/keywords/${keywordId}`
    );
    this.saveToCache(questionId, question);
    return question;
  }

  async deleteMultiple(ids: string[]): Promise<void> {
    await this.request<void>('POST', '/delete-multiple', { ids });
    ids.forEach((id) => {
      this.cache.delete(id);
      this.cacheExpiry.delete(id);
    });
  }

  async updateMultiple(
    updates: Array<{ id: string; data: UpdateQuestionRequest }>
  ): Promise<Question[]> {
    const questions = await this.request<Question[]>('POST', '/update-multiple', {
      updates,
    });
    questions.forEach((q) => {
      this.saveToCache(q.id, q);
    });
    return questions;
  }
}

/**
 * グローバルRepositoryインスタンス
 */
let questionRepositoryInstance: QuestionRepository | null = null;

/**
 * QuestionRepositoryインスタンスの取得
 */
export function getQuestionRepository(): QuestionRepository {
  if (!questionRepositoryInstance) {
    questionRepositoryInstance = new QuestionRepository();
  }
  return questionRepositoryInstance;
}
