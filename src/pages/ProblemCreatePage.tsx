import { Box, Container, Stepper, Step, StepLabel, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useGenerationStore } from '@/features/generation/stores/generationStore';
import { StartPhase } from '@/components/page/ProblemCreatePage/StartPhase';
import { StructureConfirmation } from '@/components/page/ProblemCreatePage/StructureConfirmation';
import { ResultEditor } from '@/components/page/ProblemCreatePage/ResultEditor';

/**
 * 問題作成ページ
 * 3フェーズのシンプルなフロー:
 * 1. start - ファイルアップロード、生成モード選択、設定
 * 2. structure_confirmed - 構造解析結果確認
 * 3. completed - 最終結果編集
 */
export default function ProblemCreatePage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { phase, reset } = useGenerationStore();

  // 3フェーズに統合
  const displayPhase = 
    phase === 'analyzing' ? 'start' :
    phase === 'generating' ? 'structure_confirmed' :
    phase;

  const phaseOrder = ['start', 'structure_confirmed', 'completed'] as const;
  const phaseLabels = ['1. 生成開始', '2. 構造解析', '3. 生成完了'];
  const displayPhaseIndex = phaseOrder.indexOf(displayPhase as any);

  return (
    <>
      {/* 固定 Stepper（MUI Stepper） */}
      <Box sx={{ 
        position: 'sticky', 
        top: 64, // TopMenuBar の高さ
        zIndex: 99, 
        backgroundColor: 'background.paper', 
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Stepper activeStep={displayPhaseIndex} alternativeLabel sx={{ py: 2, px: { xs: 1, sm: 2 } }}>
          {phaseLabels.map((label, index) => (
            <Step key={index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Container maxWidth="md">
        <Box sx={{ py: 3 }}>
          {/* フェーズコンテンツ */}
          <Box>
            {phase === 'start' && <StartPhase />}
            {phase === 'analyzing' && <StartPhase />}
            {phase === 'structure_confirmed' && <StructureConfirmation />}
            {phase === 'generating' && <StructureConfirmation />}
            {phase === 'completed' && <ResultEditor />}
          </Box>
        </Box>
      </Container>
    </>
  );
}
