import type { FC } from 'react';
import {
  Card,
  CardContent,
  Box,
  Avatar,
  Typography,
  Stack,
  Button,
  useTheme,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

export interface User {
  id?: string;
  username: string;
  email: string;
  displayName?: string;
  role?: 'user' | 'admin';
}

export interface ProfileHeaderProps {
  user: User;
  onLogout: () => void;
  onNavigateAdmin: () => void;
  isLoggingOut?: boolean;
}

/**
 * プロフィールヘッダーコンポーネント
 * MyPage の上部に表示されるユーザープロフィール情報
 */
export const ProfileHeader: FC<ProfileHeaderProps> = ({
  user,
  onLogout,
  onNavigateAdmin,
  isLoggingOut = false,
}) => {
  const theme = useTheme();

  return (
    <Card sx={{ mb: 4, borderRadius: '16px', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: theme.palette.primary.main,
                fontSize: '2.5rem',
                fontWeight: 700,
                color: '#ffffff',
              }}
            >
              {user.displayName?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                {user.displayName || 'ユーザー'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {user.email}
              </Typography>
              {user.role === 'admin' && (
                <Typography
                  variant="caption"
                  sx={{
                    display: 'inline-block',
                    mt: 1,
                    backgroundColor: theme.palette.error.main,
                    color: '#ffffff',
                    px: 1,
                    py: 0.5,
                    borderRadius: '8px',
                    fontWeight: 600,
                  }}
                >
                  管理者
                </Typography>
              )}
            </Box>
          </Box>
          <Stack spacing={1}>
            {user.role === 'admin' && (
              <Button variant="outlined" onClick={onNavigateAdmin}>
                管理画面へ
              </Button>
            )}
            <Button
              variant="contained"
              color="error"
              endIcon={<LogoutIcon />}
              onClick={onLogout}
              disabled={isLoggingOut}
            >
              ログアウト
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
