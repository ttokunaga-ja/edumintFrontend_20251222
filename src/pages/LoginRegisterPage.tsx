import {
  Container,
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin, useRegister } from '@/features/auth/hooks/useAuth';
import { useNotification } from '@/contexts/NotificationContext';

export interface LoginRegisterPageProps {
  mode?: 'login' | 'register';
}

export function LoginRegisterPage({ mode = 'login' }: LoginRegisterPageProps) {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(mode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (activeTab === 'login') {
      // ログイン処理
      if (!email || !password) {
        setError('メールアドレスとパスワードを入力してください');
        return;
      }

      loginMutation.mutate(
        { email, password },
        {
          onSuccess: () => {
            addNotification('ログインしました', 'success', 3000);
            navigate('/');
          },
          onError: (err) => {
            setError('ログインに失敗しました。メールアドレスとパスワードを確認してください。');
            addNotification('ログインに失敗しました', 'error', 5000);
            console.error('Login error:', err);
          },
        }
      );
    } else {
      // 新規登録処理
      // バリデーション
      if (!email || !password || !username) {
        setError('すべてのフィールドを入力してください');
        return;
      }

      if (password.length < 8) {
        setError('パスワードは8文字以上である必要があります');
        return;
      }

      if (password !== confirmPassword) {
        setError('パスワードが一致しません');
        return;
      }

      registerMutation.mutate(
        { email, username, password, confirmPassword },
        {
          onSuccess: () => {
            addNotification('登録しました！', 'success', 3000);
            navigate('/');
          },
          onError: (err) => {
            if (err.response?.status === 409) {
              setError('このメールアドレスまたはユーザー名は既に使用されています');
              addNotification('ユーザー名またはメールアドレスが既に使用されています', 'error', 5000);
            } else {
              setError('登録に失敗しました。もう一度お試しください。');
              addNotification('登録に失敗しました', 'error', 5000);
            }
            console.error('Register error:', err);
          },
        }
      );
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 8 }}>
        <Card sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ mb: 2, textAlign: 'center' }}>
            {activeTab === 'login' ? 'ログイン' : 'ユーザー登録'}
          </Typography>

          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            sx={{ mb: 3 }}
          >
            <Tab label="ログイン" value="login" />
            <Tab label="登録" value="register" />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="メールアドレス"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />

              {activeTab === 'register' && (
                <TextField
                  fullWidth
                  label="ユーザー名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  required
                  helperText="英数字とアンダースコアのみ使用可能です"
                />
              )}

              <TextField
                fullWidth
                label="パスワード"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                helperText={
                  activeTab === 'register'
                    ? '8文字以上の英数字とスペシャル文字を含めてください'
                    : undefined
                }
              />

              {activeTab === 'register' && (
                <TextField
                  fullWidth
                  label="パスワード（確認）"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              )}

              <Button
                fullWidth
                variant="contained"
                type="submit"
                sx={{ mt: 2 }}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
              >
                {isLoading
                  ? '処理中...'
                  : activeTab === 'login'
                    ? 'ログイン'
                    : '登録'}
              </Button>
            </Stack>
          </Box>

          {activeTab === 'register' && (
            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                既にアカウントをお持ちですか？{' '}
                <Button
                  size="small"
                  onClick={() => setActiveTab('login')}
                  sx={{ textTransform: 'none' }}
                >
                  ログインはこちら
                </Button>
              </Typography>
            </Alert>
          )}
        </Card>
      </Box>
    </Container>
  );
}

export default LoginRegisterPage;
