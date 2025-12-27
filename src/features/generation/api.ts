import {
  getGenerationStatus,
  startStructureGeneration,
  type GenerationStatusResponse,
} from '@/services/api/gateway/generation';

export { getGenerationStatus, startStructureGeneration, };
export { confirmStructure } from '@/services/api/gateway/generation';
export type { GenerationStatusResponse };
