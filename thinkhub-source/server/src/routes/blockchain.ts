import { Router, Request, Response } from "express";

export const blockchainRouter = Router();

// ─── Contributions ───
const contributions = [
  { id: "c-001", type: "ideation", title: "Topological Quantum Error Correction via Surface Code Braiding", author: { name: "Dr. Elena Vasquez", initials: "EV", orcid: "0000-0002-1234-5678" }, timestamp: "2026-01-15T09:23:00Z", hashDigest: "a7f3b2c1d4e5f6789012345678abcdef01234567", anchorStatus: "verified", anchorTxId: "0xabc123...", impactScore: 92, verifications: 14, field: "Quantum Computing" },
  { id: "c-002", type: "peer_review", title: "Review: CRISPR-Cas13 Off-Target Effects in Mammalian Cells", author: { name: "Prof. James Chen", initials: "JC" }, timestamp: "2026-01-22T14:15:00Z", hashDigest: "b8e4c3d2a1f6e7890123456789bcdef012345678", anchorStatus: "verified", impactScore: 78, verifications: 8, field: "Molecular Biology" },
  { id: "c-003", type: "data_sharing", title: "Arctic Permafrost Temperature Dataset (2020-2025)", author: { name: "Dr. Ingrid Nørgaard", initials: "IN" }, timestamp: "2026-02-03T11:00:00Z", hashDigest: "c9d5e4f3b2a1c7890123456789cdef0123456789", anchorStatus: "anchored", impactScore: 85, verifications: 22, field: "Climate Science" },
  { id: "c-004", type: "mentorship", title: "Guided ML Pipeline Design for Protein Folding Prediction", author: { name: "Prof. Amir Khalil", initials: "AK" }, timestamp: "2026-02-10T08:30:00Z", hashDigest: "d0e6f5a4c3b2d8901234567890def01234567890", anchorStatus: "verified", impactScore: 71, verifications: 3, field: "Machine Learning" },
  { id: "c-005", type: "replication", title: "Successful Replication: Room-Temperature Superconductivity Claim (LK-99)", author: { name: "Dr. Sofia Martínez", initials: "SM" }, timestamp: "2026-02-18T16:45:00Z", hashDigest: "e1f7a6b5d4c3e9012345678901ef012345678901", anchorStatus: "verified", impactScore: 95, verifications: 31, field: "Materials Science" },
  { id: "c-006", type: "feedback", title: "Methodological Critique: Bayesian Priors in fMRI Analysis", author: { name: "Dr. Yuki Tanaka", initials: "YT" }, timestamp: "2026-02-25T10:20:00Z", hashDigest: "f2a8b7c6e5d4f0123456789012fa0123456789ab", anchorStatus: "pending", impactScore: 63, verifications: 5, field: "Neuroscience" },
  { id: "c-007", type: "curation", title: "Systematic Review: Federated Learning in Healthcare (2020-2026)", author: { name: "Dr. Elena Vasquez", initials: "EV" }, timestamp: "2026-03-01T13:00:00Z", hashDigest: "a3b9c8d7f6e5a1234567890123ab01234567890bc", anchorStatus: "anchored", impactScore: 88, verifications: 17, field: "Healthcare AI" },
  { id: "c-008", type: "methodology", title: "Novel Statistical Framework for Multi-Omics Data Integration", author: { name: "Prof. James Chen", initials: "JC" }, timestamp: "2026-03-05T09:00:00Z", hashDigest: "b4ca9d8e7f6b2345678901234bc12345678901cd", anchorStatus: "pending", impactScore: 76, verifications: 2, field: "Bioinformatics" },
];

// GET /api/blockchain/contributions
blockchainRouter.get("/contributions", (req: Request, res: Response) => {
  const { type, status, field } = req.query;
  let result = [...contributions];
  if (type && typeof type === "string") result = result.filter(c => c.type === type);
  if (status && typeof status === "string") result = result.filter(c => c.anchorStatus === status);
  if (field && typeof field === "string") result = result.filter(c => c.field.toLowerCase().includes(field.toString().toLowerCase()));
  result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  res.json({
    contributions: result,
    total: result.length,
    stats: {
      verified: contributions.filter(c => c.anchorStatus === "verified").length,
      pending: contributions.filter(c => c.anchorStatus === "pending").length,
      anchored: contributions.filter(c => c.anchorStatus === "anchored").length,
      avgImpact: Math.round(contributions.reduce((s, c) => s + c.impactScore, 0) / contributions.length),
    },
  });
});

