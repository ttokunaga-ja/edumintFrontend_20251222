import * as React from "react";
import TextField from '@mui/material/TextField';
import type { TextFieldProps } from '@mui/material/TextField'; // Thin wrapper around MUI TextField to preserve existing usage patterns.
function Input(props: Omit<TextFieldProps, 'variant'> & { type?: string }) { const { type, InputProps, ...rest } = props; const ariaInvalid = (rest as any)[]; const error = ariaInvalid === true || ariaInvalid === 'true' || rest['error'] === true; return ( <TextField variant="outlined" fullWidth size="small" error={!!error} inputProps={{ type }} {...rest} InputProps={{ ...InputProps }} data-slot="input" /> );
} export { Input };
