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
  Divider,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useState } from 'react';
import type { FormEvent } from 'react';
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
  const [error, setError] = useState<string>('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
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
      if (!email || !password) {
        setError('メールアドレスとパスワードを入力してください');
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

      if (!termsAgreed) {
        setError('利用規約に同意してください');
        return;
      }

      const username = email.split('@')[0];
      registerMutation.mutate(
        { email, password, confirmPassword, username },
        {
          onSuccess: () => {
            addNotification('登録しました！プロフィール設定へ進みます。', 'success', 3000);
            navigate('/profile-setup');
          },
          onError: (err) => {
            if (err.response?.status === 409) {
              setError('このメールアドレスは既に使用されています');
              addNotification('メールアドレスが既に使用されています', 'error', 5000);
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
  const isAcademicEmail = email.endsWith('.ac.jp');

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 8 }}>
        <Card sx={{ p: 4 }}>
          {/* ロゴ・タイトル */}
          <Typography variant="h5" sx={{ mb: 1, textAlign: 'center', fontWeight: 600 }}>
            Eduanima
          </Typography>
          <Typography variant="body2" sx={{ mb: 4, textAlign: 'center', color: 'text.secondary' }}>
            教育支援プラットフォーム
          </Typography>

          {/* タブ */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Button
              variant={activeTab === 'login' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('login')}
              sx={{ mr: 1, minWidth: 100 }}
            >
              ログイン
            </Button>
            <Button
              variant={activeTab === 'register' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('register')}
              sx={{ minWidth: 100 }}
            >
              新規登録
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* ソーシャルログイン（常時表示、ログイン/登録共に） */}
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              disabled={isLoading}
              onClick={() => {
                addNotification('Google ログインは現在実装中です', 'info', 3000);
              }}
            >
              Google で{activeTab === 'login' ? 'ログイン' : '登録'}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              disabled={isLoading}
              onClick={() => {
                addNotification('Microsoft ログインは現在実装中です', 'info', 3000);
              }}
            >
              Microsoft で{activeTab === 'login' ? 'ログイン' : '登録'}
            </Button>

          </Stack>

          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="textSecondary">
              または
            </Typography>
          </Divider>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <Box>
                <TextField
                  id="email-input"
                  fullWidth
                  label="メールアドレス"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
                {activeTab === 'register' && email && !isAcademicEmail && (
                  <Typography variant="caption" color="info.main" sx={{ display: 'block', mt: 0.5 }}>
                    💡 学生向け: .ac.jp で終わる大学メールの使用を推奨します。
                  </Typography>
                )}
              </Box>

              <TextField
                id="password-input"
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
                  id="confirm-password-input"
                  fullWidth
                  label="パスワード（確認）"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              )}

              {/* 利用規約チェックボックス（登録時のみ） */}
              {activeTab === 'register' && (
                <Box sx={{ p: 1.5, backgroundColor: 'action.hover', borderRadius: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={termsAgreed}
                        onChange={(e) => setTermsAgreed(e.target.checked)}
                        disabled={isLoading}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        <Button
                          size="small"
                          onClick={(e) => {
                            e.preventDefault();
                            setTermsDialogOpen(true);
                          }}
                          sx={{ p: 0, textDecoration: 'underline', textTransform: 'none' }}
                        >
                          利用規約
                        </Button>
                        に同意します
                      </Typography>
                    }
                  />
                </Box>
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
        </Card>
      </Box>

      {/* 利用規約ダイアログ */}
      <Dialog open={termsDialogOpen} onClose={() => setTermsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>利用規約</DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
            {`Eduanima教育支援プラットフォーム 利用規約

【第1条 総則】
本利用規約は、Eduanima教育支援プラットフォーム（以下「本サービス」）の利用条件を定めています。ユーザーは本サービスを利用することで、本規約に同意したものと見なされます。

【第2条 ユーザー登録】
本サービスを利用するには、ユーザー登録が必要です。登録内容は正確で、虚偽のないものである必要があります。

【第3条 禁止事項】
ユーザーは以下の行為を禁止します：
- 違法または不適切なコンテンツの投稿
- 他のユーザーへの嫌がらせまたは脅迫
- 知的財産権の侵害
- サービスの不正利用

【第4条 免責事項】
本サービスの利用により生じた損害について、当社は責任を負いません。

【第5条 規約改定】
当社は、事前通知なく本規約を改定することがあります。

このサービスをご利用いただくために、以上の規約にご同意ください。`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTermsDialogOpen(false)}>閉じる</Button>
          <Button
            onClick={() => {
              setTermsAgreed(true);
              setTermsDialogOpen(false);
            }}
            variant="contained"
          >
            同意する
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default LoginRegisterPage;
