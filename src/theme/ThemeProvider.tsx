import React from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { useTheme } from './createTheme';

export const AppThemeProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const theme = useTheme();
    return (
        <MuiThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </MuiThemeProvider>
    );
};

export default AppThemeProvider;
