/**
 * エラーページコンポーネント
 * 500, 404, ErrorBoundary, 503等のページ全体エラーを表示
 *
 * 使用例:
 *   <ErrorPage title="ページが見つかりません" message="..." traceId="..." />
 */

import {
  Box,
  Typography,
  Button,
  Container,
  Stack,
  Link as MuiLink,
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';

export interface ErrorPageProps {
  /** エラーページのタイトル */
  title?: string;

  /** ユーザーに表示するエラーメッセージ */
  message?: string;

  /** ユーザーがリトライ可能な場合のコールバック関数 */
  onRetry?: () => void;

  /** サーバーエラーID (トレースID)。ユーザーサポート時に用いる */
  traceId?: string;

  /** 503メンテナンス時の終了予定時刻 (例: "2026年1月2日 14:00") */
  maintenanceEndTime?: string;

  /** 503メンテナンス時のステータスページURL */
  statusPageUrl?: string;

  /** エラーコード (400, 401, 403, 404, 500, 503等) */
  statusCode?: number;
}

export const ErrorPage = ({
  title = 'システムエラーが発生しました',
  message = '予期せぬエラーが発生しました。しばらく待ってから再度お試しください。',
  onRetry,
  traceId,
  maintenanceEndTime,
  statusPageUrl,
  statusCode,
}: ErrorPageProps) => {
  const navigate = useNavigate();

  // 503 (Service Unavailable) メンテナンス画面のバリエーション
  const isMaintenanceError = statusCode === 503;

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
          {title}
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
          {message}
        </Typography>

        {/* メンテナンス時の追加情報 */}
        {isMaintenanceError && maintenanceEndTime && (
          <Box
            sx={{
              mb: 3,
              p: 2,
              bgcolor: 'info.lighter',
              borderRadius: 1,
              width: '100%',
            }}
          >
            <Typography variant="caption" display="block" sx={{ mb: 1 }}>
              📅 予定終了時刻：
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {maintenanceEndTime}
            </Typography>
          </Box>
        )}

        {/* エラーID (トレースID) */}
        {traceId && (
          <Typography
            variant="caption"
            display="block"
            sx={{
              mb: 2,
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              color: 'text.disabled',
              wordBreak: 'break-all',
              textAlign: 'center',
            }}
          >
            Error ID: {traceId}
          </Typography>
        )}

        {/* ボタン群 */}
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            mt: 2,
            width: '100%',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {/* 再読み込み */}
          <Button
            variant="contained"
            size="large"
            onClick={() => window.location.reload()}
            sx={{
              minWidth: 140,
            }}
          >
            再読み込み
          </Button>

          {/* リトライ */}
          {onRetry && (
            <Button
              variant="outlined"
              size="large"
              onClick={onRetry}
              sx={{
                minWidth: 140,
              }}
            >
              もう一度試す
            </Button>
          )}

          {/* ホームへ */}
          <Button
            variant="text"
            size="large"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{
              minWidth: 140,
            }}
          >
            ホームへ
          </Button>
        </Stack>

        {/* ステータスページへのリンク */}
        {isMaintenanceError && statusPageUrl && (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              詳細は
              <MuiLink
                href={statusPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  ml: 0.5,
                  fontWeight: 500,
                }}
              >
                ステータスページ
              </MuiLink>
              をご確認ください
            </Typography>
          </Box>
        )}

        {/* サポートリンク */}
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="caption" color="text.disabled" display="block">
            ご不明な点は
            <MuiLink href="mailto:support@eduanima.jp" sx={{ ml: 0.5 }}>
              サポート
            </MuiLink>
            までお問い合わせください
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default ErrorPage;
