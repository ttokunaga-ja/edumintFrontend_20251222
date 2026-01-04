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
  ToggleButton,
  ToggleButtonGroup,
  Snackbar,
  SnackbarContent,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAppBarAction } from '@/contexts/AppBarActionContext';
import SettingsSlider from './SettingsSlider';

/**
 * TopMenuBar Component
 * グローバルナビゲーション (AppBar + Toolbar)
 * - ハンバーガーメニュー（左）
 * - ロゴ（Home へリンク）
 * - 検索バー
 * - 問題作成ボタン（右から3番目）
 * - 通知アイコン
 * - ユーザーアバター（MyPage へ直接遷移）
 * 
 * ========== 編集・保存機能 ==========
 * AppBarActionContext を通じて、ページ層の編集・保存機能を制御します
 * 
 * 状態:
 *   - enableAppBarActions: 編集・保存機能の有効化
 *   - isEditMode: 編集モード（true）/ 閲覧モード（false）
 *   - hasUnsavedChanges: 未保存の変更フラグ
 *   - isSaving: 保存処理中フラグ
 * 
 * ボタン動作:
 *   [SAVE]: hasUnsavedChanges && !isSaving で有効
 *   [View/Edit]: isEditMode で切り替え
 *   ナビゲーション: hasUnsavedChanges && isEditMode でトースト警告表示
 * 
 * Phase 7: トースト警告 UI 完全実装
 *   - SAVE: 保存実行 → ナビゲーション
 *   - UNSAVE: 保存破棄 → ナビゲーション
 *   - CANCEL: ナビゲーション中止 → トースト閉じる
 * 
 * 詳細は docs/APPBAR_INTEGRATION_GUIDE.md を参照
 *
 * レスポンシブルール:
 * - 「更新閲覧編集」ボタン（編集・プレビュー切替 / 内容を更新）がない場合：640px+ で余裕あり
 * - 「更新閲覧編集」ボタンがある場合：832px+ で全表示、以下で優先度に基づき非表示
 *   優先度: [更新閲覧編集] > [＋] > [通知] > [アバター] > [ロゴ]
 */
