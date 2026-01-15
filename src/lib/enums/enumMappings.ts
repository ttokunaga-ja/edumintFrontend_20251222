import type { EnumMappings } from './types';

export const DEFAULT_ENUM_MAPPINGS: EnumMappings = {
  questionType: new Map<number, any>([
    // base selection types shifted to 0-based: 0..4
    [0, { i18nKey: 'enum.questionType.0', editable: false, order: 0 }],
    [1, { i18nKey: 'enum.questionType.1', editable: false, order: 1 }],
    [2, { i18nKey: 'enum.questionType.2', editable: false, order: 2 }],
    [3, { i18nKey: 'enum.questionType.3', editable: false, order: 3 }],
    [4, { i18nKey: 'enum.questionType.4', editable: false, order: 4 }],
    // extended essay/long-form types remain at 10+
    [10, { i18nKey: 'enum.questionType.10', editable: true, order: 6 }],
    [11, { i18nKey: 'enum.questionType.11', editable: true, order: 7 }],
    [12, { i18nKey: 'enum.questionType.12', editable: true, order: 8 }],
    [13, { i18nKey: 'enum.questionType.13', editable: true, order: 9 }],
    [14, { i18nKey: 'enum.questionType.14', editable: true, order: 10 }],
  ]),
  academic_field: new Map<number, any>([
    // A. 文系・人文社会グループ (00 ~ 06)
    [0, { i18nKey: 'enum.academic_field.00', editable: false, order: 0 }],
    [1, { i18nKey: 'enum.academic_field.01', editable: false, order: 1 }],
    [2, { i18nKey: 'enum.academic_field.02', editable: false, order: 2 }],
    [3, { i18nKey: 'enum.academic_field.03', editable: false, order: 3 }],
    [4, { i18nKey: 'enum.academic_field.04', editable: false, order: 4 }],
    [5, { i18nKey: 'enum.academic_field.05', editable: false, order: 5 }],
    [6, { i18nKey: 'enum.academic_field.06', editable: false, order: 6 }],
    // B. 理工・情報グループ (10 ~ 16)
    [10, { i18nKey: 'enum.academic_field.10', editable: false, order: 10 }],
    [11, { i18nKey: 'enum.academic_field.11', editable: false, order: 11 }],
    [12, { i18nKey: 'enum.academic_field.12', editable: false, order: 12 }],
    [13, { i18nKey: 'enum.academic_field.13', editable: false, order: 13 }],
    [14, { i18nKey: 'enum.academic_field.14', editable: false, order: 14 }],
    [15, { i18nKey: 'enum.academic_field.15', editable: false, order: 15 }],
    [16, { i18nKey: 'enum.academic_field.16', editable: false, order: 16 }],
    // C. 農学・医療・生活・芸術グループ (20 ~ 26)
    [20, { i18nKey: 'enum.academic_field.20', editable: false, order: 20 }],
    [21, { i18nKey: 'enum.academic_field.21', editable: false, order: 21 }],
    [22, { i18nKey: 'enum.academic_field.22', editable: false, order: 22 }],
    [23, { i18nKey: 'enum.academic_field.23', editable: false, order: 23 }],
    [24, { i18nKey: 'enum.academic_field.24', editable: false, order: 24 }],
    [25, { i18nKey: 'enum.academic_field.25', editable: false, order: 25 }],
    [26, { i18nKey: 'enum.academic_field.26', editable: false, order: 26 }],
  ]),
  level: new Map<number, any>([
    [0, { i18nKey: 'enum.level.basic', editable: true, order: 0 }],
    [1, { i18nKey: 'enum.level.standard', editable: true, order: 1 }],
    [2, { i18nKey: 'enum.level.advanced', editable: true, order: 2 }],
  ]),

  // Exam type
  examType: new Map<number, any>([
    [0, { i18nKey: 'enum.exam.regular', editable: false, order: 0 }], // REGULAR EXAM
    [1, { i18nKey: 'enum.exam.class', editable: false, order: 1 }],   // INCLASS EXAM
    [2, { i18nKey: 'enum.exam.quiz', editable: false, order: 2 }],    // QUIZ EXAM
  ]),

  // Updated period (use existing period i18n keys)
  period: new Map<number, any>([
    [0, { i18nKey: 'enum.period.none', editable: false, order: 0 }],
    [1, { i18nKey: 'enum.period.1day', editable: false, order: 1 }],
    [2, { i18nKey: 'enum.period.1week', editable: false, order: 2 }],
    [3, { i18nKey: 'enum.period.1month', editable: false, order: 3 }],
    [4, { i18nKey: 'enum.period.1year', editable: false, order: 4 }],
    [5, { i18nKey: 'enum.period.custom', editable: false, order: 5 }],
  ]),

  // Exam duration (minutes)
  duration: new Map<number, any>([
    [5, { i18nKey: 'enum.duration.5', editable: false, order: 0 }],
    [10, { i18nKey: 'enum.duration.10', editable: false, order: 1 }],
    [30, { i18nKey: 'enum.duration.30', editable: false, order: 2 }],
    [45, { i18nKey: 'enum.duration.45', editable: false, order: 3 }],
    [60, { i18nKey: 'enum.duration.60', editable: false, order: 4 }],
    [90, { i18nKey: 'enum.duration.90', editable: false, order: 5 }],
  ]),

  // Academic track (Boolean: is_humanities)
  academic_track: new Map<number, any>([
    [0, { i18nKey: 'enum.academic_track.science', editable: false, order: 0 }],
    [1, { i18nKey: 'enum.academic_track.humanities', editable: false, order: 1 }],
  ]),

  // Home sorting options (managed via numeric IDs)
  sort_order: new Map<number, any>([
    [0, { i18nKey: 'enum.sort_order.recommended', editable: false, order: 0 }],
    [1, { i18nKey: 'enum.sort_order.latest', editable: false, order: 1 }],
    [2, { i18nKey: 'enum.sort_order.popular', editable: false, order: 2 }],
    [3, { i18nKey: 'enum.sort_order.most_viewed', editable: false, order: 3 }],
  ]),

  // Language mapping (numeric IDs)
  language: new Map<number, any>([
    [0, { i18nKey: 'enum.lang.ja', editable: false, order: 0 }],
    [1, { i18nKey: 'enum.lang.en', editable: false, order: 1 }],
    [2, { i18nKey: 'enum.lang.zh', editable: false, order: 2 }],
    [3, { i18nKey: 'enum.lang.ko', editable: false, order: 3 }],
    [4, { i18nKey: 'enum.lang.other', editable: false, order: 4 }],
  ]),

  // Generation Phase (CreatePage state transitions)
  // 00-09: Common states (shared across all phases)
  // 10-19: Structure Phase (Markdown extraction)
  // 20-29: Generation Phase (AI content creation)
  // 30-39: Publication Phase
  generation_phase: new Map<number, any>([
    // Common States (00-09) - Used across all phases
    [0, { i18nKey: 'enum.common.confirming', editable: false, order: 0 }],
    [1, { i18nKey: 'enum.common.saving', editable: false, order: 1 }],
    [2, { i18nKey: 'enum.common.completed', editable: false, order: 2 }],
    [3, { i18nKey: 'enum.common.queued', editable: false, order: 3 }],
    [4, { i18nKey: 'enum.common.retry', editable: false, order: 4 }],
    [5, { i18nKey: 'enum.common.failed', editable: false, order: 5 }],
    
    // Structure Phase (10-19) - Markdown extraction from files
    [10, { i18nKey: 'enum.structure.uploading', editable: false, order: 10 }],
    [11, { i18nKey: 'enum.structure.extracting', editable: false, order: 11 }],
    [12, { i18nKey: 'enum.structure.analyzing', editable: false, order: 12 }],
    
    // Generation Phase (20-29) - AI content creation
    [20, { i18nKey: 'enum.generation.creating', editable: false, order: 20 }],
    
    // Publication Phase (30-39)
    [30, { i18nKey: 'enum.publication.publishing', editable: false, order: 30 }],
  ]),
};

// Note: Use Map<number, EnumEntry> to guarantee numeric ID usage at runtime.

export default DEFAULT_ENUM_MAPPINGS;
