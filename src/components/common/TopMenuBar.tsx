import {
  AppBar,
  Toolbar,
  Typography,
  TextField,
  IconButton,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  Avatar,
  Stack,
  InputAdornment,
  Tooltip,
  Popover,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAppBarAction } from '@/contexts/AppBarActionContext';

/**
 * TopMenuBar Component
 * グローバルナビゲーション (AppBar + Toolbar)
 * - ハンバーガーメニュー（左）
 * - ロゴ（Home へリンク）
 * - 検索バー
 * - 問題作成ボタン（右から3番目）
 * - 通知アイコン
 * - ユーザーアバター（MyPage へ直接遷移）
 */
export function TopMenuBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const { actions } = useAppBarAction();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const notificationPopoverOpen = Boolean(notificationAnchorEl);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  // ナビゲーション項目
  const navItems = [
    { label: 'ホーム', path: '/' },
    user && { label: '問題作成', path: '/problem/create' },
    user && { label: 'マイページ', path: '/mypage' },
    user?.role === 'admin' && { label: '管理画面', path: '/admin' },
  ].filter(Boolean);

  // TopMenuBar を非表示にするパス
  const hideTopMenuBarPaths = ['/login', '/register'];
  const shouldHideTopMenuBar = hideTopMenuBarPaths.includes(location.pathname);

  if (shouldHideTopMenuBar) {
    return null;
  }

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#ffffff',
          color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 0.5,
            py: 0,
            px: { xs: 0.5, sm: 1 },
            width: '100%',
            minHeight: 64,
            height: 64,
          }}
        >
          {/* 左グループ: ハンバーガー + ロゴ */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
            {/* ハンバーガーメニュー: 64px × 64px */}
            <IconButton
              color="inherit"
              onClick={() => setMobileMenuOpen(true)}
              sx={{
                color: theme.palette.text.primary,
                flexShrink: 0,
                width: 64,
                height: 64,
                p: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MenuIcon sx={{ fontSize: 28 }} />
            </IconButton>

            {/* ロゴ: 576px以上で表示 */}
            <Box
              onClick={() => handleNavigation('/')}
              sx={{
                cursor: 'pointer',
                display: { xs: 'none', sm: 'none', md: 'none', lg: 'flex' },
                '@media (min-width: 576px)': {
                  display: 'flex',
                },
                alignItems: 'center',
                gap: 0.5,
                minWidth: 'fit-content',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  fontSize: '1.25rem',
                  whiteSpace: 'nowrap',
                }}
              >
                EduMint
              </Typography>
            </Box>
          </Box>

          {/* 中央: 検索バー（段階的に幅を縮小） */}
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              flex: 1,
              minWidth: {
                xs: 100,      // 256px未満：100px
                sm: 120,      // 256px～512px：120px
              },
              '@media (min-width: 448px)': {
                minWidth: '140px',  // 448px～512px：140px
              },
              '@media (min-width: 512px)': {
                minWidth: '160px',  // 512px～576px：160px
              },
              '@media (min-width: 576px)': {
                minWidth: '200px',  // 576px～640px：200px
              },
              '@media (min-width: 640px)': {
                minWidth: '280px',  // 640px以上：280px
              },
              maxWidth: 500,
              display: 'flex',
              justifyContent: 'center',
              mx: 0.5,
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="キーワード、大学、教科を検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="submit"
                      size="small"
                      edge="end"
                      aria-label="search"
                    >
                      <SearchIcon sx={{ fontSize: '1.2rem' }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5',
                  borderRadius: '8px',
                  '& fieldset': {
                    borderColor: 'transparent',
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.divider,
                  },
                },
              }}
            />
          </Box>

          {/* 右側: メニュー（幅に応じて段階的に非表示） */}
          <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center', flexShrink: 0 }}>
            {/* Context Actions (Page specific) */}
            {actions && (
              <Box sx={{ mr: 1 }}>
                {actions}
              </Box>
            )}

            {/* 優先度1: 投稿ボタン（640px以上で表示） */}
            {user && (
              <Tooltip title="問題を作成">
                <IconButton
                  onClick={() => handleNavigation('/problem/create')}
                  sx={{
                    display: 'none',
                    '@media (min-width: 640px)': {
                      display: 'flex',
                    },
                    color: theme.palette.primary.main,
                    width: 64,
                    height: 64,
                    p: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(77, 208, 225, 0.1)'
                        : 'rgba(0, 188, 212, 0.1)',
                    },
                  }}
                >
                  <AddIcon sx={{ fontSize: 28 }} />
                </IconButton>
              </Tooltip>
            )}

            {/* 優先度2: 通知アイコン（576px以上で表示） */}
            {user && (
              <>
                <Tooltip title="通知">
                  <IconButton
                    color="inherit"
                    aria-label="notifications"
                    onClick={(e) => setNotificationAnchorEl(e.currentTarget)}
                    sx={{
                      display: 'none',
                      '@media (min-width: 576px)': {
                        display: 'flex',
                      },
                      color: theme.palette.text.secondary,
                      width: 64,
                      height: 64,
                      p: 0,
                      alignItems: 'center',
                      justifyContent: 'center',
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <NotificationsIcon sx={{ fontSize: 28 }} />
                  </IconButton>
                </Tooltip>

                {/* 通知ポップオーバー */}
                <Popover
                  open={notificationPopoverOpen}
                  anchorEl={notificationAnchorEl}
                  onClose={() => setNotificationAnchorEl(null)}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <Box sx={{ p: 2, minWidth: 300, maxWidth: 400 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      通知
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 150,
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="body2" color="textSecondary">
                        Coming Soon...
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                        通知機能は開発中です
                      </Typography>
                    </Box>
                  </Box>
                </Popover>
              </>
            )}

            {/* 優先度3: ユーザーアバター */}
            {user ? (
              <Tooltip title="マイページ">
                <IconButton
                  onClick={() => handleNavigation('/mypage')}
                  sx={{
                    display: {
                      xs: 'none',
                      sm: 'none',
                    },
                    '@media (min-width: 448px)': {
                      display: 'none',
                    },
                    '@media (min-width: 512px)': {
                      display: 'flex',
                    },
                    width: 64,
                    height: 64,
                    p: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 64,
                    minHeight: 64,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                      borderRadius: '50%',
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      backgroundColor: theme.palette.primary.main,
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      color: '#ffffff',
                    }}
                  >
                    {user.username?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
            ) : (
              <Stack direction="row" spacing={0} sx={{ display: { xs: 'none', md: 'flex' } }}>
                <IconButton
                  color="inherit"
                  onClick={() => handleNavigation('/login')}
                  sx={{
                    color: theme.palette.primary.main,
                    width: 64,
                    height: 64,
                    p: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    ログイン
                  </Typography>
                </IconButton>
                <IconButton
                  onClick={() => handleNavigation('/register')}
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: '#ffffff',
                    width: 64,
                    height: 64,
                    p: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                      boxShadow: '0 4px 12px rgba(0, 188, 212, 0.3)',
                    },
                  }}
                >
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    新規登録
                  </Typography>
                </IconButton>
              </Stack>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      {/* モバイルメニュー Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box
          sx={{
            width: 280,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              メニュー
            </Typography>
            <IconButton onClick={() => setMobileMenuOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />

          <List sx={{ flex: 1 }}>
            {navItems.map((item: any) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider />

          {!user && (
            <Box sx={{ p: 2, display: 'flex', gap: 1, flexDirection: 'column' }}>
              <Button
                fullWidth
                onClick={() => handleNavigation('/login')}
                sx={{
                  color: theme.palette.primary.main,
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                ログイン
              </Button>
              <Button
                fullWidth
                onClick={() => handleNavigation('/register')}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
              >
                新規登録
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>
    </>
  );
}

export default TopMenuBar;
