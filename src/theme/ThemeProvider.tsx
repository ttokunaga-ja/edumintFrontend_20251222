import React from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme'; export const AppThemeProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => { return ( <MuiThemeProvider theme={theme}> <CssBaseline /> {children} </MuiThemeProvider> );
}; export default AppThemeProvider;
