/**
 * エラーバウンダリーコンポーネント
 * 予期しないレンダリングエラーをキャッチして、画面真っ白を防ぐ
 *
 * ガイドライン: docs/U_ERR_GUIDELINE.md
 * アーキテクチャ: docs/F_ARCHITECTURE.md
 *
 * 使用例 (App.tsx):
 *   <ErrorBoundary>
 *     <YourApp />
 *   </ErrorBoundary>
 */

import React, { ReactNode, Component, ErrorInfo } from 'react';
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * エラーバウンダリー実装
 *
 * Note: React 19ではError Boundaryは従来のclassコンポーネント形式でのみサポート
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: undefined,
      errorInfo: undefined,
    };
  }

  /**
   * エラーをキャッチして状態を更新
   */
  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * エラーハンドリング（ロギング等）
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 開発環境では詳細をログに出す
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }

    // 親に通知
    this.props.onError?.(error, errorInfo);

    // 状態に保存
    this.setState({ errorInfo });
  }

  private resetError = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
    });
  };

  render() {
    if (this.state.hasError) {
      // カスタムフォールバックが指定されている場合
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // デフォルトエラー画面
      return (
        <Container maxWidth="sm">
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
            py={4}
          >
            {/* エラーアイコン */}
            <ErrorOutlineIcon
              color="error"
              sx={{
                fontSize: 80,
                mb: 3,
                opacity: 0.8,
              }}
            />

            {/* タイトル */}
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 600,
                textAlign: 'center',
                mb: 1,
              }}
            >
              予期せぬエラーが発生しました
            </Typography>

            {/* メッセージ */}
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                textAlign: 'center',
                mb: 3,
                lineHeight: 1.6,
              }}
            >
              申し訳ございません。ページの読み込み中にエラーが発生しました。
              <br />
              下のボタンで復旧をお試しください。
            </Typography>

            {/* 開発環境ではエラー詳細を表示 */}
            {process.env.NODE_ENV === 'development' &&
              this.state.error && (
                <Box
                  component="pre"
                  sx={{
                    width: '100%',
                    p: 2,
                    mb: 3,
                    bgcolor: '#f5f5f5',
                    borderRadius: 1,
                    overflow: 'auto',
                    fontSize: '0.75rem',
                    lineHeight: 1.4,
                    border: '1px solid #ddd',
                    color: '#d32f2f',
                  }}
                >
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </Box>
              )}

            {/* ボタン */}
            <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
              {/* ページ復帰 */}
              <Button
                variant="contained"
                size="large"
                onClick={this.resetError}
                sx={{
                  minWidth: 140,
                }}
              >
                復帰する
              </Button>

              {/* 再読み込み */}
              <Button
                variant="outlined"
                size="large"
                onClick={() => window.location.reload()}
                sx={{
                  minWidth: 140,
                }}
              >
                再読み込み
              </Button>
            </Stack>

            {/* ホームへのリンク */}
            <Button
              variant="text"
              color="primary"
              onClick={() => {
                window.location.href = '/';
              }}
              sx={{ mt: 2 }}
            >
              ホームへ戻る
            </Button>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
