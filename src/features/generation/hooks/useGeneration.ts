import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGenerationStatus, startStructureGeneration, confirmStructure } from '@/services/api/gateway/generation';

export const useJobStatusQuery = (jobId: string | null, enabled: boolean) => {
  return useQuery({
    queryKey: ['generation', 'status', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('No Job ID');
      return await getGenerationStatus(jobId);
    },
    enabled: !!jobId && enabled,
    refetchInterval: (query) => {
      const data = query.state.data;
      // If no data yet, poll
      if (!data) return 1000;

      // Stop polling if waiting for user (3, 13) or completed (21)
      // 3: structure_confirmed
      // 13: generation_confirmed
      // 21: publication_publishing (done)
      if (data.phase === 3 || data.phase === 13 || data.phase >= 21) return false;

      return 1000;
    }
  });
};

export const useStartGenerationMutation = () => {
  return useMutation({
    mutationFn: startStructureGeneration,
  });
};

export const useConfirmJobMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, structureData }: { jobId: string; structureData?: any }) =>
      confirmStructure(jobId, structureData),
    onSuccess: (data: any, variables: { jobId: string }) => {
      // Optimistically update phase to avoid reverting to 3 when polling resumes
      queryClient.setQueryData(['generation', 'status', variables.jobId], (old: any) => ({
        ...old,
        phase: 4
      }));
      // Invalidate to fetch latest status (e.g. transition to 10)
      queryClient.invalidateQueries({ queryKey: ['generation', 'status', variables.jobId] });

      // If examId is returned immediately (e.g. sync confirmation), set it
      if (data.examId) {
        // We need access to store to set examId, but hooks can't access store directly inside onSuccess unless we pull useGenerationStore outside.
        // Instead, we can rely on the polling loop to pick up the examId, OR just let the polling handle it.
        // However, CreatePage handles store updates.
        // Let's just return the data here so the component can handle it if needed.
      }
    }
  });
};
