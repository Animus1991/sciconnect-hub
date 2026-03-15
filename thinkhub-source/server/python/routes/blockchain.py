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


# ─── Document Verification ───
class VerifyDocumentRequest(BaseModel):
    documentType: str
    documentId: str
    title: str
    content: Optional[str] = None
    author: Optional[str] = None


@router.post("/verify-document", status_code=201)
def verify_document(req: VerifyDocumentRequest):
    payload = f"{req.documentType}:{req.documentId}:{req.title}:{req.content or ''}:{time.time()}"
    digest = hashlib.sha256(payload.encode()).hexdigest()
    return {
        "documentType": req.documentType,
        "documentId": req.documentId,
        "title": req.title,
        "hashDigest": digest,
        "anchorStatus": "pending",
        "anchoredAt": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "txId": f"0x{digest[:40]}",
        "author": req.author or "Unknown",
    }


# ─── Credential Verification ───
class VerifyCredentialRequest(BaseModel):
    credentialType: str
    holder: str
    institution: Optional[str] = None
    details: Optional[str] = None


@router.post("/verify-credential", status_code=201)
def verify_credential(req: VerifyCredentialRequest):
    payload = f"credential:{req.credentialType}:{req.holder}:{req.institution or ''}:{req.details or ''}:{time.time()}"
    digest = hashlib.sha256(payload.encode()).hexdigest()
    return {
        "credentialType": req.credentialType,
        "holder": req.holder,
        "institution": req.institution,
        "hashDigest": digest,
        "anchorStatus": "anchored",
        "verifiedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "sbtEligible": True,
    }


# ─── Collaboration Audit Trail ───
@router.get("/audit-trail")
def get_audit_trail(workspace: Optional[str] = None):
    entries = [
        {"id": "audit-001", "action": "document_created", "workspace": "Quantum Error Correction", "actor": "Dr. Elena Vasquez", "timestamp": "2026-03-07T10:00:00Z", "hash": "a1b2c3d4e5f6a7b8", "status": "verified"},
        {"id": "audit-002", "action": "section_edited", "workspace": "Quantum Error Correction", "actor": "Prof. James Chen", "timestamp": "2026-03-07T08:30:00Z", "hash": "b2c3d4e5f6a7b8c9", "status": "verified"},
        {"id": "audit-003", "action": "file_uploaded", "workspace": "CRISPR Study", "actor": "Dr. Sofia Martínez", "timestamp": "2026-03-06T14:00:00Z", "hash": "c3d4e5f6a7b8c9d0", "status": "anchored"},
    ]
    if workspace:
        entries = [e for e in entries if workspace.lower() in e["workspace"].lower()]
    return {"entries": entries, "total": len(entries)}


# ─── Smart Contract Milestones ───
@router.get("/milestones/{grant_id}")
def get_milestones(grant_id: str):
    milestones = [
        {"id": "sm-001", "grantId": grant_id, "title": "Literature Review", "status": "claimed", "amount": "50,000 USD", "hash": "e5f6a7b8c9d0e1f2"},
        {"id": "sm-002", "grantId": grant_id, "title": "Prototype Framework", "status": "unlocked", "amount": "100,000 USD", "hash": "f6a7b8c9d0e1f2a3"},
        {"id": "sm-003", "grantId": grant_id, "title": "Experimental Validation", "status": "locked", "amount": "150,000 USD", "hash": "a7b8c9d0e1f2a3b4"},
    ]
    return {"milestones": milestones, "grantId": grant_id}
