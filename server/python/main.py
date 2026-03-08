"""
SciConnect API — Python FastAPI Backend
Drop-in replacement for the Node.js Express server.

Run:  uvicorn main:app --reload --port 3001
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from routes.funding import router as funding_router
from routes.protocols import router as protocols_router
from routes.citations import router as citations_router
from routes.conferences import router as conferences_router
from routes.blockchain import router as blockchain_router

app = FastAPI(title="SciConnect API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(funding_router, prefix="/api/funding", tags=["Funding"])
app.include_router(protocols_router, prefix="/api/protocols", tags=["Protocols"])
app.include_router(citations_router, prefix="/api/citations", tags=["Citations"])
app.include_router(conferences_router, prefix="/api/conferences", tags=["Conferences"])
app.include_router(blockchain_router, prefix="/api/blockchain", tags=["Blockchain"])


@app.get("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0", "runtime": "python-fastapi", "timestamp": datetime.utcnow().isoformat()}
