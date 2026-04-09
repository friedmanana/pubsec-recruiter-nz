from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest

import services.database as database_module
from services.database import (
    get_job,
    get_shortlist,
    list_jobs,
    save_job,
    save_screening_result,
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _mock_response(data: list[dict]) -> MagicMock:
    """Return a mock Supabase query response with the given data list."""
    resp = MagicMock()
    resp.data = data
    return resp


def _make_chain(final_response: MagicMock) -> MagicMock:
    """Build a chainable mock that returns *final_response* from .execute()."""
    chain = MagicMock()
    chain.upsert.return_value = chain
    chain.select.return_value = chain
    chain.eq.return_value = chain
    chain.order.return_value = chain
    chain.execute.return_value = final_response
    return chain


# ---------------------------------------------------------------------------
# Tests: save_job
# ---------------------------------------------------------------------------


def test_save_job_calls_upsert() -> None:
    """save_job should call upsert on the 'jobs' table with the supplied dict."""
    mock_client = MagicMock()
    saved = {"id": "abc-123", "title": "Policy Analyst"}
    mock_chain = _make_chain(_mock_response([saved]))
    mock_client.table.return_value = mock_chain

    with patch("services.database.get_client", return_value=mock_client):
        result = save_job({"title": "Policy Analyst"})

    mock_client.table.assert_called_once_with("jobs")
    mock_chain.upsert.assert_called_once_with({"title": "Policy Analyst"}, on_conflict="id")
    assert result == saved


# ---------------------------------------------------------------------------
# Tests: get_job
# ---------------------------------------------------------------------------


def test_get_job_returns_none_when_not_found() -> None:
    """get_job should return None when Supabase returns an empty data list."""
    mock_client = MagicMock()
    mock_chain = _make_chain(_mock_response([]))
    mock_client.table.return_value = mock_chain

    with patch("services.database.get_client", return_value=mock_client):
        result = get_job("nonexistent-uuid")

    assert result is None


def test_get_job_returns_record_when_found() -> None:
    """get_job should return the first record when Supabase finds a match."""
    mock_client = MagicMock()
    job = {"id": "abc-123", "title": "ICT PM"}
    mock_chain = _make_chain(_mock_response([job]))
    mock_client.table.return_value = mock_chain

    with patch("services.database.get_client", return_value=mock_client):
        result = get_job("abc-123")

    assert result == job


# ---------------------------------------------------------------------------
# Tests: list_jobs
# ---------------------------------------------------------------------------


def test_list_jobs_filters_by_status() -> None:
    """list_jobs should call .eq('status', ...) when a status is provided."""
    mock_client = MagicMock()
    jobs = [{"id": "x", "status": "OPEN"}]
    mock_chain = _make_chain(_mock_response(jobs))
    mock_client.table.return_value = mock_chain

    with patch("services.database.get_client", return_value=mock_client):
        result = list_jobs(status="OPEN")

    mock_chain.eq.assert_called_with("status", "OPEN")
    assert result == jobs


def test_list_jobs_no_filter_when_status_is_none() -> None:
    """list_jobs should NOT call .eq() when no status is provided."""
    mock_client = MagicMock()
    jobs = [{"id": "x"}, {"id": "y"}]
    mock_chain = _make_chain(_mock_response(jobs))
    mock_client.table.return_value = mock_chain

    with patch("services.database.get_client", return_value=mock_client):
        result = list_jobs(status=None)

    mock_chain.eq.assert_not_called()
    assert result == jobs


# ---------------------------------------------------------------------------
# Tests: save_screening_result
# ---------------------------------------------------------------------------


def test_save_screening_result_upsert() -> None:
    """save_screening_result should upsert on the 'screening_results' table."""
    mock_client = MagicMock()
    saved = {"id": "sr-1", "job_id": "j-1", "candidate_id": "c-1", "overall_score": 85.0}
    mock_chain = _make_chain(_mock_response([saved]))
    mock_client.table.return_value = mock_chain

    payload = {"job_id": "j-1", "candidate_id": "c-1", "overall_score": 85.0}

    with patch("services.database.get_client", return_value=mock_client):
        result = save_screening_result(payload)

    mock_client.table.assert_called_once_with("screening_results")
    mock_chain.upsert.assert_called_once_with(payload, on_conflict="job_id,candidate_id")
    assert result == saved


# ---------------------------------------------------------------------------
# Tests: get_shortlist
# ---------------------------------------------------------------------------


def test_get_shortlist_filters_by_recommendation() -> None:
    """get_shortlist should apply eq('recommendation', 'SHORTLIST') filter."""
    mock_client = MagicMock()
    row = {
        "id": "sr-1",
        "job_id": "j-1",
        "overall_score": 90.0,
        "recommendation": "SHORTLIST",
        "candidates": {"id": "c-1", "full_name": "Aroha Ngata"},
    }
    mock_chain = _make_chain(_mock_response([row]))
    mock_client.table.return_value = mock_chain

    with patch("services.database.get_client", return_value=mock_client):
        result = get_shortlist("j-1")

    # Assert the SHORTLIST filter was applied
    calls = [str(c) for c in mock_chain.eq.call_args_list]
    assert any("SHORTLIST" in c for c in calls)

    # Candidate info should be merged into the result
    assert len(result) == 1
    assert result[0]["full_name"] == "Aroha Ngata"


# ---------------------------------------------------------------------------
# Tests: RuntimeError when Supabase not configured
# ---------------------------------------------------------------------------


def test_runtime_error_when_no_supabase_config() -> None:
    """save_job should raise RuntimeError when SUPABASE_URL is empty."""
    original_url = database_module.settings.supabase_url
    original_key = database_module.settings.supabase_key
    try:
        database_module.settings.supabase_url = ""
        database_module.settings.supabase_key = ""
        with pytest.raises(RuntimeError, match="Supabase not configured"):
            save_job({"title": "Test Job"})
    finally:
        database_module.settings.supabase_url = original_url
        database_module.settings.supabase_key = original_key
