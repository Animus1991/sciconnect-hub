"""Conferences — FastAPI equivalent of server/src/routes/conferences.ts"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import date

router = APIRouter()

_conferences = [
    {
        "id": "conf-001", "name": "ICML 2026", "type": "conference",
        "field": "Machine Learning", "location": "Vienna, Austria",
        "startDate": "2026-07-21", "endDate": "2026-07-27",
        "website": "https://icml.cc/2026",
        "deadlines": [
            {"label": "Full Paper", "date": "2026-02-06", "status": "passed"},
            {"label": "Notification", "date": "2026-05-01", "status": "upcoming"},
        ],
        "submissions": [
            {"id": "sub-001", "title": "Scalable Federated Learning with DP", "type": "paper", "status": "under_review"},
        ],
        "tags": ["ML", "deep learning"], "isAttending": True,
    },
    {
        "id": "conf-002", "name": "QIP 2026", "type": "conference",
        "field": "Quantum Computing", "location": "Singapore",
        "startDate": "2026-06-15", "endDate": "2026-06-19",
        "website": "https://qip2026.org",
        "deadlines": [
            {"label": "Poster Submission", "date": "2026-03-15", "status": "upcoming"},
        ],
        "submissions": [], "tags": ["quantum computing"], "isAttending": True,
    },
]


class CreateConferenceRequest(BaseModel):
    name: str
    type: str
    field: str
    location: str
    startDate: str
    endDate: str
    website: Optional[str] = None


class AddSubmissionRequest(BaseModel):
    title: str
    type: str


@router.get("/")
def list_conferences(type: Optional[str] = None, field: Optional[str] = None):
    result = _conferences
    if type:
        result = [c for c in result if c["type"] == type]
    if field:
        result = [c for c in result if field.lower() in c["field"].lower()]
    return {"conferences": result, "total": len(result)}


@router.get("/deadlines/upcoming")
def upcoming_deadlines():
    today = str(date.today())
    deadlines = []
    for conf in _conferences:
        for d in conf.get("deadlines", []):
            if d["date"] > today:
                deadlines.append({"conference": conf["name"], "conferenceId": conf["id"], **d})
    deadlines.sort(key=lambda x: x["date"])
    return {"deadlines": deadlines[:10], "total": len(deadlines)}


@router.get("/{conf_id}")
def get_conference(conf_id: str):
    for c in _conferences:
        if c["id"] == conf_id:
            return c
    raise HTTPException(status_code=404, detail="Conference not found")


@router.post("/", status_code=201)
def create_conference(req: CreateConferenceRequest):
    new = {"id": f"conf-{len(_conferences)+1:03d}", **req.model_dump(), "deadlines": [], "submissions": [], "tags": [], "isAttending": False}
    _conferences.append(new)
    return new


@router.post("/{conf_id}/submissions", status_code=201)
def add_submission(conf_id: str, req: AddSubmissionRequest):
    for c in _conferences:
        if c["id"] == conf_id:
            sub = {"id": f"sub-{len(c['submissions'])+1:03d}", **req.model_dump(), "status": "draft"}
            c["submissions"].append(sub)
            return sub
    raise HTTPException(status_code=404, detail="Conference not found")


@router.patch("/{conf_id}/attend")
def toggle_attend(conf_id: str):
    for c in _conferences:
        if c["id"] == conf_id:
            c["isAttending"] = not c.get("isAttending", False)
            return {"isAttending": c["isAttending"]}
    raise HTTPException(status_code=404, detail="Conference not found")
