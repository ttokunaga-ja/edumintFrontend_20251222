import { Box, CircularProgress, Stack, Typography } from '@mui/material';

export function AnalysisPhase() {
  return (
    <Stack
      spacing={3}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6">問題構造を解析中...</Typography>
      <Typography variant="body2" color="text.secondary">
        AIが提供されたファイルを分析し、構造を抽出しています。
        <br />
        この処理には数十秒かかることがあります。
      </Typography>
    </Stack>
  );
}
