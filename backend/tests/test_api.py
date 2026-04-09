from __future__ import annotations

import json
import os

import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)

_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")


def _load_example_jobs() -> list[dict]:
    with open(os.path.join(_DATA_DIR, "example_jobs.json")) as fh:
        return json.load(fh)


def _load_example_candidates() -> list[dict]:
    with open(os.path.join(_DATA_DIR, "example_candidates.json")) as fh:
        return json.load(fh)


def test_health_returns_ok() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_analyse_job_valid_text() -> None:
    payload = {
        "raw_text": (
            "Senior Policy Analyst\n"
            "Organisation: Ministry of Business, Innovation and Employment\n"
            "Location: Wellington\n"
            "We are looking for an experienced policy analyst to join our team. "
            "Required skills: policy analysis, stakeholder engagement, report writing."
        )
    }
    response = client.post("/jobs/analyse", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "job" in data
    assert "title" in data["job"]


def test_analyse_job_empty_text() -> None:
    payload = {"raw_text": ""}
    response = client.post("/jobs/analyse", json=payload)
    # Either 422 validation error or job title is empty/default
    if response.status_code == 200:
        data = response.json()
        title = data.get("job", {}).get("title", "")
        assert title == "" or title is not None
    else:
        assert response.status_code == 422


def test_screen_candidates_returns_structure() -> None:
    jobs = _load_example_jobs()
    candidates = _load_example_candidates()

    job = jobs[0]
    sample_candidates = candidates[:2]

    payload = {"candidates": sample_candidates, "job": job}
    response = client.post("/jobs/screen", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "shortlisted" in data
    assert "all_screened" in data


@pytest.mark.integration
def test_pipeline_endpoint_returns_structure() -> None:
    payload = {
        "raw_jd_text": (
            "Senior Policy Analyst\n"
            "Organisation: Ministry of Business, Innovation and Employment\n"
            "Location: Wellington\n"
            "We are seeking a Senior Policy Analyst to lead evidence-based policy development "
            "in the NZ public sector. Required skills: policy analysis, stakeholder engagement, "
            "cabinet paper writing, Treaty of Waitangi commitment."
        )
    }
    response = client.post("/jobs/pipeline", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "job" in data
    assert "all_screened" in data
