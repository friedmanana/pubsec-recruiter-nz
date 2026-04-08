from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import List, Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field


class CandidateSource(str, Enum):
    DIRECT_APPLY = "DIRECT_APPLY"
    LINKEDIN_XRAY = "LINKEDIN_XRAY"
    SEEK = "SEEK"
    TRADEME = "TRADEME"


class Candidate(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    id: UUID = Field(default_factory=uuid4)
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    location: str
    linkedin_url: Optional[str] = None
    source: CandidateSource
    current_title: str
    current_organisation: str
    years_experience: int
    skills: List[str]
    qualifications: List[str]
    summary: str
    raw_cv_text: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class CandidateScore(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    candidate_id: UUID
    job_id: UUID
    overall_score: float = Field(ge=0, le=100)
    skill_match_score: float = Field(ge=0, le=100)
    experience_score: float = Field(ge=0, le=100)
    qualification_score: float = Field(ge=0, le=100)
    notes: str
    scored_at: datetime = Field(default_factory=datetime.utcnow)
