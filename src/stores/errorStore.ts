/**
 * グローバルエラー通知ストア (Zustand)
 *
 * 使用例:
 *   const { show, hide, isOpen } = useErrorStore();
 *   show('エラーが発生しました', 'error', 'TRACE_ID_123');
 */

import { create } from 'zustand';
import { ErrorSeverity } from '@/types/api';

export interface ErrorStore {
  /** 通知が表示されているかどうか */
  isOpen: boolean;

  /** 表示するメッセージ */
  message: string;

  /** エラーレベル */
  severity: ErrorSeverity;

  /** トレースID */
  traceId?: string;

  /** 自動的に閉じるまでの時間（ミリ秒）。nullなら自動閉じしない */
  autoHideDuration?: number;

  /**
   * エラー通知を表示
   *
   * @param message ユーザー向けのエラーメッセージ
   * @param severity エラー重要度 ('info' | 'warning' | 'error')
   * @param traceId サーバーのトレースID
   * @param autoHideDuration 自動的に閉じるまでの時間（ミリ秒）。デフォルト6000
   */
  show: (
    message: string,
    severity?: ErrorSeverity,
    traceId?: string,
    autoHideDuration?: number
  ) => void;

  /** 通知を閉じる */
  close: () => void;

  /** リセット */
  reset: () => void;
}

const initialState = {
  isOpen: false,
  message: '',
  severity: 'error' as ErrorSeverity,
  traceId: undefined,
  autoHideDuration: 6000,
};

export const useErrorStore = create<ErrorStore>((set) => ({
  ...initialState,

  show: (
    message: string,
    severity: ErrorSeverity = 'error',
    traceId?: string,
    autoHideDuration: number = 6000
  ) => {
    set({
      isOpen: true,
      message,
      severity,
      traceId,
      autoHideDuration,
    });
  },

  close: () => {
    set({ isOpen: false });
  },

  reset: () => {
    set(initialState);
  },
}));

export default useErrorStore;
