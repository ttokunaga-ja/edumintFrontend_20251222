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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        py: { xs: 6, md: 8 },
        mb: 4,
        borderRadius: 2,
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3} alignItems="flex-start">
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            AIで演習問題を自動生成
          </Typography>

          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: '1rem', sm: '1.1rem' },
              fontWeight: 400,
              opacity: 0.95,
              maxWidth: 600,
            }}
          >
            講義資料から自動で良問を生成。タグ、難易度、形式を自由に指定して、
            あなたの学習に最適な問題セットを作成できます。
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="contained"
              color="warning"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => navigate('/problem/create')}
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
