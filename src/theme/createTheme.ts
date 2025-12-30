import { createTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { useMemo } from 'react';

const lightPalette = {
  mode: 'light' as const,
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
  },
  secondary: {
    main: '#dc004e',
    light: '#f05545',
    dark: '#9a0036',
  },
  background: {
    default: '#fafafa',
    paper: '#ffffff',
  },
  error: {
    main: '#d32f2f',
  },
  warning: {
    main: '#f57c00',
  },
  success: {
    main: '#388e3c',
  },
  info: {
    main: '#0288d1',
  },
};

const darkPalette = {
  mode: 'dark' as const,
  primary: {
    main: '#90caf9',
    light: '#b3e5fc',
    dark: '#42a5f5',
  },
  secondary: {
    main: '#f48fb1',
    light: '#f6a4d3',
    dark: '#e91e8c',
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
  },
  error: {
    main: '#ef5350',
  },
  warning: {
    main: '#ffb74d',
  },
  success: {
    main: '#66bb6a',
  },
  info: {
    main: '#29b6f6',
  },
};

export function useTheme() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  return useMemo(
    () =>
      createTheme({
        palette: prefersDarkMode ? darkPalette : lightPalette,
        typography: {
          fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
          ].join(','),
          h1: {
            fontSize: '2.5rem',
            fontWeight: 700,
            lineHeight: 1.2,
          },
          h2: {
            fontSize: '2rem',
            fontWeight: 700,
            lineHeight: 1.3,
          },
          h3: {
            fontSize: '1.5rem',
            fontWeight: 700,
            lineHeight: 1.4,
          },
          h4: {
            fontSize: '1.25rem',
            fontWeight: 600,
            lineHeight: 1.4,
          },
          h5: {
            fontSize: '1rem',
            fontWeight: 600,
            lineHeight: 1.5,
          },
          h6: {
            fontSize: '0.875rem',
            fontWeight: 600,
            lineHeight: 1.6,
          },
          body1: {
            fontSize: '1rem',
            lineHeight: 1.5,
          },
          body2: {
            fontSize: '0.875rem',
            lineHeight: 1.43,
          },
          button: {
            textTransform: 'none',
            fontWeight: 600,
          },
        },
        shape: {
          borderRadius: 8,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
                padding: '8px 16px',
              },
              contained: {
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                },
              },
            },
          },
          MuiTextField: {
            defaultProps: {
              variant: 'outlined',
              fullWidth: true,
            },
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  backgroundColor:
                    prefersDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  transition: 'box-shadow 0.3s ease',
                },
              },
            },
          },
        },
      }),
    [prefersDarkMode]
  );
}

export const createAppTheme = (isDark: boolean) => {
  return createTheme({
    palette: isDark ? darkPalette : lightPalette,
  });
};