export function TopMenuBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const {
    enableAppBarActions,
    isEditMode,
    setIsEditMode,
    hasUnsavedChanges,
    onSave,
    isSaving,
    onNavigateWithCheck,
  } = useAppBarAction();
  const { t } = useTranslation();

  // Phase 7: 未保存警告トースト UI 管理
  const [showWarningSnackbar, setShowWarningSnackbar] = useState(false);
  const [pendingNavigationPath, setPendingNavigationPath] = useState<string | null>(null);
  const [isProcessingSave, setIsProcessingSave] = useState(false);

  // SAVE ボタンが有効かどうか
  const isSaveDisabled = isSaving || !hasUnsavedChanges;

  // 編集・プレビュー切替ボタンの有無を判定
  const hasEditActions = enableAppBarActions && onSave !== null;

  const [searchQuery, setSearchQuery] = useState('');
  const [settingsSliderOpen, setSettingsSliderOpen] = useState(false);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const notificationPopoverOpen = Boolean(notificationAnchorEl);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleNavigation = (path: string) => {
    // Phase 7: 未保存変更がある場合、トースト警告を表示
    console.log('[TopMenuBar] handleNavigation:', { path, hasUnsavedChanges, isEditMode });
    if (hasUnsavedChanges && isEditMode) {
      setPendingNavigationPath(path);
      setShowWarningSnackbar(true);
      return;
    }

    if (onNavigateWithCheck) {
      onNavigateWithCheck(path);
    } else {
      navigate(path);
    }
  };

  // Phase 7: トースト警告 - 保存して移動
  const handleSaveAndNavigate = async () => {
    if (!pendingNavigationPath) return;
    console.log('[TopMenuBar] handleSaveAndNavigate:', pendingNavigationPath);
    setIsProcessingSave(true);
    try {
      if (onSave) {
        console.log('[TopMenuBar] Executing onSave...');
        await onSave();
        console.log('[TopMenuBar] onSave completed');
      }
      setShowWarningSnackbar(false);
      setPendingNavigationPath(null);
      navigate(pendingNavigationPath);
    } catch (e) {
      console.error('Save and navigate failed:', e);
      // エラーメッセージはコンポーネント側で Alert で表示
    } finally {
      setIsProcessingSave(false);
    }
  };

  // Phase 7: トースト警告 - 保存せずに移動
  const handleNavigateWithoutSave = () => {
    if (!pendingNavigationPath) return;
    console.log('[TopMenuBar] handleNavigateWithoutSave:', pendingNavigationPath);
    setShowWarningSnackbar(false);
    setPendingNavigationPath(null);
    navigate(pendingNavigationPath);
  };

  // Phase 7: トースト警告 - キャンセル
  const handleCancelNavigation = () => {
    console.log('[TopMenuBar] handleCancelNavigation');
    setShowWarningSnackbar(false);
    setPendingNavigationPath(null);
  };

  // SAVE ボタンをクリック
  const handleSaveClick = async () => {
    if (onSave) {
      try {
        await onSave();
      } catch (e) {
        console.error('Save failed:', e);
      }
    }
  };

  // ナビゲーション項目
  const navItems = [
    { label: t('common.home'), path: '/' },
    user && { label: t('search.search_problems'), path: '/create' },
    user && { label: t('common.my_page'), path: '/mypage' },
    user?.role === 'admin' && { label: t('common.admin'), path: '/admin' },
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
        position="static"
        sx={{
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: 'none',
          borderBottom: `1px solid ${theme.palette.divider}`,
          margin: 0,
          padding: 0,
          width: '100%',
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 0.5,
            margin: 0,
            padding: 0,
            width: '100%',
          }}
        >
          {/* 左グループ: ハンバーガー + ロゴ */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 }}>
            {/* ハンバーガーメニュー: 64px × 64px */}
            <Tooltip title="メニュー">
              <IconButton
                color="inherit"
                onClick={() => setSettingsSliderOpen(true)}
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
            </Tooltip>

            {/* ロゴ: 
              - 編集ボタンなし: 576px以上で表示
              - 編集ボタンあり: 448px以上で表示
            */}
            <Box
              onClick={() => handleNavigation('/')}
              sx={{
                cursor: 'pointer',
                display: 'none',
                ...(hasEditActions
                  ? { '@media (min-width: 448px)': { display: 'flex' } }
                  : { '@media (min-width: 576px)': { display: 'flex' } }),
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
                Edumint
              </Typography>
            </Box>
          </Box>

          {/* 中央: 検索バー（最小幅 196px を常に確保） */}
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              flex: 1,
              minWidth: 196,  // 常に 196px 以上の幅を確保
              maxWidth: 500,
              display: 'flex',
              justifyContent: 'center',
              mx: 0.5,
            }}
          >
            <TextField
              id="search-input"
              fullWidth
              size="small"
              placeholder={t('search.search_placeholder')}
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
          <Stack direction="row" spacing={0} sx={{ alignItems: 'center', flexShrink: 0 }}>
            {/* 優先度1: 保存・編集・閲覧ボタングループ - 常に表示 */}
            {user && hasEditActions && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: 0 }}>
                {/* SAVE ボタン */}
                <Button
                  variant="contained"
                  onClick={handleSaveClick}
                  disabled={isSaveDisabled}
                  size="small"
                  sx={{
                    backgroundColor: !isSaveDisabled ? 'primary.main' : 'action.disabledBackground',
                    color: !isSaveDisabled ? '#ffffff' : 'action.disabled',
                    '&:hover': {
                      backgroundColor: !isSaveDisabled ? 'primary.dark' : 'action.disabledBackground',
                    },
                    '&:disabled': {
                      backgroundColor: 'action.disabledBackground',
                      color: 'action.disabled',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isSaving ? t('common.saving') : t('common.save')}
                </Button>

                {/* Preview/Edit 切り替え */}
                <ToggleButtonGroup
                  value={isEditMode ? 'edit' : 'view'}
                  exclusive
                  onChange={(_, newValue) => {
                    if (newValue !== null) {
                      setIsEditMode(newValue === 'edit');
                    }
                  }}
                  aria-label="view/edit mode toggle"
                  sx={{
                    width: 128,
                    height: 40,
                    '& .MuiToggleButton-root': {
                      width: '50%',
                      height: '100%',
                      p: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${theme.palette.divider}`,
                      color: theme.palette.text.secondary,
                      fontSize: theme.typography.body2.fontSize,
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
              </Box>
            )}

            {/* 優先度2: 問題作成ボタン（＋）
              - 編集ボタンなし: 640px以上で表示
              - 編集ボタンあり: 768px以上で表示
            */}
            {user && (
              <Tooltip title="問題を作成">
                <IconButton
                  onClick={() => handleNavigation('/create')}
                  sx={{
                    display: 'none',
                    ...(hasEditActions
                      ? { '@media (min-width: 768px)': { display: 'flex' } }
                      : { '@media (min-width: 640px)': { display: 'flex' } }),
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

            {/* 優先度3: 通知アイコン
              - 編集ボタンなし: 576px以上で表示
              - 編集ボタンあり: 704px以上で表示
            */}
            {user && (
              <>
                <Tooltip title="通知">
                  <IconButton
                    color="inherit"
                    aria-label="notifications"
                    onClick={(e) => setNotificationAnchorEl(e.currentTarget)}
                    sx={{
                      display: 'none',
                      ...(hasEditActions
                        ? { '@media (min-width: 704px)': { display: 'flex' } }
                        : { '@media (min-width: 576px)': { display: 'flex' } }),
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

            {/* 優先度4: ユーザーアバター
              - 編集ボタンなし: 512px以上で表示
              - 編集ボタンあり: 640px以上で表示
            */}
            {user ? (
              <Tooltip title="マイページ">
                <IconButton
                  onClick={() => handleNavigation('/mypage')}
                  sx={{
                    display: 'none',
                    ...(hasEditActions
                      ? { '@media (min-width: 640px)': { display: 'flex' } }
                      : { '@media (min-width: 512px)': { display: 'flex' } }),
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
                    <PersonIcon sx={{ fontSize: 24 }} />
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
                    {t('common.login')}
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
                    {t('common.register')}
                  </Typography>
                </IconButton>
              </Stack>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      {/* SettingsSliderコンポーネント */}
      <SettingsSlider
        isOpen={settingsSliderOpen}
        onClose={() => setSettingsSliderOpen(false)}
      />

      {/* Phase 7: 未保存警告トースト UI - SAVE / UNSAVE / CANCEL ボタン付き */}
      <Snackbar
        open={showWarningSnackbar}
        autoHideDuration={null}
        onClose={handleCancelNavigation}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbar-root': {
            maxWidth: '600px',
            mt: 2,
          },
        }}
      >
        <SnackbarContent
          message="未保存の変更があります。保存して移動しますか？"
          action={
            <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
              {/* SAVE ボタン - 保存して移動 */}
              <Button
                size="small"
                variant="contained"
                color="primary"
                sx={{
                  fontWeight: 600,
                  '&:disabled': {
                    opacity: 0.6,
                  },
                }}
                onClick={handleSaveAndNavigate}
                disabled={isProcessingSave}
              >
                {isProcessingSave ? '保存中...' : 'SAVE'}
              </Button>

              {/* UNSAVE ボタン - 保存せずに移動 */}
              <Button
                size="small"
                variant="contained"
                color="error"
                sx={{
                  fontWeight: 600,
                  '&:disabled': {
                    opacity: 0.6,
                  },
                }}
                onClick={handleNavigateWithoutSave}
                disabled={isProcessingSave}
              >
                UNSAVE
              </Button>

              {/* CANCEL ボタン - キャンセル */}
              <Button
                size="small"
                variant="outlined"
                sx={{
                  fontWeight: 600,
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                    borderColor: theme.palette.divider,
                  },
                  '&:disabled': {
                    opacity: 0.6,
                  },
                }}
                onClick={handleCancelNavigation}
                disabled={isProcessingSave}
              >
                CANCEL
              </Button>
            </Stack>
          }
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderTop: `3px solid ${theme.palette.primary.main}`,
            boxShadow: theme.shadows[8],
            width: '100%',
            '& .MuiSnackbarContent-message': {
              fontSize: '0.95rem',
              fontWeight: 500,
              color: theme.palette.text.primary,
            },
          }}
        />
      </Snackbar>
    </>
  );
}

export default TopMenuBar;
