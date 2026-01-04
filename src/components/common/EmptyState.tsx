import { Fragment } from 'react';
import type { FC, ReactNode, SyntheticEvent, FormEvent } from 'react';
import { Box, Typography } from '@mui/material';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
}

const EmptyState: FC<EmptyStateProps> = ({
  title = 'No data available',
  description,
  action,
  children,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        textAlign: 'center',
      }}
    >
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {description}
        </Typography>
      )}
      {children}
      {action && (
        <Box sx={{ mt: 2 }}>
          {action}
        </Box>
      )}
    </Box>
  );
};

export default EmptyState;
