"""
prova/api/analytics.py

CCO analytics endpoint. Aggregates certificate data for the live dashboard
and serves board report PDFs.

Endpoints:
  GET  /analytics/cco         -- aggregated analytics (auth required)
  POST /analytics/cco/export  -- PDF board report download
"""

from __future__ import annotations

import os
from datetime import UTC, datetime, timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from fastapi.responses import StreamingResponse
from supabase import Client, create_client

from prova.api.auth import resolve_auth
from prova.api.errors import unauthorized

analytics_router = APIRouter(prefix="/analytics", tags=["analytics"])


def _get_supabase() -> Client:
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    return create_client(url, key)


def _parse_date_range(range_param: str) -> tuple[str, str]:
    """Convert a range string like '30d', '90d', '365d' to ISO timestamps."""
    now = datetime.now(UTC)
    days = int(range_param.rstrip("d")) if range_param.endswith("d") else 90
    start = now - timedelta(days=days)
    return start.isoformat(), now.isoformat()


@analytics_router.get("/cco")
async def get_cco_analytics(
    request: Request,
    range: str = Query(default="90d", pattern=r"^\d+d$"),
    model: str | None = Query(default=None),
    workflow: str | None = Query(default=None),
    failure_type: str | None = Query(default=None),
) -> dict[str, Any]:
    """Return aggregated CCO analytics for the authenticated user.

    Query params:
      range        -- date range, e.g. 30d, 90d, 365d (default: 90d)
      model        -- filter by metadata.model
      workflow     -- filter by metadata.workflow
      failure_type -- filter by failure.type (CIRCULAR | CONTRADICTION | UNSUPPORTED_LEAP)
    """
    supabase = _get_supabase()
    auth = await resolve_auth(request, supabase)

    if not auth["authenticated"] or not auth.get("user_id"):
        raise unauthorized()

    user_id = auth["user_id"]
    start_iso, end_iso = _parse_date_range(range)

    result = supabase.rpc(
        "cco_analytics",
        {
            "p_user_id":      user_id,
            "p_start":        start_iso,
            "p_end":          end_iso,
            "p_model":        model,
            "p_workflow":     workflow,
            "p_failure_type": failure_type,
        },
    ).execute()

    if not result.data:
        return {
            "kpis": {"failures_caught": 0, "certs_issued": 0, "avg_validity_rate": 0, "policies_evidenced": 0},
            "weekly_trend": [],
            "by_model": [],
            "by_workflow": [],
            "by_failure_type": [],
        }

    return result.data


@analytics_router.post("/cco/export")
async def export_board_report(
    request: Request,
    range: str = Query(default="90d", pattern=r"^\d+d$"),
    model: str | None = Query(default=None),
    workflow: str | None = Query(default=None),
    failure_type: str | None = Query(default=None),
) -> Response:
    """Generate and download a PDF board report for the current filter state."""
    supabase = _get_supabase()
    auth = await resolve_auth(request, supabase)

    if not auth["authenticated"] or not auth.get("user_id"):
        raise unauthorized()

    user_id = auth["user_id"]
    start_iso, end_iso = _parse_date_range(range)

    result = supabase.rpc(
        "cco_analytics",
        {
            "p_user_id":      user_id,
            "p_start":        start_iso,
            "p_end":          end_iso,
            "p_model":        model,
            "p_workflow":     workflow,
            "p_failure_type": failure_type,
        },
    ).execute()

    data = result.data or {}

    from prova.storage.board_report import generate_board_report_pdf
    pdf_bytes = generate_board_report_pdf(
        data=data,
        user_id=user_id,
        start=start_iso,
        end=end_iso,
        filters={"model": model, "workflow": workflow, "failure_type": failure_type},
    )

    filename = f"prova-board-report-{datetime.now(UTC).strftime('%Y%m%d')}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
