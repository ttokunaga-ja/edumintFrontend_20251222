import { Box, CircularProgress, LinearProgress, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useGenerationStore } from '@/features/generation/stores/generationStore';

export function GenerationPhase() {
  const { setPhase } = useGenerationStore();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // シミュレーション: 5秒かけて進捗を進める
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 30;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => setPhase('completed'), 500);
          return 100;
        }
        return newProgress;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [setPhase]);

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
      <CircularProgress size={60} variant="determinate" value={progress} />
      <Typography variant="h6">演習問題を生成中...</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
        AIが問題文、解答、解説を生成しています。
        <br />
        進捗: {Math.round(progress)}%
      </Typography>
      <Box sx={{ width: '100%', maxWidth: 300 }}>
        <LinearProgress variant="determinate" value={progress} />
      </Box>
    </Stack>
  );
}
