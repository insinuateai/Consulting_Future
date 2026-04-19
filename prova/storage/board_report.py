"""
prova/storage/board_report.py

PDF board report generator for the CCO dashboard.
Uses ReportLab to produce a formatted executive summary with:
  - KPI summary table
  - Weekly trend table
  - Breakdown by model, workflow, and failure type
  - Filter/date context header
"""

from __future__ import annotations

import io
from datetime import UTC, datetime
from typing import Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

_BLACK      = colors.HexColor("#0A0A0A")
_WHITE      = colors.HexColor("#FFFFFF")
_GREEN      = colors.HexColor("#22C55E")
_RED        = colors.HexColor("#EF4444")
_GREY       = colors.HexColor("#6B7280")
_LIGHT_GREY = colors.HexColor("#F3F4F6")
_BORDER     = colors.HexColor("#2A2A2A")

_PAGE_W, _PAGE_H = A4

_HEADING = ParagraphStyle(
    "Heading",
    fontName="Helvetica-Bold",
    fontSize=20,
    textColor=_BLACK,
    spaceAfter=4,
)
_SUBHEADING = ParagraphStyle(
    "Subheading",
    fontName="Helvetica-Bold",
    fontSize=11,
    textColor=_BLACK,
    spaceBefore=14,
    spaceAfter=4,
)
_BODY = ParagraphStyle(
    "Body",
    fontName="Helvetica",
    fontSize=9,
    textColor=_GREY,
    spaceAfter=2,
)
_FOOTER = ParagraphStyle(
    "Footer",
    fontName="Helvetica",
    fontSize=7,
    textColor=_GREY,
)

_TABLE_HEADER_STYLE = [
    ("BACKGROUND", (0, 0), (-1, 0), _BLACK),
    ("TEXTCOLOR",  (0, 0), (-1, 0), _WHITE),
    ("FONTNAME",   (0, 0), (-1, 0), "Helvetica-Bold"),
    ("FONTSIZE",   (0, 0), (-1, 0), 8),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [_WHITE, _LIGHT_GREY]),
    ("FONTNAME",   (0, 1), (-1, -1), "Helvetica"),
    ("FONTSIZE",   (0, 1), (-1, -1), 8),
    ("GRID",       (0, 0), (-1, -1), 0.25, _BORDER),
    ("LEFTPADDING",  (0, 0), (-1, -1), 6),
    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ("TOPPADDING",   (0, 0), (-1, -1), 4),
    ("BOTTOMPADDING",(0, 0), (-1, -1), 4),
]


def _fmt_date(iso: str) -> str:
    try:
        return datetime.fromisoformat(iso).strftime("%d %b %Y")
    except Exception:
        return iso


def generate_board_report_pdf(
    data: dict[str, Any],
    user_id: str,
    start: str,
    end: str,
    filters: dict[str, Any],
) -> bytes:
    """Render a ReportLab PDF board report and return bytes."""
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    story: list[Any] = []
    styles = getSampleStyleSheet()

    kpis = data.get("kpis") or {}
    weekly = data.get("weekly_trend") or []
    by_model = data.get("by_model") or []
    by_workflow = data.get("by_workflow") or []
    by_failure = data.get("by_failure_type") or []

    generated_at = datetime.now(UTC).strftime("%d %b %Y %H:%M UTC")

    # Header
    story.append(Paragraph("PROVA", _HEADING))
    story.append(Paragraph("CCO Board Report", _SUBHEADING))
    story.append(Paragraph(
        f"Period: {_fmt_date(start)} to {_fmt_date(end)} &nbsp;&nbsp; Generated: {generated_at}",
        _BODY,
    ))

    active_filters = [f"{k}: {v}" for k, v in filters.items() if v]
    if active_filters:
        story.append(Paragraph("Filters: " + ", ".join(active_filters), _BODY))

    story.append(Spacer(1, 0.3 * cm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=_BORDER))
    story.append(Spacer(1, 0.3 * cm))

    # KPI summary
    story.append(Paragraph("Key Performance Indicators", _SUBHEADING))
    kpi_data = [
        ["Metric", "Value"],
        ["Certificates Issued", str(kpis.get("certs_issued", 0))],
        ["Failures Caught", str(kpis.get("failures_caught", 0))],
        ["Avg Validity Rate", f"{kpis.get('avg_validity_rate', 0)}%"],
        ["Policies Evidenced", str(kpis.get("policies_evidenced", 0))],
    ]
    kpi_table = Table(kpi_data, colWidths=[10 * cm, 6 * cm])
    kpi_table.setStyle(TableStyle(_TABLE_HEADER_STYLE))
    story.append(kpi_table)

    # Weekly trend
    if weekly:
        story.append(Paragraph("Weekly Trend", _SUBHEADING))
        trend_data = [["Week", "Valid", "Circular", "Contradiction", "Unsupported Leap"]]
        for row in weekly:
            trend_data.append([
                row.get("week", ""),
                str(row.get("valid", 0)),
                str(row.get("circular", 0)),
                str(row.get("contradiction", 0)),
                str(row.get("unsupported_leap", 0)),
            ])
        trend_table = Table(trend_data, colWidths=[3.2 * cm, 2.2 * cm, 2.8 * cm, 3.4 * cm, 4 * cm])
        trend_table.setStyle(TableStyle(_TABLE_HEADER_STYLE))
        story.append(trend_table)

    # By model
    if by_model:
        story.append(Paragraph("Breakdown by Model", _SUBHEADING))
        model_data = [["Model", "Total", "Valid", "Invalid"]]
        for row in by_model:
            model_data.append([
                row.get("model", "unknown"),
                str(row.get("total", 0)),
                str(row.get("valid", 0)),
                str(row.get("invalid", 0)),
            ])
        model_table = Table(model_data, colWidths=[9 * cm, 2.5 * cm, 2.5 * cm, 2.5 * cm])
        model_table.setStyle(TableStyle(_TABLE_HEADER_STYLE))
        story.append(model_table)

    # By workflow
    if by_workflow:
        story.append(Paragraph("Breakdown by Workflow", _SUBHEADING))
        wf_data = [["Workflow", "Total", "Valid", "Invalid"]]
        for row in by_workflow:
            wf_data.append([
                row.get("workflow", "untagged"),
                str(row.get("total", 0)),
                str(row.get("valid", 0)),
                str(row.get("invalid", 0)),
            ])
        wf_table = Table(wf_data, colWidths=[9 * cm, 2.5 * cm, 2.5 * cm, 2.5 * cm])
        wf_table.setStyle(TableStyle(_TABLE_HEADER_STYLE))
        story.append(wf_table)

    # By failure type
    if by_failure:
        story.append(Paragraph("Failure Type Distribution", _SUBHEADING))
        fail_data = [["Failure Type", "Count"]]
        for row in by_failure:
            fail_data.append([row.get("type", "NONE"), str(row.get("count", 0))])
        fail_table = Table(fail_data, colWidths=[12 * cm, 4.5 * cm])
        fail_table.setStyle(TableStyle(_TABLE_HEADER_STYLE))
        story.append(fail_table)

    # Footer
    story.append(Spacer(1, 0.5 * cm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=_BORDER))
    story.append(Spacer(1, 0.2 * cm))
    story.append(Paragraph(
        "Generated by Prova -- prova.cobound.dev -- "
        "This report reflects certificates issued during the specified period only. "
        "All certificates are permanently retained and individually verifiable.",
        _FOOTER,
    ))

    doc.build(story)
    return buf.getvalue()