// GET /api/blockchain/contributions/:id
blockchainRouter.get("/contributions/:id", (req: Request, res: Response) => {
  const c = contributions.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: "Contribution not found" });
  res.json(c);
});

// POST /api/blockchain/contributions — create new contribution with SHA-256 hash
blockchainRouter.post("/contributions", async (req: Request, res: Response) => {
  try {
    const { type, title, description, field, authorName, authorInitials, linkedTo } = req.body;
    if (!type || !title || !authorName) {
      return res.status(400).json({ error: "type, title, and authorName are required" });
    }

    const timestamp = new Date().toISOString();
    const payload = JSON.stringify({ type, title, description, authorName, timestamp });
    
    // Generate SHA-256 hash
    const { createHash } = await import("crypto");
    const hashDigest = createHash("sha256").update(payload).digest("hex");

    const newId = `c-${String(contributions.length + 1).padStart(3, "0")}`;
    const newContribution = {
      id: newId,
      type,
      title,
      author: { name: authorName, initials: authorInitials || authorName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() },
      timestamp,
      hashDigest,
      anchorStatus: "pending" as const,
      anchorTxId: null as string | null,
      impactScore: 0,
      verifications: 0,
      field: field || "General",
      description: description || "",
      linkedTo: linkedTo || [],
    };

    contributions.push(newContribution as any);

    // Simulate timestamp anchoring (async, marks as anchored after "delay")
    setTimeout(() => {
      const c = contributions.find(x => x.id === newId);
      if (c) {
        (c as any).anchorStatus = "anchored";
        (c as any).anchorTxId = `0x${hashDigest.slice(0, 16)}...`;
      }
    }, 3000);

    res.status(201).json({
      contribution: newContribution,
      anchoring: { status: "pending", message: "SHA-256 hash generated. Timestamp anchoring in progress (~3s simulation)." },
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to create contribution", message: err.message });
  }
});

// POST /api/blockchain/contributions/:id/verify — simulate hash verification
blockchainRouter.post("/contributions/:id/verify", (req: Request, res: Response) => {
  const c = contributions.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: "Contribution not found" });
  res.json({ verified: true, hashDigest: c.hashDigest, anchorStatus: c.anchorStatus, timestamp: c.timestamp });
});
  const c = contributions.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: "Contribution not found" });
  // Simulate verification
  res.json({ verified: true, hashDigest: c.hashDigest, anchorStatus: c.anchorStatus, timestamp: c.timestamp });
});

// ─── Provenance ───
const provenanceNodes = [
  { id: "pn-001", type: "idea", title: "Topological protection for quantum gates", author: { name: "Dr. Elena Vasquez", initials: "EV" }, timestamp: "2025-03-10", field: "Quantum Computing" },
  { id: "pn-002", type: "hypothesis", title: "Surface code braiding reduces overhead by 40%", author: { name: "Dr. Elena Vasquez", initials: "EV" }, timestamp: "2025-05-22", field: "Quantum Computing" },
  { id: "pn-003", type: "experiment", title: "Simulated braiding on 127-qubit lattice", author: { name: "Prof. James Chen", initials: "JC" }, timestamp: "2025-08-14", field: "Quantum Computing" },
  { id: "pn-004", type: "dataset", title: "Braiding simulation results (10^6 shots)", author: { name: "Prof. James Chen", initials: "JC" }, timestamp: "2025-09-02", field: "Quantum Computing" },
  { id: "pn-005", type: "review", title: "Review of braiding overhead claims", author: { name: "Dr. Sofia Martínez", initials: "SM" }, timestamp: "2025-10-15", field: "Quantum Computing" },
  { id: "pn-006", type: "paper", title: "Topological Quantum Error Correction via Surface Code Braiding", author: { name: "Dr. Elena Vasquez", initials: "EV" }, timestamp: "2026-01-15", field: "Quantum Computing" },
  { id: "pn-007", type: "replication", title: "Independent replication on Quantinuum H2", author: { name: "Dr. Yuki Tanaka", initials: "YT" }, timestamp: "2026-02-28", field: "Quantum Computing" },
  { id: "pn-008", type: "idea", title: "Extension to color codes for higher-distance protection", author: { name: "Dr. Ingrid Nørgaard", initials: "IN" }, timestamp: "2026-03-05", field: "Quantum Computing" },
];

