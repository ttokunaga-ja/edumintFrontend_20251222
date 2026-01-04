// Centralized fixed variables and enum-like mappings used across the client
export const EXAM_TYPE_COLORS: Record<number, { bg: string; text: string }> = {
  0: { bg: '#1565c0', text: '#ffffff' }, // 定期試験：濃青
  1: { bg: '#c62828', text: '#ffffff' }, // 授業内試験：濃赤
  2: { bg: '#2e7d32', text: '#ffffff' }, // 小テスト：濃緑
};

export const EXAM_TYPE_LABELS: Record<number, string> = {
  0: '定期試験',
  1: '授業内試験',
  2: '小テスト',
};

export const DIFFICULTY_LEVELS: Record<number, string> = {
  0: 'basic',
  1: 'standard',
  2: 'advanced',
};

export const PROBLEM_FORMATS: Record<number, string> = {
  0: 'single_choice',
  1: 'multiple_choice',
  2: 'essay',
};

export const ACADEMIC_FIELDS: Record<number, string> = {
  0: 'science',
  1: 'humanities',
};

export const LANGUAGES: Record<number, string> = {
  0: 'ja',
  1: 'en',
};

export const LEARNED_STATUS: Record<number, string> = {
  0: 'not_learned',
  1: 'learning',
  2: 'learned',
};

export const ALLOWED_EXAM_TYPE_IDS = Object.keys(EXAM_TYPE_LABELS).map((k) => Number(k));

export default {
  EXAM_TYPE_COLORS,
  EXAM_TYPE_LABELS,
  DIFFICULTY_LEVELS,
  PROBLEM_FORMATS,
  ACADEMIC_FIELDS,
  LANGUAGES,
  LEARNED_STATUS,
  ALLOWED_EXAM_TYPE_IDS,
};
