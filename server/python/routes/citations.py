"""Citation Manager — FastAPI equivalent of server/src/routes/citations.ts"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

router = APIRouter()

_citations = [
    {
        "id": "cit-001",
        "title": "Suppressing quantum errors by scaling a surface code logical qubit",
        "authors": ["Google Quantum AI", "Acharya, R."],
        "journal": "Nature", "year": 2023, "doi": "10.1038/s41586-022-05434-1",
        "type": "article", "tags": ["quantum computing", "error correction"],
        "collections": ["col-1"], "starred": True, "citedBy": 1247,
    },
    {
        "id": "cit-002",
        "title": "Communication-Efficient Learning of Deep Networks",
        "authors": ["McMahan, B.", "Moore, E."],
        "journal": "AISTATS", "year": 2017, "doi": "10.48550/arXiv.1602.05629",
        "type": "conference", "tags": ["federated learning", "deep learning"],
        "collections": ["col-2"], "starred": True, "citedBy": 8934,
    },
]

_collections = [
    {"id": "col-1", "name": "Quantum Error Correction", "color": "violet", "count": 24},
    {"id": "col-2", "name": "Federated Learning", "color": "blue", "count": 18},
    {"id": "col-3", "name": "CRISPR Therapeutics", "color": "emerald", "count": 31},
]


class CreateCitationRequest(BaseModel):
    title: str
    authors: list[str]
    journal: str
    year: int
    doi: Optional[str] = None
    type: str = "article"
    tags: list[str] = []
    collections: list[str] = []


class ImportBibtexRequest(BaseModel):
    bibtex: str


class ImportDoiRequest(BaseModel):
    dois: list[str]


class ExportRequest(BaseModel):
    ids: Optional[list[str]] = None


@router.get("/")
def list_citations(collection: Optional[str] = None, type: Optional[str] = None, q: Optional[str] = None):
    result = _citations
    if collection:
        result = [c for c in result if collection in c.get("collections", [])]
    if type:
        result = [c for c in result if c["type"] == type]
    if q:
        q_lower = q.lower()
        result = [c for c in result if q_lower in c["title"].lower() or any(q_lower in a.lower() for a in c["authors"])]
    return {"citations": result, "total": len(result)}


@router.get("/collections")
def get_collections():
    return {"collections": _collections}


@router.post("/", status_code=201)
def create_citation(req: CreateCitationRequest):
    new = {"id": f"cit-{len(_citations)+1:03d}", **req.model_dump(), "starred": False, "citedBy": 0}
    _citations.append(new)
    return new


@router.post("/import/bibtex")
def import_bibtex(req: ImportBibtexRequest):
    count = req.bibtex.count("@")
    return {"imported": count}


@router.post("/import/doi")
def import_dois(req: ImportDoiRequest):
    return {"resolved": len(req.dois)}


@router.patch("/{citation_id}/star")
def toggle_star(citation_id: str):
    for c in _citations:
        if c["id"] == citation_id:
            c["starred"] = not c.get("starred", False)
            return {"starred": c["starred"]}
    raise HTTPException(status_code=404, detail="Citation not found")


@router.post("/export/bibtex")
def export_bibtex(req: ExportRequest):
    targets = _citations if not req.ids else [c for c in _citations if c["id"] in req.ids]
    bibtex = "\n".join(f"@article{{{c['id']}, title={{{c['title']}}}}}" for c in targets)
    return {"bibtex": bibtex, "count": len(targets)}