const provenanceEdges = [
  { source: "pn-001", target: "pn-002", relationship: "refined" },
  { source: "pn-002", target: "pn-003", relationship: "inspired" },
  { source: "pn-003", target: "pn-004", relationship: "extended" },
  { source: "pn-004", target: "pn-006", relationship: "cited" },
  { source: "pn-005", target: "pn-006", relationship: "refined" },
  { source: "pn-006", target: "pn-007", relationship: "replicated" },
  { source: "pn-006", target: "pn-008", relationship: "inspired" },
  { source: "pn-002", target: "pn-005", relationship: "challenged" },
];

blockchainRouter.get("/provenance/nodes", (_req: Request, res: Response) => {
  res.json({ nodes: provenanceNodes, total: provenanceNodes.length });
});

blockchainRouter.get("/provenance/edges", (_req: Request, res: Response) => {
  res.json({ edges: provenanceEdges, total: provenanceEdges.length });
});

blockchainRouter.get("/provenance/graph", (_req: Request, res: Response) => {
  res.json({ nodes: provenanceNodes, edges: provenanceEdges });
});

// ─── Blind Reviews ───
const blindReviews = [
  { id: "br-001", manuscriptId: "MS-2026-0412", manuscriptTitle: "Scalable Federated Learning for Multi-Institutional Medical Imaging", journal: "Nature Machine Intelligence", field: "Machine Learning", phase: "blind", sealedIdentityHash: "sealed_abc123def456", submittedDate: "2026-02-20", qualityScore: 4, recommendation: "minor_revisions", creditClaimed: false },
  { id: "br-002", manuscriptId: "MS-2026-0389", manuscriptTitle: "Epigenetic Memory in Plant Stress Responses", journal: "Science", field: "Plant Biology", phase: "revealed", sealedIdentityHash: "sealed_def789abc012", reviewerName: "Dr. Elena Vasquez", submittedDate: "2026-01-15", revealDate: "2026-03-01", qualityScore: 5, recommendation: "accept", creditClaimed: true },
  { id: "br-003", manuscriptId: "MS-2026-0401", manuscriptTitle: "Topological Quantum Error Correction with Fibonacci Anyons", journal: "Physical Review Letters", field: "Quantum Physics", phase: "sealed", sealedIdentityHash: "sealed_ghi345jkl678", submittedDate: "2026-03-02", qualityScore: 3, recommendation: "major_revisions", creditClaimed: false },
];

blockchainRouter.get("/reviews", (_req: Request, res: Response) => {
  res.json({ reviews: blindReviews, total: blindReviews.length });
});

blockchainRouter.patch("/reviews/:id/reveal", (req: Request, res: Response) => {
  const review = blindReviews.find(r => r.id === req.params.id);
  if (!review) return res.status(404).json({ error: "Review not found" });
  if (review.phase !== "sealed") return res.status(400).json({ error: "Review is not in sealed phase" });
  review.phase = "revealed";
  (review as any).revealDate = new Date().toISOString().split("T")[0];
  review.creditClaimed = true;
  res.json({ success: true, review });
});

// ─── Bounties ───
const bounties = [
  { id: "bounty-001", title: "Replicate: Room-Temperature Superconductor (Modified LK-99)", author: { name: "Prof. Hyun-Tak Kim", initials: "HK" }, field: "Materials Science", rewardTokens: 500, status: "open", attempts: 12, successfulReplications: 0, deadline: "2026-06-30" },
  { id: "bounty-002", title: "Replicate: GPT-4 Emergent Reasoning on ARC-AGI Benchmark", author: { name: "Dr. François Chollet", initials: "FC" }, field: "AI / Machine Learning", rewardTokens: 300, status: "in_progress", attempts: 8, successfulReplications: 3, deadline: "2026-04-15" },
  { id: "bounty-003", title: "Replicate: CRISPR-Cas13 Off-Target Rates in Human Cells", author: { name: "Dr. Feng Zhang", initials: "FZ" }, field: "Molecular Biology", rewardTokens: 750, status: "completed", attempts: 5, successfulReplications: 4, deadline: "2026-02-28" },
  { id: "bounty-004", title: "Replicate: Novel Catalyst for CO₂-to-Ethanol Conversion", author: { name: "Prof. Maria García", initials: "MG" }, field: "Green Chemistry", rewardTokens: 400, status: "disputed", attempts: 6, successfulReplications: 1, deadline: "2026-05-15" },
];

blockchainRouter.get("/bounties", (req: Request, res: Response) => {
  const { status } = req.query;
  let result = [...bounties];
  if (status && typeof status === "string") result = result.filter(b => b.status === status);
  res.json({ bounties: result, total: result.length });
});

