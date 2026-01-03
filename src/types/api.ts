/**
 * API関連の型定義
 * ガイドライン: docs/U_ERR_GUIDELINE.md
 */

/**
 * バックエンドの共通エラーレスポンス形式
 */
export interface ApiErrorResponse {
  /** 機械可読コード (例: 'INVALID_INPUT', 'UNAUTHORIZED', 'NOT_FOUND') */
  code: string;

  /** ユーザー表示用メッセージ */
  message: string;

  /** フィールドごとのバリデーションエラー (400/422時に使用) */
  details?: Record<string, string[]>;

  /** ログ照合用のID (トレースID) */
  traceId?: string;
}

/**
 * アプリケーション内部で扱うエラークラス
 * API呼び出しで発生したエラーを統一的に扱う
 */
export class AppError extends Error {
  /**
   * @param message ユーザー表示用メッセージ
   * @param statusCode HTTPステータスコード (400, 401, 403, 404, 422, 429, 500, 503等)
   * @param code 機械可読エラーコード
   * @param traceId ログ照合用のトレースID
   */
  constructor(
    public message: string,
    public statusCode: number,
    public code?: string,
    public traceId?: string
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * HTTPステータスコードに基づいて、デフォルトのユーザー向けメッセージを取得
   */
  static getDefaultMessage(statusCode: number): string {
    switch (statusCode) {
      case 400:
        return '入力内容に誤りがあります。再度ご確認の上、操作してください。';
      case 401:
        return 'セッションの有効期限が切れました。再度ログインしてください。';
      case 403:
        return 'このページへのアクセス権限がありません。';
      case 404:
        return 'お探しのページは見つかりませんでした。URLが変更されたか、削除された可能性があります。';
      case 422:
        return '入力内容に誤りがあります。各項目をご確認ください。';
      case 429:
        return 'アクセスが集中しています。しばらく時間を置いてから再度お試しください。';
      case 500:
        return 'システムエラーが発生しました。しばらく時間を置いてから再度お試しください。';
      case 503:
        return '現在、システムメンテナンスを行っております。終了予定時刻はステータスページをご確認ください。';
      default:
        if (statusCode >= 500) {
          return 'システムエラーが発生しました。時間をおいて再度お試しください。';
        }
        if (statusCode >= 400) {
          return '入力内容に誤りがあります。再度ご確認ください。';
        }
        return '予期せぬエラーが発生しました。';
    }
  }

  /**
   * ネットワークエラー (接続不可)
   */
  static createNetworkError(): AppError {
    return new AppError(
      'サーバーに接続できません。インターネット接続をご確認ください。',
      0,
      'NETWORK_ERROR'
    );
  }

  /**
   * APIレスポンスから AppError を生成
   */
  static fromResponse(
    statusCode: number,
    data?: ApiErrorResponse
  ): AppError {
    const message = data?.message || AppError.getDefaultMessage(statusCode);
    return new AppError(
      message,
      statusCode,
      data?.code,
      data?.traceId
    );
  }
}

/**
 * エラー通知の重要度レベル
 */
export type ErrorSeverity = 'info' | 'warning' | 'error';

/**
 * グローバルエラー通知の状態
 */
export interface ErrorNotification {
  isOpen: boolean;
  message: string;
  severity: ErrorSeverity;
  traceId?: string;
  autoHideDuration?: number;
}
