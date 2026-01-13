import React, { Fragment } from 'react';
import type { FC, ReactNode, SyntheticEvent, FormEvent } from 'react';
import { Alert, Stack, Snackbar, Button, Box } from '@mui/material';
import { useServiceHealthContext } from '@/contexts/ServiceHealthContext';

// Assuming HealthStatus type is string union
type HealthStatus = 'operational' | 'degraded' | 'outage' | 'maintenance';

export const ContextHealthAlert = () => {
  const { health, refresh } = useServiceHealthContext();
  const [networkError, setNetworkError] = React.useState<boolean>(false);
  
  const services = [
    { key: 'content', label: 'コンテンツサービス' },
    { key: 'community', label: 'コミュニティ機能' },
    { key: 'notifications', label: '通知サービス' },
    { key: 'search', label: '検索機能' },
    { key: 'wallet', label: 'ウォレット機能' },
  ] as const;

  // Network error detection
  const hasNetworkError = !!health.error;
  
  React.useEffect(() => {
    setNetworkError(hasNetworkError);
  }, [hasNetworkError]);

  const alerts = services.filter(service => {
    const status = health[service.key as keyof typeof health] as HealthStatus;
    const isAlert = status && status !== 'operational';
    if (isAlert) console.log(`[HealthAlert] Service ${service.key} status: ${status}`);
    return isAlert;
  });

  return (
    <>
      {/* Service status alerts (degraded, outage, maintenance) */}
      {alerts.length > 0 && (
        <Stack spacing={1} sx={{ mb: 2 }}>
          {alerts.map(service => {
            const status = health[service.key as keyof typeof health] as HealthStatus;
            let severity: 'warning' | 'error' | 'info' = 'info';
            let message = '';

            switch (status) {
              case 'degraded':
                severity = 'warning';
                message = `${service.label}のパフォーマンスが低下しています。`;
                break;
              case 'outage':
                severity = 'error';
                message = `${service.label}が停止しています。`;
                break;
              case 'maintenance':
                severity = 'info';
                message = `${service.label}はメンテナンス中です。`;
                break;
              default:
                return null;
            }

            return (
              <Alert key={service.key} severity={severity} data-testid="health-outage-alert">
                {message}
              </Alert>
            );
          })}
        </Stack>
      )}

      {/* Network error Snackbar with retry button */}
      <Snackbar
        open={networkError}
        autoHideDuration={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setNetworkError(false)}
          severity="error"
          sx={{ width: '100%' }}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  refresh();
                  setNetworkError(false);
                }}
              >
                リトライ
              </Button>
              <Button
                color="inherit"
                size="small"
                onClick={() => setNetworkError(false)}
              >
                閉じる
              </Button>
            </Box>
          }
        >
          {health.error || 'サーバーに接続できません。インターネット接続をご確認ください。'}
        </Alert>
      </Snackbar>
    </>
  );
};