blockchainRouter.post("/bounties/:id/attempt", (req: Request, res: Response) => {
  const bounty = bounties.find(b => b.id === req.params.id);
  if (!bounty) return res.status(404).json({ error: "Bounty not found" });
  if (bounty.status !== "open" && bounty.status !== "in_progress") return res.status(400).json({ error: "Bounty not accepting attempts" });
  bounty.attempts += 1;
  bounty.status = "in_progress";
  res.json({ success: true, bounty });
});

// ─── Reputation ───
const reputation = {
  userId: "user-001",
  name: "Dr. Elena Vasquez",
  initials: "EV",
  institution: "MIT — Dept. of Physics",
  dimensions: { originality: 88, rigor: 92, generosity: 75, reproducibility: 83, mentorship: 68, collaboration: 90 },
  overallScore: 84,
  hIndex: 23,
  totalContributions: 147,
  sbtTokens: [
    { name: "Pioneer Thinker", earnedDate: "2025-06-15", description: "First to propose 3+ adopted hypotheses", rarity: "legendary" },
    { name: "Rigorous Reviewer", earnedDate: "2025-09-20", description: "Completed 50+ high-quality peer reviews", rarity: "rare" },
    { name: "Open Data Champion", earnedDate: "2026-01-10", description: "Shared 10+ verified datasets", rarity: "rare" },
    { name: "Replication Hero", earnedDate: "2026-02-28", description: "Successfully replicated 5+ experiments", rarity: "common" },
    { name: "Mentor Excellence", earnedDate: "2025-12-01", description: "Verified mentorship of 3+ researchers", rarity: "common" },
  ],
  history: [
    { month: "Apr '25", score: 72 }, { month: "May '25", score: 74 }, { month: "Jun '25", score: 76 },
    { month: "Jul '25", score: 78 }, { month: "Aug '25", score: 79 }, { month: "Sep '25", score: 80 },
    { month: "Oct '25", score: 81 }, { month: "Nov '25", score: 82 }, { month: "Dec '25", score: 82 },
    { month: "Jan '26", score: 83 }, { month: "Feb '26", score: 84 }, { month: "Mar '26", score: 84 },
  ],
};

blockchainRouter.get("/reputation", (_req: Request, res: Response) => {
  res.json(reputation);
});

blockchainRouter.get("/reputation/peers", (_req: Request, res: Response) => {
  res.json({
    peers: [
      { name: "Prof. James Chen", initials: "JC", institution: "Stanford University", dimensions: { originality: 82, rigor: 95, generosity: 88, reproducibility: 90, mentorship: 85, collaboration: 78 }, overallScore: 86 },
      { name: "Dr. Ingrid Nørgaard", initials: "IN", institution: "University of Copenhagen", dimensions: { originality: 78, rigor: 85, generosity: 92, reproducibility: 88, mentorship: 90, collaboration: 85 }, overallScore: 86 },
      { name: "Dr. Sofia Martínez", initials: "SM", institution: "ETH Zürich", dimensions: { originality: 91, rigor: 88, generosity: 70, reproducibility: 95, mentorship: 60, collaboration: 82 }, overallScore: 81 },
    ],
  });
});

// ─── Blockchain Events (for notifications) ───
const blockchainEvents = [
  { id: "evt-001", type: "contribution_verified", title: "Contribution verified on-chain", message: "Your ideation 'Topological Quantum Error Correction' has been verified on Ethereum", timestamp: "2026-03-07T10:00:00Z", read: false },
  { id: "evt-002", type: "bounty_posted", title: "New reproducibility bounty", message: "A new bounty for replicating LK-99 superconductor claims has been posted (500 tokens)", timestamp: "2026-03-06T14:00:00Z", read: false },
  { id: "evt-003", type: "identity_revealed", title: "Reviewer identity revealed", message: "Dr. Elena Vasquez revealed their identity for review of 'Epigenetic Memory in Plant Stress Responses'", timestamp: "2026-03-05T09:00:00Z", read: true },
  { id: "evt-004", type: "sbt_earned", title: "Soulbound Token earned", message: "You earned the 'Replication Hero' SBT for successfully replicating 5+ experiments", timestamp: "2026-03-04T16:00:00Z", read: false },
  { id: "evt-005", type: "contribution_verified", title: "Peer review anchored", message: "Your peer review of CRISPR-Cas13 has been anchored to the blockchain", timestamp: "2026-03-03T11:00:00Z", read: true },
  { id: "evt-006", type: "bounty_posted", title: "Bounty completed", message: "The CRISPR-Cas13 replication bounty has been completed with 4 successful replications", timestamp: "2026-03-02T08:00:00Z", read: true },
];

