from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes.db_jobs import router as db_jobs_router
from api.routes.jobs import router as jobs_router
from api.schemas import HealthResponse

app = FastAPI(
    title="PubSec Recruiter NZ",
    description="AI-powered recruitment platform for NZ public sector organisations",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://*.vercel.app",
]
# Allow additional origins from env var (comma-separated)
extra = os.getenv("ALLOWED_ORIGINS", "")
if extra:
    ALLOWED_ORIGINS.extend([o.strip() for o in extra.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jobs_router)
app.include_router(db_jobs_router)


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", version="0.1.0")
