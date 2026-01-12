import { Box, Container, useTheme, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useGenerationStore } from '@/features/generation/stores/generationStore';
import { zIndex } from '@/theme/zIndex';
import { StartPhase } from '@/components/page/ProblemCreatePage/StartPhase';
import { StructureConfirmation } from '@/components/page/ProblemCreatePage/StructureConfirmation';
import { useEffect } from 'react';
import { useJobStatusQuery } from '@/features/generation/hooks/useGeneration';

// Phase to progress mapping (0-100 over the whole flow)
const getProgress = (phase: number): number => {
  // Step 1 -> 2 (0% -> 50%)
  if (phase === 0) return 0;   // Start
  if (phase === 1) return 10;  // Uploading
  if (phase === 2) return 30;  // Analysing
  if (phase === 3) return 50;  // Structure Confirmed (Step 2 reached)

  // Step 2 -> 3 (50% -> 100%)
  if (phase === 4) return 55;
  if (phase === 8 || phase === 9) return 25; // Error/Retry
  if (phase === 10) return 60; // Preparing
  if (phase === 11) return 70; // Queued
  if (phase === 12) return 85; // Creating
  if (phase === 13) return 95; // Confirmed
  if (phase === 14) return 100; // Completed
  if (phase >= 20) return 100;

  return 0;
};

const SmoothStepper = ({ phase }: { phase: number }) => {
  const theme = useTheme();
  const progress = getProgress(phase);
  const steps = ['1. 生成開始', '2. 構造解析', '3. 生成完了'];

  return (
    <Box sx={{ width: '100%', position: 'relative', py: 2, px: { xs: 1, sm: 2 } }}>
      {/* Reliable Layout: Flex container for steps, Absolute container for Bars */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        position: 'relative',
        zIndex: 1
      }}>
        {/* The Progress Bar Container - positioned strictly behind the centers of the dots */}
        <Box sx={{
          position: 'absolute',
          top: 12, // Half of 24px icon
          left: '40px', // Center of first icon (Width 80px / 2)
          right: '40px', // Center of last icon (Width 80px / 2)
          height: 3,
          bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
          zIndex: -1
        }}>
          {/* The Active Bar */}
          <Box sx={{
            height: '100%',
            width: `${progress}%`,
            bgcolor: '#1976d2',
            transition: 'width 0.5s ease-in-out',
          }} />
        </Box>

        {steps.map((label, index) => {
          const isCompleted = (index === 0 && progress >= 0) || (index === 1 && progress >= 50) || (index === 2 && progress >= 100);
          const isActive = (index === 0 && progress < 50) || (index === 1 && progress >= 50 && progress < 100) || (index === 2 && progress >= 100);

          return (
            <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px' }}>
              {/* Circle Icon */}
              <Box sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                bgcolor: isCompleted || isActive ? '#1976d2' : (theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc'),
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                zIndex: 2,
                mb: 1,
                border: isActive ? '2px solid #fff' : 'none',
                boxShadow: isActive ? '0 0 0 2px #1976d2' : 'none' // Ring effect for active
              }}>
                {index + 1}
              </Box>
              <Typography variant="caption" sx={{ color: isCompleted || isActive ? 'text.primary' : 'text.disabled', textAlign: 'center' }}>
                {label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default function CreatePage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { phase, setPhase, jobId, setStructureData, setGeneratedProblems, setExamId } = useGenerationStore();

  // Polling logic using TanStack Query
  // Stop polling if waiting for user or completed
  const isPolling = !!jobId && !(phase === 3 || phase === 13 || phase === 21);
  const { data: statusData } = useJobStatusQuery(jobId, isPolling);

  useEffect(() => {
    if (statusData) {
      const { phase: newPhase, data } = statusData;

      // Check for completion/redirect
      if (data && data.contentsId) {
        console.log('Valid exam ID found, redirecting:', data.contentsId);
        setExamId(data.contentsId);
        navigate(`/exam/${data.contentsId}`);
        return;
      }

      if (newPhase !== phase) {
        setPhase(newPhase as any); // Cast to match store type
        if (data) {
          // Update data based on phase
          if (newPhase === 3) setStructureData(data);
          if (newPhase === 13) setGeneratedProblems(data.generatedContent ? [data.generatedContent] : []);
        }
      }
    }
  }, [statusData, phase, setPhase, setStructureData, setGeneratedProblems, setExamId, navigate]);

  // Map numeric phase to display step index
  // 0-2: Start (0)
  // 3-12: Structure Confirmed / Generating (1)
  // 13+: Completed (2) - but we redirect before this ideally
  const displayPhaseIndex = phase < 3 ? 0 : phase < 13 ? 1 : 2;

  const phaseLabels = ['1. 生成開始', '2. 構造解析', '3. 生成完了'];

  return (
    <>
      {/* 固定 Stepper（Custom Smooth Stepper） */}
      <Box sx={{
        position: 'sticky',
        top: 0, // TopMenuBar の直下に配置（.app-mainがすでにオフセットを持っているため0でOK）
        zIndex: zIndex.appBar,
        backgroundColor: 'background.paper',
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Box sx={{ maxWidth: '600px', margin: '0 auto' }}>
          <SmoothStepper phase={phase} />
        </Box>
      </Box>

      <Container maxWidth="md">
        <Box sx={{ py: 3 }}>
          {/* フェーズコンテンツ */}
          <Box>
            {phase < 3 && <StartPhase />}
            {phase >= 3 && phase < 13 && <StructureConfirmation />}
            {/* Phase 13+ redirects, or shows loading if waiting for redirect */}
            {phase >= 13 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                生成が完了しました。試験ページへ移動しています...
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </>
  );
}
