import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

/**
 * ホームページのヒーロー/検索セクション
 * ページタイトル、説明、問題作成ボタンを表示
 */
export function SearchSection() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #00bcd4 0%, #4dd0e1 100%)',
        color: 'white',
        py: { xs: 6, md: 8 },
        mb: 4,
        borderRadius: 0,
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3} alignItems="flex-start">
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="contained"
              color="warning"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => navigate('/create')}
              sx={{
                fontWeight: 600,
                fontSize: '1rem',
                px: 3,
                py: 1.5,
              }}
            >
              問題を作成する
            </Button>

            <Button
              variant="outlined"
              size="large"
              sx={{
                fontWeight: 600,
                fontSize: '1rem',
                px: 3,
                py: 1.5,
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'white',
                },
              }}
            >
              詳しく知る
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
