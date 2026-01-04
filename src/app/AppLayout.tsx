import { useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { TopMenuBar } from '@/components/common/TopMenuBar';

interface AppLayoutProps {
  children: ReactNode;
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
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
      }}
    >
      {shouldShowTopMenuBar && (
        <Box
          component="header"
          sx={{
            flexShrink: 0,
            zIndex: 1100,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <TopMenuBar />
        </Box>
      )}
      <Box
        component="main"
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default AppLayout;
