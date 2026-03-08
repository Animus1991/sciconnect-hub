"""Funding / Grants — FastAPI equivalent of server/src/routes/funding.ts"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

router = APIRouter()

# ─── Models ───
class BudgetAllocation(BaseModel):
    project_id: str
    project_title: str
    allocated: float
    spent: float = 0

class Milestone(BaseModel):
    id: str
    title: str
    due: str
    status: str = "upcoming"
    project_id: Optional[str] = None

class Grant(BaseModel):
    id: str
    title: str
    funder: str
    status: str
    amount: float
    currency: str
    spent: float = 0
    start_date: str = ""
    end_date: str = ""
    deadline: Optional[str] = None
    pi: str = ""
    co_pis: list[str] = []
    tags: list[str] = []
    description: str = ""
    milestones: list[Milestone] = []
    linked_projects: list[str] = []
    budget_allocations: list[BudgetAllocation] = []

class CreateGrantRequest(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    funder: str = Field(min_length=1, max_length=200)
    amount: float = Field(gt=0)
    currency: str = Field(pattern="^(USD|EUR|GBP|CHF|JPY)$")
    description: Optional[str] = None
    deadline: Optional[str] = None
    tags: list[str] = []
    linked_projects: list[str] = []

class LinkProjectRequest(BaseModel):
    project_id: str
    project_title: str = ""
    allocated: float = 0

# ─── In-memory store ───
_grants: list[dict] = [
    {
        "id": "g-001", "title": "Quantum Error Correction for Scalable Computing",
        "funder": "NSF", "status": "active", "amount": 450000, "currency": "USD", "spent": 187500,
        "start_date": "2025-09-01", "end_date": "2028-08-31",
        "pi": "Dr. Elena Vasquez", "co_pis": ["Prof. James Chen", "Dr. Yuki Tanaka"],
        "tags": ["quantum computing", "error correction"],
        "description": "Novel topological approaches to quantum error correction.",
        "milestones": [
            {"id": "m-001", "title": "Literature review", "due": "2025-12-31", "status": "done", "project_id": "proj-001"},
            {"id": "m-002", "title": "Prototype simulation", "due": "2026-06-30", "status": "in_progress", "project_id": "proj-001"},
        ],
        "linked_projects": ["proj-001"],
        "budget_allocations": [
            {"project_id": "proj-001", "project_title": "Surface Code Simulator", "allocated": 280000, "spent": 142000},
        ],
    },
    {
        "id": "g-002", "title": "Federated Learning for Medical Imaging",
        "funder": "NIH", "status": "active", "amount": 780000, "currency": "USD", "spent": 312000,
        "start_date": "2025-06-01", "end_date": "2028-05-31",
        "pi": "Prof. James Chen", "co_pis": ["Dr. Elena Vasquez"],
        "tags": ["federated learning", "medical imaging"],
        "description": "Multi-institutional federated learning framework.",
        "milestones": [
            {"id": "m-003", "title": "IRB approval", "due": "2025-12-31", "status": "done"},
            {"id": "m-004", "title": "Training infra", "due": "2026-06-30", "status": "in_progress"},
        ],
        "linked_projects": ["proj-003"],
        "budget_allocations": [
            {"project_id": "proj-003", "project_title": "FL Pipeline", "allocated": 500000, "spent": 230000},
        ],
    },
    {
        "id": "g-003", "title": "Arctic Permafrost Carbon Modeling",
        "funder": "ERC", "status": "pending", "amount": 1200000, "currency": "EUR", "spent": 0,
        "start_date": "2026-10-01", "end_date": "2031-09-30", "deadline": "2026-04-15",
        "pi": "Dr. Ingrid Nørgaard", "co_pis": [],
        "tags": ["climate", "permafrost"],
        "description": "Comprehensive Arctic carbon feedback modeling.",
        "milestones": [], "linked_projects": [], "budget_allocations": [],
    },
]


def _find_grant(grant_id: str) -> dict:
    for g in _grants:
        if g["id"] == grant_id:
            return g
    raise HTTPException(status_code=404, detail="Grant not found")


@router.get("/")
def list_grants():
    active = [g for g in _grants if g["status"] == "active"]
    return {
        "grants": _grants,
        "total": len(_grants),
        "stats": {
            "totalFunding": sum(g["amount"] for g in active),
            "totalSpent": sum(g["spent"] for g in active),
            "active": len(active),
            "pending": len([g for g in _grants if g["status"] == "pending"]),
            "upcomingDeadlines": len([g for g in _grants if g.get("deadline") and g["deadline"] > str(date.today())]),
        },
    }


@router.get("/stats/summary")
def stats_summary():
    active = [g for g in _grants if g["status"] == "active"]
    all_alloc = [a for g in _grants for a in g.get("budget_allocations", [])]
    return {
        "totalFunding": sum(g["amount"] for g in active),
        "totalSpent": sum(g["spent"] for g in active),
        "totalAllocated": sum(a["allocated"] for a in all_alloc),
        "active": len(active),
        "pending": len([g for g in _grants if g["status"] == "pending"]),
        "completed": len([g for g in _grants if g["status"] == "completed"]),
        "linkedProjects": len(set(p for g in _grants for p in g.get("linked_projects", []))),
    }


@router.get("/{grant_id}")
def get_grant(grant_id: str):
    return _find_grant(grant_id)


@router.post("/", status_code=201)
def create_grant(req: CreateGrantRequest):
    new = {
        "id": f"g-{len(_grants)+1:03d}",
        **req.model_dump(),
        "status": "draft", "spent": 0, "start_date": "", "end_date": "",
        "pi": "Current User", "co_pis": [],
        "milestones": [], "budget_allocations": [],
    }
    _grants.append(new)
    return new


@router.patch("/{grant_id}")
def update_grant(grant_id: str, body: dict):
    g = _find_grant(grant_id)
    g.update(body)
    return g


@router.post("/{grant_id}/link-project")
def link_project(grant_id: str, req: LinkProjectRequest):
    g = _find_grant(grant_id)
    if req.project_id not in g.get("linked_projects", []):
        g.setdefault("linked_projects", []).append(req.project_id)
    g.setdefault("budget_allocations", []).append({
        "project_id": req.project_id,
        "project_title": req.project_title or req.project_id,
        "allocated": req.allocated,
        "spent": 0,
    })
    return g


@router.delete("/{grant_id}/link-project/{project_id}")
def unlink_project(grant_id: str, project_id: str):
    g = _find_grant(grant_id)
    g["linked_projects"] = [p for p in g.get("linked_projects", []) if p != project_id]
    g["budget_allocations"] = [a for a in g.get("budget_allocations", []) if a["project_id"] != project_id]
    return g
