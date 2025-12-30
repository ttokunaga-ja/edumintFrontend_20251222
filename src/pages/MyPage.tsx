import {
  Container,
  Box,
  Avatar,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Stack,
  CircularProgress,
  Alert,
  TextField,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth, useLogout } from '@/features/auth/hooks/useAuth';
import { useUserProfile } from '@/features/user/hooks/useUser';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function MyPage() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { data: profile } = useUserProfile(user?.id || '');
  const logoutMutation = useLogout();
  const [editMode, setEditMode] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.displayName || '');

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/login');
      },
    });
  };

  if (isLoading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container>
        <Alert severity="warning" sx={{ mt: 4 }}>
          ログインしてください
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        {/* Profile Header */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.main',
                    fontSize: '2rem',
                  }}
                >
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="h5">{user.displayName || user.username}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    @{user.username}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {user.email}
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                color="error"
                endIcon={<LogoutIcon />}
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                ログアウト
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Settings Sections */}
        <Box sx={{ mt: 4 }}>
          {/* アカウント設定 */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">アカウント設定</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ width: '100%' }}>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="メールアドレス"
                    value={user.email}
                    disabled
                    helperText="メールアドレスは変更できません"
                  />
                  <TextField
                    fullWidth
                    label="ユーザー名"
                    value={user.username}
                    disabled
                    helperText="ユーザー名は変更できません"
                  />
                  <TextField
                    fullWidth
                    label="表示名"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={!editMode}
                  />
                  {editMode && (
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                      <Button onClick={() => setEditMode(false)}>キャンセル</Button>
                      <Button variant="contained" onClick={() => setEditMode(false)}>
                        保存
                      </Button>
                    </Stack>
                  )}
                  {!editMode && (
                    <Button variant="outlined" onClick={() => setEditMode(true)}>
                      編集
                    </Button>
                  )}
                </Stack>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* プリファレンス */}
          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">プリファレンス</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <Typography>学習言語やテーマ選択などの設定（近日対応）</Typography>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* プライバシー */}
          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">プライバシー</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <Typography>プライバシー設定とデータ管理（近日対応）</Typography>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    </Container>
  );
}

export default MyPage;
