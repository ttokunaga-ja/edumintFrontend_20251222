import { createTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { useMemo } from 'react';

const lightPalette = {
  mode: 'light' as const,
  primary: {
    main: '#00bcd4', // Light Cyan (水色)
    light: '#4dd0e1',
    dark: '#0097a7',
  },
  secondary: {
    main: '#00acc1',
    light: '#26c6da',
    dark: '#00838f',
  },
  background: {
    default: '#ffffff',
    paper: '#ffffff',
  },
  text: {
    primary: '#1a1a1a', // 完全な黒
    secondary: 'rgba(0, 0, 0, 0.6)',
  },
  divider: '#e0e0e0',
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
    main: '#00bcd4',
  },
};

const darkPalette = {
  mode: 'dark' as const,
  primary: {
    main: '#4dd0e1', // Light Cyan light version
    light: '#80deea',
    dark: '#00bcd4',
  },
  secondary: {
    main: '#26c6da',
    light: '#80deea',
    dark: '#00acc1',
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
  },
  text: {
    primary: '#ffffff', // 白
    secondary: 'rgba(255, 255, 255, 0.6)',
  },
  divider: '#303030',
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
    main: '#4dd0e1',
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
          borderRadius: 12,
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              '@global': {
                '@keyframes slide-in': {
                  from: {
                    opacity: 0,
                    transform: 'translateX(100%)',
                  },
                  to: {
                    opacity: 1,
                    transform: 'translateX(0)',
                  },
                },
                '@keyframes slide-out': {
                  from: {
                    opacity: 1,
                    transform: 'translateX(0)',
                  },
                  to: {
                    opacity: 0,
                    transform: 'translateX(100%)',
                  },
                },
                '@keyframes scale-in': {
                  from: {
                    opacity: 0,
                    transform: 'scale(0.95)',
                  },
                  to: {
                    opacity: 1,
                    transform: 'scale(1)',
                  },
                },
                '*': {
                  margin: 0,
                  padding: 0,
                  boxSizing: 'border-box',
                },
                'html, body, #root': {
                  height: '100%',
                  fontFamily: [
                    '-apple-system',
                    'BlinkMacSystemFont',
                    '"Segoe UI"',
                    '"Roboto"',
                    '"Oxygen"',
                    '"Ubuntu"',
                    '"Cantarell"',
                    '"Fira Sans"',
                    '"Droid Sans"',
                    '"Helvetica Neue"',
                    'sans-serif',
                  ].join(','),
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                },
                code: {
                  fontFamily: 'source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace',
                },
                'img, svg, video, canvas': {
                  maxWidth: '100%',
                  height: 'auto',
                  display: 'block',
                },
                'button, input, select, textarea': {
                  font: 'inherit',
                },
                'iframe[src*="/mockServiceWorker.js"]': {
                  display: 'none !important',
                },
              },
              body: {
                backgroundColor: prefersDarkMode ? '#121212' : '#ffffff',
                color: prefersDarkMode ? '#ffffff' : '#000000',
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: prefersDarkMode ? '#1e1e1e' : '#ffffff',
                color: prefersDarkMode ? '#ffffff' : '#000000',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                borderBottom: `1px solid ${prefersDarkMode ? '#303030' : '#e0e0e0'}`,
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
                padding: '10px 20px',
                borderRadius: '12px',
                transition: 'all 0.2s ease',
              },
              contained: {
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                  transform: 'translateY(-2px)',
                },
              },
              outlined: {
                borderColor: prefersDarkMode ? '#444' : '#d0d0d0',
                '&:hover': {
                  borderColor: prefersDarkMode ? '#555' : '#b0b0b0',
                  backgroundColor: prefersDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
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
                  backgroundColor: prefersDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f8f8f8',
                  borderRadius: '10px',
                  transition: 'all 0.2s ease',
                  '& fieldset': {
                    borderColor: prefersDarkMode ? '#333' : '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: prefersDarkMode ? '#444' : '#c0c0c0',
                  },
                  '&.Mui-focused': {
                    backgroundColor: prefersDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#ffffff',
                    '& fieldset': {
                      borderColor: '#00bcd4',
                    },
                  },
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                borderRadius: '16px',
                border: 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backgroundColor: prefersDarkMode ? '#1e1e1e' : '#ffffff',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                  transform: 'translateY(-4px)',
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                backgroundColor: prefersDarkMode ? '#1e1e1e' : '#ffffff',
              },
              elevation0: {
                boxShadow: 'none',
              },
              elevation1: {
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              },
              elevation2: {
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
              },
              elevation3: {
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: '8px',
                fontWeight: 500,
              },
              filled: {
                backgroundColor: prefersDarkMode ? '#333' : '#f0f0f0',
                '&.MuiChip-colorPrimary': {
                  backgroundColor: '#00bcd4',
                  color: '#ffffff',
                },
              },
              outlined: {
                borderColor: prefersDarkMode ? '#444' : '#d0d0d0',
                '&.MuiChip-colorPrimary': {
                  borderColor: '#00bcd4',
                  color: '#00bcd4',
                },
              },
            },
          },
          MuiLinearProgress: {
            styleOverrides: {
              root: {
                height: 6,
                borderRadius: '3px',
                backgroundColor: prefersDarkMode ? '#303030' : '#e0e0e0',
              },
              bar: {
                borderRadius: '3px',
                backgroundImage: `linear-gradient(90deg, #00bcd4, #4dd0e1)`,
              },
            },
          },
          MuiTabs: {
            styleOverrides: {
              root: {
                borderBottom: `1px solid ${prefersDarkMode ? '#303030' : '#e0e0e0'}`,
              },
              indicator: {
                backgroundColor: '#00bcd4',
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
            },
          },
          MuiAvatar: {
            styleOverrides: {
              root: {
                backgroundColor: '#00bcd4',
                color: '#ffffff',
                fontWeight: 600,
              },
            },
          },
          MuiIconButton: {
            styleOverrides: {
              root: {
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: prefersDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                },
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor: prefersDarkMode ? '#1e1e1e' : '#ffffff',
                borderRight: `1px solid ${prefersDarkMode ? '#303030' : '#e0e0e0'}`,
              },
            },
          },
          MuiStepper: {
            styleOverrides: {
              root: {
                backgroundColor: prefersDarkMode ? '#1e1e1e' : '#ffffff',
                padding: '20px 16px',
                borderBottom: `1px solid ${prefersDarkMode ? '#303030' : '#e0e0e0'}`,
              },
            },
          },
          MuiStep: {
            styleOverrides: {
              root: {
                padding: 0,
              },
            },
          },
          MuiStepLabel: {
            styleOverrides: {
              root: {
                color: prefersDarkMode ? '#ffffff' : '#1a1a1a',
              },
              label: {
                fontWeight: 500,
                fontSize: '0.875rem',
                color: prefersDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(26, 26, 26, 0.7)',
                '&.Mui-active': {
                  color: prefersDarkMode ? '#ffffff' : '#1a1a1a',
                  fontWeight: 600,
                },
                '&.Mui-completed': {
                  color: prefersDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(26, 26, 26, 0.6)',
                },
              },
            },
          },
          MuiStepIcon: {
            styleOverrides: {
              root: {
                color: prefersDarkMode ? '#444' : '#d0d0d0',
                '&.Mui-active': {
                  color: '#00bcd4',
                  fontSize: '1.75rem',
                },
                '&.Mui-completed': {
                  color: '#4caf50',
                  fontSize: '1.75rem',
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
