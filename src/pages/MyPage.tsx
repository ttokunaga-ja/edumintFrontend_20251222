import {
  Container,
  Box,
  Avatar,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  CircularProgress,
  Alert,
  useTheme,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Chip,
  CardActions,
  IconButton,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useAuth, useLogout } from '@/features/auth/hooks/useAuth';
import { useUserProfile } from '@/features/user/hooks/useUser';
import { useSearch } from '@/features/content/hooks/useContent';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';


export function MyPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, isLoading } = useAuth();
  const { data: profile } = useUserProfile(user?.id || '');
  const logoutMutation = useLogout();
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // アコーディオン展開状態
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false);

  // ユーザーの投稿問題を取得（フィルター付き）
  const { data: postedData, isLoading: isPostedLoading } = useSearch({
    keyword: '',
    page: 1,
    sortBy: 'newest',
    limit: 4,
  });

  // プロフィール編集フォーム状態
  const [editForm, setEditForm] = useState({
    displayName: user?.displayName || '',
    university: profile?.university || '',
    faculty: profile?.faculty || '',
    field: profile?.field || 'science',
    language: profile?.language || 'ja',
  });

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/login');
      },
    });
  };

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  const handleSaveProfile = () => {
    console.log('Saving profile:', editForm);
    setIsEditingProfile(false);
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
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* プロフィールヘッダー */}
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
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {user.displayName || user.username}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                    @{user.username}
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
                  <Button variant="outlined" onClick={() => navigate('/admin')}>
                    管理画面へ
                  </Button>
                )}
                <Button
                  variant="contained"
                  color="error"
                  endIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  ログアウト
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* YouTube風の横スクロール: 学習済 (Coming Soon) */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              学習済
            </Typography>
            <Typography variant="caption" sx={{ color: 'primary.main', cursor: 'pointer' }}>
              すべて表示
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              overflowY: 'hidden',
              pb: 1,
              '&::-webkit-scrollbar': {
                height: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#ccc',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#999',
              },
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <Card
                key={i}
                sx={{
                  minWidth: '240px',
                  flexShrink: 0,
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
                    Coming Soon...
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                    学習済み機能は開発中です
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* YouTube風の横スクロール: 高評価 (Coming Soon) */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              高評価
            </Typography>
            <Typography variant="caption" sx={{ color: 'primary.main', cursor: 'pointer' }}>
              すべて表示
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              overflowY: 'hidden',
              pb: 1,
              '&::-webkit-scrollbar': {
                height: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#ccc',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#999',
              },
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <Card
                key={i}
                sx={{
                  minWidth: '240px',
                  flexShrink: 0,
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
                    Coming Soon...
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                    高評価機能は開発中です
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* YouTube風の横スクロール: コメント (Coming Soon) */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              コメント
            </Typography>
            <Typography variant="caption" sx={{ color: 'primary.main', cursor: 'pointer' }}>
              すべて表示
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              overflowY: 'hidden',
              pb: 1,
              '&::-webkit-scrollbar': {
                height: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#ccc',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#999',
              },
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <Card
                key={i}
                sx={{
                  minWidth: '240px',
                  flexShrink: 0,
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
                    Coming Soon...
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                    コメント機能は開発中です
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* 投稿セクション */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              投稿
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ color: 'primary.main', cursor: 'pointer' }}
              onClick={() => navigate('/home')}
            >
              すべて表示
            </Typography>
          </Box>

          {isPostedLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : postedData && postedData.data.length > 0 ? (
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                overflowX: 'auto',
                overflowY: 'hidden',
                pb: 1,
                '&::-webkit-scrollbar': {
                  height: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#ccc',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#999',
                },
              }}
            >
              {postedData.data.map((problem) => (
                <Card
                  key={problem.id}
                  sx={{
                    minWidth: '280px',
                    flexShrink: 0,
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    {/* 著者情報 */}
                    <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {problem.authorName?.charAt(0) || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
                          {problem.authorName || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {problem.university || 'University'}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* タイトル */}
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, minHeight: '48px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {problem.title}
                    </Typography>

                    {/* 試験情報 */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {problem.examName && `試験: ${problem.examName}`}
                    </Typography>

                    {/* メタデータチップ */}
                    <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                      {problem.subjectName && (
                        <Chip label={problem.subjectName} size="small" variant="outlined" />
                      )}
                      {problem.difficulty && (
                        <Chip
                          label={problem.difficulty}
                          size="small"
                          color={
                            problem.difficulty === 'advanced'
                              ? 'error'
                              : problem.difficulty === 'standard'
                                ? 'warning'
                                : 'default'
                          }
                          variant="outlined"
                        />
                      )}
                    </Stack>

                    {/* 問題プレビュー */}
                    <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {problem.content?.substring(0, 80)}...
                    </Typography>
                  </CardContent>

                  {/* 統計情報 */}
                  <CardActions disableSpacing>
                    <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <VisibilityIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {problem.views || 0}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <FavoriteBorderIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {problem.likes || 0}
                        </Typography>
                      </Stack>
                    </Stack>
                    <IconButton size="small">
                      <FavoriteBorderIcon fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              ))}
            </Box>
          ) : (
            <Card sx={{ py: 10 }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
                  投稿がまだありません
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  問題を投稿して、コミュニティに貢献しましょう
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* アコーディオン形式の設定パネル */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Edumintアカウント設定
          </Typography>

          {/* ステータスアコーディオン */}
          <Accordion expanded={expandedAccordion === 'status'} onChange={handleAccordionChange('status')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 500 }}>ステータス</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
                <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
                  Coming Soon...
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  ステータス機能は開発中です
                </Typography>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* ウォレットアコーディオン */}
          <Accordion expanded={expandedAccordion === 'wallet'} onChange={handleAccordionChange('wallet')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 500 }}>ウォレット</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
                <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
                  Coming Soon...
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  ウォレット機能は開発中です
                </Typography>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* プロフィール編集アコーディオン */}
          <Accordion expanded={expandedAccordion === 'profile'} onChange={handleAccordionChange('profile')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 500 }}>プロフィール編集</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ width: '100%' }}>
                {isEditingProfile ? (
                  <Stack spacing={2}>
                    <TextField
                      label="表示名"
                      value={editForm.displayName}
                      onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                    <TextField
                      label="大学名"
                      value={editForm.university}
                      onChange={(e) => setEditForm({ ...editForm, university: e.target.value })}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                    <TextField
                      label="学部"
                      value={editForm.faculty}
                      onChange={(e) => setEditForm({ ...editForm, faculty: e.target.value })}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                    <FormControl fullWidth size="small">
                      <InputLabel>分野</InputLabel>
                      <Select
                        label="分野"
                        value={editForm.field}
                        onChange={(e) => setEditForm({ ...editForm, field: e.target.value })}
                      >
                        <MenuItem value="science">理系</MenuItem>
                        <MenuItem value="humanities">文系</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                      <InputLabel>言語</InputLabel>
                      <Select
                        label="言語"
                        value={editForm.language}
                        onChange={(e) => setEditForm({ ...editForm, language: e.target.value })}
                      >
                        <MenuItem value="ja">日本語</MenuItem>
                        <MenuItem value="en">English</MenuItem>
                      </Select>
                    </FormControl>
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Button variant="contained" onClick={handleSaveProfile} fullWidth>
                        保存
                      </Button>
                      <Button variant="outlined" onClick={() => setIsEditingProfile(false)} fullWidth>
                        キャンセル
                      </Button>
                    </Stack>
                  </Stack>
                ) : (
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                        プロフィール編集
                      </Typography>
                      <Typography variant="body2">{user.displayName || '未設定'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                        ユーザー名
                      </Typography>
                      <Typography variant="body2">{user.username}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                        メールアドレス
                      </Typography>
                      <Typography variant="body2">{user.email}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                        大学名
                      </Typography>
                      <Typography variant="body2">{profile?.university || '未設定'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                        学部
                      </Typography>
                      <Typography variant="body2">{profile?.faculty || '未設定'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                        分野
                      </Typography>
                      <Typography variant="body2">
                        {profile?.field === 'science' ? '理系' : profile?.field === 'humanities' ? '文系' : '未設定'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                        言語
                      </Typography>
                      <Typography variant="body2">
                        {profile?.language === 'ja' ? '日本語' : profile?.language === 'en' ? 'English' : '未設定'}
                      </Typography>
                    </Box>
                    <Button variant="contained" onClick={() => setIsEditingProfile(true)} fullWidth sx={{ mt: 2 }}>
                      編集する
                    </Button>
                  </Stack>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    </Container>
  );
}

export default MyPage;
