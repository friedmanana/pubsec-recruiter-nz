-- ============================================================
-- AI Pips — Migration 002: Platform candidate link
-- Adds candidate_profile_id to candidates table so that
-- job seekers sourced from the internal platform can be
-- traced back to their AI Pips profile.
-- ============================================================

ALTER TABLE candidates
  ADD COLUMN IF NOT EXISTS candidate_profile_id UUID;

CREATE INDEX IF NOT EXISTS idx_candidates_profile_id
  ON candidates(candidate_profile_id);
