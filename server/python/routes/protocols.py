"""Lab Notebook / Protocols — FastAPI equivalent of server/src/routes/labnotebook.ts"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

router = APIRouter()

_protocols = [
    {
        "id": "proto-001", "title": "CRISPR-Cas13 Off-Target Detection",
        "category": "experimental", "author": "Dr. Sofia Martínez",
        "version": "3.2", "status": "published", "visibility": "public",
        "description": "Protocol for detecting off-target effects of CRISPR-Cas13.",
        "tags": ["CRISPR", "Cas13", "off-target"], "forks": 12, "stars": 34,
        "steps": [
            {"order": 1, "title": "Cell Culture Prep", "content": "Maintain HEK293T cells in DMEM + 10% FBS."},
            {"order": 2, "title": "Guide RNA Design", "content": "Design 3 guides using CRISPRscan."},
        ],
    },
    {
        "id": "proto-002", "title": "Federated Learning Training Pipeline",
        "category": "computational", "author": "Prof. James Chen",
        "version": "2.0", "status": "published", "visibility": "team",
        "description": "End-to-end federated learning pipeline for multi-site MRI.",
        "tags": ["federated learning", "MRI", "privacy"], "forks": 8, "stars": 21,
        "steps": [
            {"order": 1, "title": "Data Preprocessing", "content": "Standardize MRI volumes to 1mm³."},
        ],
    },
]


class CreateProtocolRequest(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    category: str
    visibility: str = "private"
    description: Optional[str] = None
    tags: list[str] = []


@router.get("/")
def list_protocols(category: Optional[str] = None, status: Optional[str] = None):
    result = _protocols
    if category:
        result = [p for p in result if p["category"] == category]
    if status:
        result = [p for p in result if p["status"] == status]
    return {"protocols": result, "total": len(result)}


@router.get("/{protocol_id}")
def get_protocol(protocol_id: str):
    for p in _protocols:
        if p["id"] == protocol_id:
            return p
    raise HTTPException(status_code=404, detail="Protocol not found")


@router.post("/", status_code=201)
def create_protocol(req: CreateProtocolRequest):
    new = {
        "id": f"proto-{len(_protocols)+1:03d}",
        **req.model_dump(),
        "author": "Current User", "version": "1.0", "status": "draft",
        "forks": 0, "stars": 0, "steps": [],
    }
    _protocols.append(new)
    return new


@router.post("/{protocol_id}/fork")
def fork_protocol(protocol_id: str):
    for p in _protocols:
        if p["id"] == protocol_id:
            p["forks"] = p.get("forks", 0) + 1
            return {"success": True, "forks": p["forks"]}
    raise HTTPException(status_code=404, detail="Protocol not found")


@router.post("/{protocol_id}/star")
def star_protocol(protocol_id: str):
    for p in _protocols:
        if p["id"] == protocol_id:
            p["stars"] = p.get("stars", 0) + 1
            return {"success": True, "stars": p["stars"]}
    raise HTTPException(status_code=404, detail="Protocol not found")
