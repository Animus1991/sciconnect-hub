"""Blockchain / Contribution Tracking — FastAPI equivalent of server/src/routes/blockchain.ts"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import hashlib, time

router = APIRouter()

_contributions = [
    {
        "id": "c-001", "type": "ideation", "title": "Surface Code Braiding Concept",
        "description": "Novel approach to topological error correction.",
        "field": "Quantum Computing", "authorName": "Dr. Elena Vasquez",
        "hashDigest": "a1b2c3d4e5f6...", "anchorStatus": "verified",
        "timestamp": "2025-11-15T10:30:00Z", "impactScore": 87, "verifications": 5,
    },
    {
        "id": "c-002", "type": "experiment", "title": "Cas13 Off-Target Profiling Run #3",
        "description": "Third iteration of off-target detection.",
        "field": "Molecular Biology", "authorName": "Dr. Sofia Martínez",
        "hashDigest": "b2c3d4e5f6a1...", "anchorStatus": "anchored",
        "timestamp": "2026-01-20T14:00:00Z", "impactScore": 72, "verifications": 3,
    },
]


class CreateContributionRequest(BaseModel):
    type: str
    title: str
    description: Optional[str] = None
    field: Optional[str] = None
    authorName: str


@router.get("/contributions")
def list_contributions(type: Optional[str] = None, status: Optional[str] = None):
    result = _contributions
    if type:
        result = [c for c in result if c["type"] == type]
    if status:
        result = [c for c in result if c["anchorStatus"] == status]
    return {
        "contributions": result,
        "total": len(result),
        "stats": {
            "total": len(_contributions),
            "verified": len([c for c in _contributions if c["anchorStatus"] == "verified"]),
            "pending": len([c for c in _contributions if c["anchorStatus"] == "pending"]),
        },
    }


@router.post("/contributions", status_code=201)
def create_contribution(req: CreateContributionRequest):
    content = f"{req.title}:{req.description or ''}:{time.time()}"
    digest = hashlib.sha256(content.encode()).hexdigest()
    new = {
        "id": f"c-{len(_contributions)+1:03d}",
        **req.model_dump(),
        "hashDigest": digest,
        "anchorStatus": "pending",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "impactScore": 0,
        "verifications": 0,
    }
    _contributions.append(new)
    return new


@router.post("/contributions/{contrib_id}/verify")
def verify_contribution(contrib_id: str):
    for c in _contributions:
        if c["id"] == contrib_id:
            c["anchorStatus"] = "verified"
            c["verifications"] = c.get("verifications", 0) + 1
            return c
    raise HTTPException(status_code=404, detail="Contribution not found")


@router.get("/provenance/graph")
def provenance_graph():
    nodes = [{"id": c["id"], "label": c["title"], "type": c["type"]} for c in _contributions]
    edges = []
    return {"nodes": nodes, "edges": edges}


@router.get("/reviews")
def list_reviews():
    return {"reviews": [], "total": 0}


@router.get("/bounties")
def list_bounties(status: Optional[str] = None):
    return {"bounties": [], "total": 0}


@router.get("/reputation")
def get_reputation():
    return {
        "score": 847,
        "level": "Distinguished Contributor",
        "breakdown": {
            "publications": 320, "reviews": 180, "contributions": 200,
            "mentoring": 87, "community": 60,
        },
    }


@router.get("/events")
def list_events(type: Optional[str] = None, unread: Optional[str] = None):
    return {"events": [], "total": 0, "unread": 0}