blockchainRouter.get("/events", (req: Request, res: Response) => {
  const { type, unread } = req.query;
  let result = [...blockchainEvents];
  if (type && typeof type === "string") result = result.filter(e => e.type === type);
  if (unread === "true") result = result.filter(e => !e.read);
  result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  res.json({ events: result, total: result.length, unread: result.filter(e => !e.read).length });
});

blockchainRouter.patch("/events/:id/read", (req: Request, res: Response) => {
  const evt = blockchainEvents.find(e => e.id === req.params.id);
  if (!evt) return res.status(404).json({ error: "Event not found" });
  evt.read = true;
  res.json(evt);
});

// ─── Document Verification (Publications, Lab Notebook, Wiki, Citations) ───
blockchainRouter.post("/verify-document", async (req: Request, res: Response) => {
  try {
    const { documentType, documentId, title, content, author } = req.body;
    if (!documentType || !documentId || !title) {
      return res.status(400).json({ error: "documentType, documentId, and title are required" });
    }
    const crypto = await import("crypto");
    const payload = `${documentType}:${documentId}:${title}:${content || ""}:${Date.now()}`;
    const hash = crypto.createHash("sha256").update(payload).digest("hex");
    res.status(201).json({
      documentType,
      documentId,
      title,
      hashDigest: hash,
      anchorStatus: "pending",
      anchoredAt: new Date().toISOString(),
      txId: `0x${hash.slice(0, 40)}`,
      author: author || "Unknown",
    });
  } catch (err) {
    res.status(500).json({ error: "Hashing failed" });
  }
});

// ─── Credential Verification (Profile, Conferences) ───
blockchainRouter.post("/verify-credential", async (req: Request, res: Response) => {
  try {
    const { credentialType, holder, institution, details } = req.body;
    if (!credentialType || !holder) {
      return res.status(400).json({ error: "credentialType and holder are required" });
    }
    const crypto = await import("crypto");
    const payload = `credential:${credentialType}:${holder}:${institution || ""}:${details || ""}:${Date.now()}`;
    const hash = crypto.createHash("sha256").update(payload).digest("hex");
    res.status(201).json({
      credentialType,
      holder,
      institution,
      hashDigest: hash,
      anchorStatus: "anchored",
      verifiedAt: new Date().toISOString(),
      sbtEligible: true,
    });
  } catch (err) {
    res.status(500).json({ error: "Credential verification failed" });
  }
});

// ─── Collaboration Audit Trail ───
const auditTrail = [
  { id: "audit-001", action: "document_created", workspace: "Quantum Error Correction", actor: "Dr. Elena Vasquez", timestamp: "2026-03-07T10:00:00Z", hash: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2", status: "verified" },
  { id: "audit-002", action: "section_edited", workspace: "Quantum Error Correction", actor: "Prof. James Chen", timestamp: "2026-03-07T08:30:00Z", hash: "b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3", status: "verified" },
  { id: "audit-003", action: "file_uploaded", workspace: "CRISPR Study", actor: "Dr. Sofia Martínez", timestamp: "2026-03-06T14:00:00Z", hash: "c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4", status: "anchored" },
  { id: "audit-004", action: "permission_changed", workspace: "Federated Learning", actor: "Prof. James Chen", timestamp: "2026-03-05T09:00:00Z", hash: "d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5", status: "verified" },
];

blockchainRouter.get("/audit-trail", (req: Request, res: Response) => {
  const { workspace } = req.query;
  let result = [...auditTrail];
  if (workspace && typeof workspace === "string") {
    result = result.filter(a => a.workspace.toLowerCase().includes(workspace.toLowerCase()));
  }
  res.json({ entries: result, total: result.length });
});

// ─── Smart Contract Milestones (Funding) ───
blockchainRouter.get("/milestones/:grantId", (req: Request, res: Response) => {
  const milestones = [
    { id: "sm-001", grantId: req.params.grantId, title: "Literature Review", status: "claimed", amount: "50,000 USD", hash: "e5f6a7b8c9d0e1f2", claimedAt: "2025-12-31" },
    { id: "sm-002", grantId: req.params.grantId, title: "Prototype Framework", status: "unlocked", amount: "100,000 USD", hash: "f6a7b8c9d0e1f2a3", unlockedAt: "2026-06-30" },
    { id: "sm-003", grantId: req.params.grantId, title: "Experimental Validation", status: "locked", amount: "150,000 USD", hash: "a7b8c9d0e1f2a3b4" },
  ];
  res.json({ milestones, grantId: req.params.grantId });
});
