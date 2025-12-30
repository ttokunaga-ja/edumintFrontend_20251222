import { Box } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { TopMenuBar } from '@/components/common/TopMenuBar';

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * AppLayout Component
 * グローバルレイアウト
 * - TopMenuBar（ログイン/登録ページを除く）
 * - ページコンテンツ
 */
export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();

  // TopMenuBar を非表示にするパス
  const hideTopMenuBarPaths = ['/login', '/register'];
  const shouldShowTopMenuBar = !hideTopMenuBarPaths.includes(location.pathname);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      {/* TopMenuBar */}
      {shouldShowTopMenuBar && <TopMenuBar />}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          width: '100%',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default AppLayout;
