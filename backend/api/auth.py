"""JWT verification dependency for candidate portal routes."""
from __future__ import annotations

import os
from functools import lru_cache

import httpx
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

_bearer = HTTPBearer(auto_error=False)

# Supabase now uses ECC P-256 (ES256) signing keys by default.
# We support all three algorithms in priority order.
_ALGORITHMS = ["ES256", "RS256", "HS256"]


@lru_cache(maxsize=1)
def _get_jwks() -> dict:
    url = os.environ.get("SUPABASE_URL", "").rstrip("/") + "/auth/v1/.well-known/jwks.json"
    resp = httpx.get(url, timeout=10)
    resp.raise_for_status()
    return resp.json()


def _decode_with_jwks(token: str) -> dict:
    jwks = _get_jwks()
    return jwt.decode(
        token,
        jwks,
        algorithms=["ES256", "RS256"],
        audience="authenticated",
        options={"verify_exp": True},
    )


def _decode_with_secret(token: str) -> dict:
    secret = os.environ.get("SUPABASE_JWT_SECRET", "")
    if not secret:
        raise JWTError("No SUPABASE_JWT_SECRET set")
    return jwt.decode(
        token,
        secret,
        algorithms=["HS256"],
        audience="authenticated",
        options={"verify_exp": True},
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(_bearer),
) -> dict:
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = credentials.credentials

    # Try JWKS (ES256/RS256) first — covers current Supabase ECC keys
    last_exc: Exception = JWTError("No method succeeded")
    try:
        payload = _decode_with_jwks(token)
    except JWTError as exc:
        last_exc = exc
        # Fall back to legacy HS256 shared secret
        try:
            payload = _decode_with_secret(token)
        except JWTError as exc2:
            last_exc = exc2
            raise HTTPException(
                status_code=401, detail=f"Invalid token: {last_exc}"
            ) from exc2

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token missing sub claim")

    return {"user_id": user_id, "email": payload.get("email", "")}
