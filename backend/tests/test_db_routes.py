from __future__ import annotations

from unittest.mock import patch

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


# ---------------------------------------------------------------------------
# GET /api/v1/jobs — list jobs
# ---------------------------------------------------------------------------


def test_get_jobs_returns_list() -> None:
    """GET /api/v1/jobs should return 200 with the list from list_jobs."""
    example_jobs = [
        {"id": "abc-1", "title": "Senior Policy Analyst", "status": "OPEN"},
        {"id": "abc-2", "title": "ICT Project Manager", "status": "OPEN"},
    ]
    with patch("api.routes.db_jobs.db.list_jobs", return_value=example_jobs):
        response = client.get("/api/v1/jobs")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2
    assert data[0]["title"] == "Senior Policy Analyst"


def test_get_jobs_with_status_filter() -> None:
    """GET /api/v1/jobs?status=OPEN should pass the status filter through."""
    example_jobs = [{"id": "abc-1", "title": "Policy Analyst", "status": "OPEN"}]
    with patch("api.routes.db_jobs.db.list_jobs", return_value=example_jobs) as mock_list:
        response = client.get("/api/v1/jobs?status=OPEN")

    assert response.status_code == 200
    mock_list.assert_called_once_with(status="OPEN")


# ---------------------------------------------------------------------------
# GET /api/v1/jobs/{job_id} — single job
# ---------------------------------------------------------------------------


def test_get_job_not_found() -> None:
    """GET /api/v1/jobs/{job_id} should return 404 when get_job returns None."""
    with patch("api.routes.db_jobs.db.get_job", return_value=None):
        response = client.get("/api/v1/jobs/nonexistent-uuid")

    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_get_job_returns_job() -> None:
    """GET /api/v1/jobs/{job_id} should return 200 and the job dict."""
    job = {"id": "abc-123", "title": "ICT Project Manager", "status": "OPEN"}
    with patch("api.routes.db_jobs.db.get_job", return_value=job):
        response = client.get("/api/v1/jobs/abc-123")

    assert response.status_code == 200
    assert response.json()["title"] == "ICT Project Manager"


# ---------------------------------------------------------------------------
# POST /api/v1/jobs/pipeline — 503 when Supabase not configured
# ---------------------------------------------------------------------------


def test_pipeline_503_when_no_supabase() -> None:
    """POST /api/v1/jobs/pipeline should return 503 when save_job raises RuntimeError."""
    with patch(
        "api.routes.db_jobs.db.save_job",
        side_effect=RuntimeError("Supabase not configured. Please set SUPABASE_URL and SUPABASE_KEY."),
    ):
        response = client.post(
            "/api/v1/jobs/pipeline",
            json={"raw_jd_text": "Senior Policy Analyst at MBIE"},
        )

    assert response.status_code == 503
    assert "Supabase not configured" in response.json()["detail"]


# ---------------------------------------------------------------------------
# GET /api/v1/jobs/{job_id}/shortlist — 503 when Supabase not configured
# ---------------------------------------------------------------------------


def test_shortlist_503_when_no_supabase() -> None:
    """GET /api/v1/jobs/{job_id}/shortlist should return 503 when get_job raises RuntimeError."""
    with patch(
        "api.routes.db_jobs.db.get_job",
        side_effect=RuntimeError("Supabase not configured. Please set SUPABASE_URL and SUPABASE_KEY."),
    ):
        response = client.get("/api/v1/jobs/some-job-id/shortlist")

    assert response.status_code == 503


# ---------------------------------------------------------------------------
# GET /api/v1/jobs — 503 when Supabase not configured
# ---------------------------------------------------------------------------


def test_list_jobs_503_when_no_supabase() -> None:
    """GET /api/v1/jobs should return 503 when list_jobs raises RuntimeError."""
    with patch(
        "api.routes.db_jobs.db.list_jobs",
        side_effect=RuntimeError("Supabase not configured. Please set SUPABASE_URL and SUPABASE_KEY."),
    ):
        response = client.get("/api/v1/jobs")

    assert response.status_code == 503
