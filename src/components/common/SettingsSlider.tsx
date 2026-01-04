import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon,
  Home as HomeIcon,
} from '@mui/icons-material';

interface SettingsSliderProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsSlider({
  isOpen,
  onClose,
}: SettingsSliderProps) {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <Drawer
      anchor="left"
      open={isOpen}
      onClose={onClose}
      sx={{
        zIndex: 900,
        '& .MuiDrawer-paper': {
          width: 280,
          marginTop: '64px',
          height: 'calc(100vh - 64px)',
          zIndex: 900,
        },
      }}
    >
      <Box
        role="presentation"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* メニューリスト */}
        <List sx={{ flex: 1, pt: 0 }}>
          {/* HOME */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleNavigate('/')}
              sx={{
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <HomeIcon sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText
                primary="HOME"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItemButton>
          </ListItem>

          {/* CREATE */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleNavigate('/create')}
              sx={{
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <AddIcon sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText
                primary="CREATE"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItemButton>
          </ListItem>

          {/* MYPAGE */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleNavigate('/mypage')}
              sx={{
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <PersonIcon sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText
                primary="MYPAGE"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}
