-- Migration: Drop legacy markup format columns (non-backwards-compatible)
-- Date: 2026-01-03
-- Purpose: Remove the `question_format` and `answer_format` columns which recorded Markdown/LaTeX as stored values.
-- Risk: Non-reversible in terms of data (values are deleted). Ensure backups are taken.

BEGIN;

-- Verify existing columns (Postgres example)
-- SELECT column_name FROM information_schema.columns WHERE table_name IN ('questions','sub_questions');

-- Remove columns from tables (if present)
ALTER TABLE IF EXISTS questions DROP COLUMN IF EXISTS question_format;
ALTER TABLE IF EXISTS sub_questions DROP COLUMN IF EXISTS question_format;
ALTER TABLE IF EXISTS sub_questions DROP COLUMN IF EXISTS answer_format;

-- If any views or indexes reference these columns, drop/alter them accordingly before or in this transaction.

COMMIT;

-- Rollback plan:
-- 1) If issues occur, restore from backup snapshot taken immediately before applying this migration.
-- 2) Alternatively, if you need to revert schema without restore, add columns back (non-populated):
--    ALTER TABLE questions ADD COLUMN question_format INT;
--    ALTER TABLE sub_questions ADD COLUMN question_format INT;
--    ALTER TABLE sub_questions ADD COLUMN answer_format INT;
-- Note: Re-adding columns will not restore prior data.
