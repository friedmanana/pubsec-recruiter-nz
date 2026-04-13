-- Migration 005: Candidate portal tables
CREATE TABLE IF NOT EXISTS candidate_profiles (
  id         UUID PRIMARY KEY,
  full_name  TEXT NOT NULL DEFAULT '',
  email      TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_applications (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_profile_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  job_title            TEXT NOT NULL DEFAULT '',
  company              TEXT NOT NULL DEFAULT '',
  job_description_text TEXT NOT NULL DEFAULT '',
  status               TEXT NOT NULL DEFAULT 'DRAFT'
                         CHECK (status IN ('DRAFT','IN_PROGRESS','COMPLETE')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cv_documents (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  type           TEXT NOT NULL CHECK (type IN ('ORIGINAL','ENHANCED')),
  content_text   TEXT NOT NULL DEFAULT '',
  content_html   TEXT NOT NULL DEFAULT '',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cover_letters (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  content_text   TEXT NOT NULL DEFAULT '',
  content_html   TEXT NOT NULL DEFAULT '',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_applications_profile_id  ON job_applications(candidate_profile_id);
CREATE INDEX IF NOT EXISTS idx_cv_documents_application_id  ON cv_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_cover_letters_application_id ON cover_letters(application_id);
