-- ============================================================
-- AI Pips — Migration 009: Add PLATFORM source value
-- Allows candidates sourced from the AI Pips platform
-- (job seekers who registered and uploaded CVs) to be stored
-- in the candidates table with source = 'PLATFORM'.
-- ============================================================

ALTER TABLE candidates
  DROP CONSTRAINT IF EXISTS candidates_source_check;

ALTER TABLE candidates
  ADD CONSTRAINT candidates_source_check
    CHECK (source IN ('DIRECT_APPLY', 'LINKEDIN_XRAY', 'PLATFORM'));
