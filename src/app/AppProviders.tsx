import { PropsWithChildren, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { useMediaQuery } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { queryClient } from '../lib/query-client';
import '../lib/i18n';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { NotificationCenter } from '@/components/common/NotificationCenter';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    secondary: { main: '#f48fb1' },
  },
});

export function AppProviders({ children }: PropsWithChildren) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = useMemo(
    () => (prefersDarkMode ? darkTheme : lightTheme),
    [prefersDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <NotificationProvider>
            <NotificationCenter />
            {children}
          </NotificationProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
