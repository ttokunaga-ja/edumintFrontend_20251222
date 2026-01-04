import type { PropsWithChildren } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { queryClient } from '../lib/query-client';
import '../lib/i18n';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { AppBarActionProvider } from '@/contexts/AppBarActionContext';
import { NotificationCenter } from '@/components/common/NotificationCenter';
import { AppLayout } from './AppLayout';
import { Router } from './router';
import { ServiceHealthProvider } from '@/contexts/ServiceHealthContext';
import { useTheme } from '@/theme/createTheme';
import { ErrorBoundary, GlobalSnackbar } from '@/components/errors';

/**
 * AppProviders - Root application providers
 * Wraps the app with theme, routing, and context providers
 *
 * エラーハンドリング階層：
 * 1. ErrorBoundary - JavaScriptのレンダリングエラーをキャッチ
 * 2. GlobalSnackbar - APIエラー等のグローバル通知
 * 3. NotificationCenter - 従来の通知（success/info）
 */
export function AppProviders({ children }: PropsWithChildren) {
  const theme = useTheme();

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <NotificationProvider>
              <AppBarActionProvider>
                <ServiceHealthProvider>
                  {/* グローバルエラー通知 (APIエラー、認可エラー等) */}
                  <GlobalSnackbar />
                  
                  {/* 従来の通知 */}
                  <NotificationCenter />
                  
                  <AppLayout>
                    <Router />
                  </AppLayout>
                </ServiceHealthProvider>
              </AppBarActionProvider>
            </NotificationProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default AppProviders;
