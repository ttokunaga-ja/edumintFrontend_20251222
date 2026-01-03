import { useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { TopMenuBar } from '@/components/common/TopMenuBar';

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * AppLayout - Global responsive layout container
 * Uses Flexbox for reliable height and scroll management
 * Fully responsive - no hardcoded pixel values
 */
export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const shouldShowTopMenuBar = !['/login', '/register'].includes(location.pathname);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      {shouldShowTopMenuBar && (
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1100, // MUI AppBar のデフォルト zIndex
          }}
        >
          <TopMenuBar />
        </Box>
      )}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default AppLayout;
