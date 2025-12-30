import { Box, Button, Card, CardContent, Stack, Typography, Chip } from '@mui/material';
import { useGenerationStore } from '@/features/generation/stores/generationStore';

export function StructureConfirmation() {
  const { setPhase, structureData, options } = useGenerationStore();

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            解析結果: 問題構造の確認
          </Typography>

          {structureData ? (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  タイトル
                </Typography>
                <Typography variant="body2">{structureData.title}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  科目
                </Typography>
                <Stack direction="row" spacing={1}>
                  {structureData.subjects?.map((subject: string) => (
                    <Chip key={subject} label={subject} size="small" />
                  ))}
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  検出された問題: {structureData.problems?.length || 0}問
                </Typography>
                <Stack spacing={1}>
                  {structureData.problems?.map((problem: any, idx: number) => (
                    <Box
                      key={problem.id}
                      sx={{
                        p: 1.5,
                        backgroundColor: 'action.hover',
                        borderRadius: 1,
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          問題 {idx + 1}
                        </Typography>
                        <Chip label={problem.type} size="small" variant="outlined" />
                        <Chip label={problem.difficulty} size="small" variant="outlined" />
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Stack>
          ) : (
            <Typography color="text.secondary">構造データが利用できません</Typography>
          )}
        </CardContent>
      </Card>

      {/* アクションボタン */}
      <Stack direction="row" spacing={2}>
        <Button
          variant="outlined"
          fullWidth
          onClick={() => setPhase('start')}
        >
          戻る
        </Button>
        <Button
          variant="contained"
          fullWidth
          onClick={() => setPhase('generating')}
        >
          生成を開始
        </Button>
      </Stack>
    </Stack>
  );
}
