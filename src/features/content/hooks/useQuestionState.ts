/**
 * useQuestionState hook
 *
 * 大問単位の状態管理
 */

import { useState, useCallback } from 'react';
import { Question, QuestionEditState } from '../types';

export interface UseQuestionStateReturn {
  state: QuestionEditState;
  updateContent: (content: string) => void;
  updateDifficulty: (difficultyId: number | undefined) => void;
  addKeyword: (keyword: string) => void;
  removeKeyword: (keywordId: string) => void;
  markDirty: () => void;
  markClean: () => void;
  reset: (question: Question) => void;
}

/**
 * 大問の状態を管理
 *
 * @param initialQuestion - 初期大問データ
 * @returns 大問状態管理オブジェクト
 */
export function useQuestionState(initialQuestion: Question): UseQuestionStateReturn {
  const [state, setState] = useState<QuestionEditState>({
    question: { ...initialQuestion },
    isDirty: false,
    unsavedFields: new Set(),
  });

  const updateContent = useCallback((content: string) => {
    setState((prev) => {
      const unsavedFields = new Set(prev.unsavedFields);
      unsavedFields.add('content');
      return {
        question: { ...prev.question, content },
        isDirty: true,
        unsavedFields,
      };
    });
  }, []);



  const updateDifficulty = useCallback((difficultyId: number | undefined) => {
    setState((prev) => {
      const unsavedFields = new Set(prev.unsavedFields);
      unsavedFields.add('difficulty');
      return {
        question: {
          ...prev.question,
          difficulty: difficultyId
            ? { id: difficultyId, label: `難易度${difficultyId}`, level: difficultyId }
            : undefined,
        },
        isDirty: true,
        unsavedFields,
      };
    });
  }, []);

  const addKeyword = useCallback((keyword: string) => {
    setState((prev) => {
      const unsavedFields = new Set(prev.unsavedFields);
      unsavedFields.add('keywords');
      return {
        question: {
          ...prev.question,
          keywords: [
            ...prev.question.keywords,
            {
              id: `keyword-${Date.now()}`,
              keyword,
            },
          ],
        },
        isDirty: true,
        unsavedFields,
      };
    });
  }, []);

  const removeKeyword = useCallback((keywordId: string) => {
    setState((prev) => {
      const unsavedFields = new Set(prev.unsavedFields);
      unsavedFields.add('keywords');
      return {
        question: {
          ...prev.question,
          keywords: prev.question.keywords.filter((k) => k.id !== keywordId),
        },
        isDirty: true,
        unsavedFields,
      };
    });
  }, []);

  const markDirty = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isDirty: true,
    }));
  }, []);

  const markClean = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isDirty: false,
      unsavedFields: new Set(),
    }));
  }, []);

  const reset = useCallback((question: Question) => {
    setState({
      question: { ...question },
      isDirty: false,
      unsavedFields: new Set(),
    });
  }, []);

  return {
    state,
    updateContent,
    updateDifficulty,
    addKeyword,
    removeKeyword,
    markDirty,
    markClean,
    reset,
  };
}
