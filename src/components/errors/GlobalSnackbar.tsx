/**
 * グローバルエラー通知コンポーネント
 *
 * APIエラー、認可エラー、ネットワークエラー等を
 * 画面下部（またはトップ中央）にトースト表示します。
 *
 * App.tsx 等のルートに配置して使用：
 *   <GlobalSnackbar />
 */

import { Snackbar, Alert, AlertTitle } from '@mui/material';
import { useErrorStore } from '@/stores/errorStore';

export const GlobalSnackbar = () => {
  const { isOpen, message, severity, traceId, autoHideDuration, close } =
    useErrorStore();

  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={autoHideDuration || 6000}
      onClose={close}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{
        '& .MuiSnackbar-root': {
          maxWidth: '500px',
        },
      }}
    >
      <Alert
        onClose={close}
        severity={severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {/* タイトルがある場合（複数行エラー時） */}
        {message.includes('\n') ? (
          <>
            <AlertTitle sx={{ fontWeight: 600 }}>エラーが発生しました</AlertTitle>
            {message}
            {traceId && (
              <>
                <br />
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                  Error ID: {traceId}
                </span>
              </>
            )}
          </>
        ) : (
          <>
            {message}
            {traceId && (
              <span
                style={{
                  marginLeft: '8px',
                  fontSize: '0.75rem',
                  opacity: 0.8,
                }}
              >
                (ID: {traceId})
              </span>
            )}
          </>
        )}
      </Alert>
    </Snackbar>
  );
};

export default GlobalSnackbar;
