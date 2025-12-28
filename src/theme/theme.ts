import { createTheme } from '@mui/material/styles';
import { tokens } from './tokens'; const theme = createTheme({ palette: tokens.palette as any, spacing: tokens.spacing as any, shape: tokens.shape as any, typography: tokens.typography as any
}); export default theme;
