from __future__ import annotations

import os
import tempfile

from fastapi import APIRouter, HTTPException, UploadFile

from agents.candidate_screener_agent import screen_batch
from agents.candidate_sourcing_agent import run_sourcing
from api.schemas import (
    AnalyseJobRequest,
    FullPipelineResponse,
    JobAnalysisResponse,
    RunFullPipelineRequest,
    ScreenCandidatesRequest,
    ScreeningResponse,
    ScreenUploadedCVsRequest,
    SourceCandidatesRequest,
    SourcingResponse,
)
from services.screening_service import run_full_pipeline, screen_uploaded_candidates

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.post("/analyse", response_model=JobAnalysisResponse)
def analyse_job_text(body: AnalyseJobRequest) -> JobAnalysisResponse:
    """Analyse a raw job description text and return a structured JobAnalysisResponse."""
    try:
        from agents.job_analyst_agent import analyse_job  # type: ignore[import]

        result = analyse_job(body.raw_text, is_file_path=False)
    except ImportError as exc:
        raise HTTPException(status_code=422, detail=f"Job analyst agent unavailable: {exc}") from exc
    except Exception as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    return JobAnalysisResponse(
        job=result.get("job_description", result.get("job", {})),
        validation=result.get("validation", {}),
        enriched=bool(result.get("enriched", False)),
    )


@router.post("/analyse/upload", response_model=JobAnalysisResponse)
async def analyse_job_upload(file: UploadFile) -> JobAnalysisResponse:
    """Upload a PDF job description and return a structured JobAnalysisResponse."""
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        from agents.job_analyst_agent import analyse_job  # type: ignore[import]
    except ImportError as exc:
        raise HTTPException(status_code=422, detail=f"Job analyst agent unavailable: {exc}") from exc

    contents = await file.read()

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        result = analyse_job(tmp_path, is_file_path=True)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    finally:
        os.unlink(tmp_path)

    return JobAnalysisResponse(
        job=result.get("job_description", result.get("job", {})),
        validation=result.get("validation", {}),
        enriched=bool(result.get("enriched", False)),
    )


@router.post("/source", response_model=SourcingResponse)
def source_candidates(body: SourceCandidatesRequest) -> SourcingResponse:
    """Source candidates for a structured job dict."""
    result = run_sourcing(body.job)
    return SourcingResponse(**result)


@router.post("/screen", response_model=ScreeningResponse)
def screen_candidates(body: ScreenCandidatesRequest) -> ScreeningResponse:
    """Screen a list of candidates against a job dict."""
    all_screened = screen_batch(body.candidates, body.job)

    shortlisted = [c for c in all_screened if c.get("recommendation") == "SHORTLIST"]
    second_round = [c for c in all_screened if c.get("recommendation") == "SECOND_ROUND"]
    hold = [c for c in all_screened if c.get("recommendation") == "HOLD"]
    declined = [c for c in all_screened if c.get("recommendation") == "DECLINE"]

    return ScreeningResponse(
        total_screened=len(all_screened),
        shortlisted=shortlisted,
        second_round=second_round,
        hold=hold,
        declined=declined,
        all_screened=all_screened,
    )


@router.post("/screen/upload-cvs", response_model=ScreeningResponse)
def screen_uploaded_cvs(body: ScreenUploadedCVsRequest) -> ScreeningResponse:
    """Screen candidates who uploaded their CVs directly (no sourcing step)."""
    result = screen_uploaded_candidates(body.cv_texts, body.raw_jd_text)

    all_screened = result.get("all_screened", [])
    shortlisted = [c for c in all_screened if c.get("recommendation") == "SHORTLIST"]
    second_round = [c for c in all_screened if c.get("recommendation") == "SECOND_ROUND"]
    hold = [c for c in all_screened if c.get("recommendation") == "HOLD"]
    declined = [c for c in all_screened if c.get("recommendation") == "DECLINE"]

    return ScreeningResponse(
        total_screened=len(all_screened),
        shortlisted=shortlisted,
        second_round=second_round,
        hold=hold,
        declined=declined,
        all_screened=all_screened,
    )


@router.post("/pipeline", response_model=FullPipelineResponse)
def run_pipeline(body: RunFullPipelineRequest) -> FullPipelineResponse:
    """One-click endpoint: paste a raw JD and get ranked candidates back."""
    result = run_full_pipeline(body.raw_jd_text)
    return FullPipelineResponse(
        job=result.get("job", {}),
        validation=result.get("validation", {}),
        total_sourced=result.get("total_sourced", 0),
        shortlisted=result.get("shortlisted", []),
        second_round=result.get("second_round", []),
        all_screened=result.get("all_screened", []),
    )
