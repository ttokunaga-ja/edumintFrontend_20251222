import { Fragment } from 'react';
import type { FC, ReactNode, SyntheticEvent, FormEvent } from 'react';
import { ToggleButton, ToggleButtonGroup, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface PreviewEditToggleProps {
  isEditMode: boolean;
  onToggle: (isEdit: boolean) => void;
}

export const PreviewEditToggle: FC<PreviewEditToggleProps> = ({
  isEditMode,
  onToggle,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const handleChange = (_: React.MouseEvent<HTMLElement>, newValue: string | null) => {
    if (newValue !== null) {
      onToggle(newValue === 'edit');
    }
  };

  return (
    <ToggleButtonGroup
      value={isEditMode ? 'edit' : 'view'}
      exclusive
      onChange={handleChange}
      aria-label="view/edit mode toggle"
      sx={{
        width: 128,
        height: 64,
        '& .MuiToggleButton-root': {
          width: '50%',
          height: '100%',
          p: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.secondary,
          '&.Mui-selected': {
            backgroundColor: theme.palette.primary.main,
            color: '#ffffff',
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          },
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        },
      }}
    >
      <ToggleButton value="view" aria-label="view mode">
        {t('common.view_mode')}
      </ToggleButton>
      <ToggleButton value="edit" aria-label="edit mode">
        {t('common.edit_mode')}
      </ToggleButton>
    </ToggleButtonGroup>
  );
};
