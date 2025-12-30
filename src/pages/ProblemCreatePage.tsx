import { Box, Container, LinearProgress, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useGenerationStore } from '@/features/generation/stores/generationStore';
import { StartPhase } from '@/components/page/ProblemCreatePage/StartPhase';
import { AnalysisPhase } from '@/components/page/ProblemCreatePage/AnalysisPhase';
import { StructureConfirmation } from '@/components/page/ProblemCreatePage/StructureConfirmation';
import { GenerationPhase } from '@/components/page/ProblemCreatePage/GenerationPhase';
import { ResultEditor } from '@/components/page/ProblemCreatePage/ResultEditor';

/**
 * 問題作成ページ
 * 5段階のフロー:
 * 1. start - ファイルアップロード、生成モード選択、オプション設定
 * 2. analyzing - AI構造解析（ローディング）
 * 3. structure_confirmed - 解析結果確認
 * 4. generating - 問題生成（ローディング）
 * 5. completed - 結果編集・公開
 */
export default function ProblemCreatePage() {
  const navigate = useNavigate();
  const { phase, reset } = useGenerationStore();

  const phaseLabels = {
    start: '1. ファイル・テキスト入力',
    analyzing: '2. 構造解析中',
    structure_confirmed: '3. 構造確認',
    generating: '4. 問題生成中',
    completed: '5. 結果編集',
  };

  const phaseOrder = ['start', 'analyzing', 'structure_confirmed', 'generating', 'completed'] as const;
  const currentPhaseIndex = phaseOrder.indexOf(phase as any);
  const progress = ((currentPhaseIndex + 1) / phaseOrder.length) * 100;

  const handleClose = () => {
    reset();
    navigate('/');
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        {/* ヘッダー */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={handleClose} variant="text">
            戻る
          </Button>
          <Typography variant="h3">問題を生成</Typography>
        </Box>

        {/* 進捗バー */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2">{phaseLabels[phase]}</Typography>
            <Typography variant="caption" color="text.secondary">
              {currentPhaseIndex + 1} / {phaseOrder.length}
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 1 }} />
        </Box>

        {/* フェーズコンテンツ */}
        <Stack sx={{ mb: 4 }}>
          {phase === 'start' && <StartPhase />}
          {phase === 'analyzing' && <AnalysisPhase />}
          {phase === 'structure_confirmed' && <StructureConfirmation />}
          {phase === 'generating' && <GenerationPhase />}
          {phase === 'completed' && <ResultEditor />}
        </Stack>
      </Box>
    </Container>
  );
}
