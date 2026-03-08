/**
 * Mock data for blockchain Proof-of-Contribution features
 * Provides realistic scientific contribution, peer review, reputation, and provenance data
 */

// ─── Contribution Types ───
export type ContributionType = 
  | "ideation" | "peer_review" | "data_sharing" | "mentorship" 
  | "replication" | "feedback" | "curation" | "methodology";

export interface Contribution {
  id: string;
  type: ContributionType;
  title: string;
  description: string;
  author: { name: string; initials: string; orcid?: string };
  timestamp: string;
  hashDigest: string;
  anchorStatus: "pending" | "anchored" | "verified";
  anchorTxId?: string;
  linkedTo?: string[];  // IDs of related contributions
  impactScore: number;  // 0-100
  verifications: number;
  field: string;
}

export interface BlindReview {
  id: string;
  manuscriptId: string;
  manuscriptTitle: string;
  journal: string;
  field: string;
  phase: "blind" | "revealed" | "sealed";
  sealedIdentityHash: string;
  reviewerName?: string;  // only when revealed
  reviewerInitials?: string;
  submittedDate: string;
  revealDate?: string;
  qualityScore: number;  // 1-5
  recommendation: "accept" | "minor_revisions" | "major_revisions" | "reject";
  sections: {
    summary: string;
    majorComments: string[];
    minorComments: string[];
  };
  creditClaimed: boolean;
  hashProof: string;
}

export interface ReproducibilityBounty {
  id: string;
  title: string;
  author: { name: string; initials: string };
  field: string;
  rewardTokens: number;
  status: "open" | "in_progress" | "completed" | "disputed";
  attempts: number;
  successfulReplications: number;
  deadline: string;
  description: string;
}

export interface ReputationScore {
  userId: string;
  name: string;
  initials: string;
  institution: string;
  dimensions: {
    originality: number;    // 0-100
    rigor: number;          // 0-100
    generosity: number;     // 0-100
    reproducibility: number;// 0-100
    mentorship: number;     // 0-100
    collaboration: number;  // 0-100
  };
  overallScore: number;
  hIndex: number;
  totalContributions: number;
  sbtTokens: { name: string; earnedDate: string; description: string; rarity: "common" | "rare" | "legendary" }[];
  history: { month: string; score: number }[];
}

export interface ProvenanceNode {
  id: string;
  type: "idea" | "hypothesis" | "experiment" | "paper" | "dataset" | "review" | "replication";
  title: string;
  author: { name: string; initials: string };
  timestamp: string;
  hashDigest: string;
  description: string;
  field: string;
}

export interface ProvenanceEdge {
  source: string;
  target: string;
  relationship: "inspired" | "extended" | "replicated" | "cited" | "challenged" | "refined";
}

// ─── Mock Contributions ───
export const mockContributions: Contribution[] = [
  {
    id: "c-001",
    type: "ideation",
    title: "Topological Quantum Error Correction via Surface Code Braiding",
    description: "First formulation of hybrid surface-code braiding approach for fault-tolerant quantum computation with reduced qubit overhead.",
    author: { name: "Dr. Elena Vasquez", initials: "EV", orcid: "0000-0002-1234-5678" },
    timestamp: "2026-01-15T09:23:00Z",
    hashDigest: "a7f3b2c1d4e5f6789012345678abcdef01234567",
    anchorStatus: "verified",
    anchorTxId: "0xabc123def456789012345678abcdef0123456789abcdef0123456789abcdef01",
    impactScore: 92,
    verifications: 14,
    field: "Quantum Computing",
  },
  {
    id: "c-002",
    type: "peer_review",
    title: "Review: CRISPR-Cas13 Off-Target Effects in Mammalian Cells",
    description: "Comprehensive blind review identifying critical methodological gaps in off-target analysis. Led to revised experimental protocol.",
    author: { name: "Prof. James Chen", initials: "JC", orcid: "0000-0003-9876-5432" },
    timestamp: "2026-01-22T14:15:00Z",
    hashDigest: "b8e4c3d2a1f6e7890123456789bcdef012345678",
    anchorStatus: "verified",
    anchorTxId: "0xdef456abc789012345678901abcdef2345678901abcdef2345678901abcdef02",
    linkedTo: ["c-001"],
    impactScore: 78,
    verifications: 8,
    field: "Molecular Biology",
  },
  {
    id: "c-003",
    type: "data_sharing",
    title: "Arctic Permafrost Temperature Dataset (2020-2025)",
    description: "Shared 5-year longitudinal dataset of subsurface permafrost temperatures across 47 Arctic monitoring stations.",
    author: { name: "Dr. Ingrid Nørgaard", initials: "IN" },
    timestamp: "2026-02-03T11:00:00Z",
    hashDigest: "c9d5e4f3b2a1c7890123456789cdef0123456789",
    anchorStatus: "anchored",
    impactScore: 85,
    verifications: 22,
    field: "Climate Science",
  },
  {
    id: "c-004",
    type: "mentorship",
    title: "Guided ML Pipeline Design for Protein Folding Prediction",
    description: "6-month mentorship for PhD candidate on applying transformer architectures to protein structure prediction. Confirmed by mentee.",
    author: { name: "Prof. Amir Khalil", initials: "AK" },
    timestamp: "2026-02-10T08:30:00Z",
    hashDigest: "d0e6f5a4c3b2d8901234567890def01234567890",
    anchorStatus: "verified",
    linkedTo: ["c-003"],
    impactScore: 71,
    verifications: 3,
    field: "Machine Learning",
  },
  {
    id: "c-005",
    type: "replication",
    title: "Successful Replication: Room-Temperature Superconductivity Claim (LK-99)",
    description: "Independent replication attempt with detailed protocol documentation. Results did NOT confirm original claims — published negative result.",
    author: { name: "Dr. Sofia Martínez", initials: "SM" },
    timestamp: "2026-02-18T16:45:00Z",
    hashDigest: "e1f7a6b5d4c3e9012345678901ef012345678901",
    anchorStatus: "verified",
    anchorTxId: "0x789abc012def345678901234abcdef5678901234abcdef5678901234abcdef03",
    impactScore: 95,
    verifications: 31,
    field: "Materials Science",
  },
  {
    id: "c-006",
    type: "feedback",
    title: "Methodological Critique: Bayesian Priors in fMRI Analysis",
    description: "Detailed feedback on improper prior selection in resting-state fMRI study. Suggested hierarchical Bayesian approach that was adopted.",
    author: { name: "Dr. Yuki Tanaka", initials: "YT" },
    timestamp: "2026-02-25T10:20:00Z",
    hashDigest: "f2a8b7c6e5d4f0123456789012fa0123456789ab",
    anchorStatus: "pending",
    linkedTo: ["c-002", "c-004"],
    impactScore: 63,
    verifications: 5,
    field: "Neuroscience",
  },
  {
    id: "c-007",
    type: "curation",
    title: "Systematic Review: Federated Learning in Healthcare (2020-2026)",
    description: "Comprehensive literature review synthesizing 312 papers on FL applications in clinical settings. Identified 7 key research gaps.",
    author: { name: "Dr. Elena Vasquez", initials: "EV", orcid: "0000-0002-1234-5678" },
    timestamp: "2026-03-01T13:00:00Z",
    hashDigest: "a3b9c8d7f6e5a1234567890123ab01234567890bc",
    anchorStatus: "anchored",
    impactScore: 88,
    verifications: 17,
    field: "Healthcare AI",
  },
  {
    id: "c-008",
    type: "methodology",
    title: "Novel Statistical Framework for Multi-Omics Data Integration",
    description: "Proposed a non-parametric kernel method for integrating transcriptomic, proteomic, and metabolomic datasets with missing values.",
    author: { name: "Prof. James Chen", initials: "JC", orcid: "0000-0003-9876-5432" },
    timestamp: "2026-03-05T09:00:00Z",
    hashDigest: "b4ca9d8e7f6b2345678901234bc12345678901cd",
    anchorStatus: "pending",
    linkedTo: ["c-003", "c-007"],
    impactScore: 76,
    verifications: 2,
    field: "Bioinformatics",
  },
];

// ─── Mock Blind Reviews ───
export const mockBlindReviews: BlindReview[] = [
  {
    id: "br-001",
    manuscriptId: "MS-2026-0412",
    manuscriptTitle: "Scalable Federated Learning for Multi-Institutional Medical Imaging",
    journal: "Nature Machine Intelligence",
    field: "Machine Learning",
    phase: "blind",
    sealedIdentityHash: "sealed_abc123def456",
    submittedDate: "2026-02-20",
    qualityScore: 4,
    recommendation: "minor_revisions",
    sections: {
      summary: "This paper presents a federated learning framework for medical imaging that addresses data heterogeneity across institutions. The approach is novel and well-motivated.",
      majorComments: [
        "The convergence analysis in Section 4.2 assumes IID data distribution, which contradicts the non-IID nature of clinical data. Please reconcile.",
        "Missing comparison with SCAFFOLD and FedProx baselines — these are essential for the claimed SOTA results."
      ],
      minorComments: [
        "Table 3 has inconsistent decimal places",
        "Reference [23] appears to be a preprint — please cite the published version",
        "Figure 5 legend is cut off in the PDF"
      ],
    },
    creditClaimed: false,
    hashProof: "proof_sha256_a1b2c3d4e5f6",
  },
  {
    id: "br-002",
    manuscriptId: "MS-2026-0389",
    manuscriptTitle: "Epigenetic Memory in Plant Stress Responses: A Multi-Generational Study",
    journal: "Science",
    field: "Plant Biology",
    phase: "revealed",
    sealedIdentityHash: "sealed_def789abc012",
    reviewerName: "Dr. Elena Vasquez",
    reviewerInitials: "EV",
    submittedDate: "2026-01-15",
    revealDate: "2026-03-01",
    qualityScore: 5,
    recommendation: "accept",
    sections: {
      summary: "Groundbreaking multi-generational study demonstrating heritable epigenetic modifications in Arabidopsis under drought stress. Experimental design is rigorous.",
      majorComments: [
        "Consider discussing the evolutionary implications of your findings in the context of Lamarckian inheritance debates."
      ],
      minorComments: [
        "Supplementary Table S2 could benefit from confidence intervals",
        "The methylation analysis pipeline should be deposited in a public repository"
      ],
    },
    creditClaimed: true,
    hashProof: "proof_sha256_d7e8f9a0b1c2",
  },
  {
    id: "br-003",
    manuscriptId: "MS-2026-0401",
    manuscriptTitle: "Topological Quantum Error Correction with Fibonacci Anyons",
    journal: "Physical Review Letters",
    field: "Quantum Physics",
    phase: "sealed",
    sealedIdentityHash: "sealed_ghi345jkl678",
    submittedDate: "2026-03-02",
    qualityScore: 3,
    recommendation: "major_revisions",
    sections: {
      summary: "The paper proposes using Fibonacci anyons for topological quantum error correction. While the theoretical framework is interesting, several issues need addressing.",
      majorComments: [
        "The noise model in Eq. (12) is oversimplified — it ignores correlated errors which are dominant in topological systems.",
        "The claimed threshold of 1.1% is not supported by the numerics in Figure 4. The finite-size scaling analysis is insufficient.",
        "Missing discussion of experimental feasibility — no known platform currently supports Fibonacci anyons at scale."
      ],
      minorComments: [
        "Typo in Eq. (7): should be σ_z not σ_x",
        "The color scheme in Fig. 2 is not colorblind-accessible"
      ],
    },
    creditClaimed: false,
    hashProof: "proof_sha256_g3h4i5j6k7l8",
  },
];

// ─── Mock Reproducibility Bounties ───
export const mockBounties: ReproducibilityBounty[] = [
  {
    id: "bounty-001",
    title: "Replicate: Room-Temperature Superconductor (Modified LK-99)",
    author: { name: "Prof. Hyun-Tak Kim", initials: "HK" },
    field: "Materials Science",
    rewardTokens: 500,
    status: "open",
    attempts: 12,
    successfulReplications: 0,
    deadline: "2026-06-30",
    description: "Independent replication of modified LK-99 synthesis protocol with detailed characterization of resistivity, magnetic susceptibility, and crystal structure.",
  },
  {
    id: "bounty-002",
    title: "Replicate: GPT-4 Emergent Reasoning on ARC-AGI Benchmark",
    author: { name: "Dr. François Chollet", initials: "FC" },
    field: "AI / Machine Learning",
    rewardTokens: 300,
    status: "in_progress",
    attempts: 8,
    successfulReplications: 3,
    deadline: "2026-04-15",
    description: "Reproduce the claimed 45% accuracy on ARC-AGI tasks using standard prompting (no fine-tuning). Document exact prompts and scoring methodology.",
  },
  {
    id: "bounty-003",
    title: "Replicate: CRISPR-Cas13 Off-Target Rates in Human Cells",
    author: { name: "Dr. Feng Zhang", initials: "FZ" },
    field: "Molecular Biology",
    rewardTokens: 750,
    status: "completed",
    attempts: 5,
    successfulReplications: 4,
    deadline: "2026-02-28",
    description: "Independent measurement of Cas13 off-target editing rates using the protocol in Methods S3. Must use at least 3 different guide RNAs.",
  },
  {
    id: "bounty-004",
    title: "Replicate: Novel Catalyst for CO₂-to-Ethanol Conversion",
    author: { name: "Prof. Maria García", initials: "MG" },
    field: "Green Chemistry",
    rewardTokens: 400,
    status: "disputed",
    attempts: 6,
    successfulReplications: 1,
    deadline: "2026-05-15",
    description: "Reproduce the reported 62% Faradaic efficiency for electrochemical CO₂ reduction to ethanol using Cu-Ag bimetallic catalyst.",
  },
];

// ─── Mock Reputation Scores ───
export const mockReputation: ReputationScore = {
  userId: "user-001",
  name: "Dr. Elena Vasquez",
  initials: "EV",
  institution: "MIT — Dept. of Physics",
  dimensions: {
    originality: 88,
    rigor: 92,
    generosity: 75,
    reproducibility: 83,
    mentorship: 68,
    collaboration: 90,
  },
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
    { month: "Apr '25", score: 72 }, { month: "May '25", score: 74 },
    { month: "Jun '25", score: 76 }, { month: "Jul '25", score: 78 },
    { month: "Aug '25", score: 79 }, { month: "Sep '25", score: 80 },
    { month: "Oct '25", score: 81 }, { month: "Nov '25", score: 82 },
    { month: "Dec '25", score: 82 }, { month: "Jan '26", score: 83 },
    { month: "Feb '26", score: 84 }, { month: "Mar '26", score: 84 },
  ],
};

export const mockPeerReputations: Pick<ReputationScore, "name" | "initials" | "institution" | "dimensions" | "overallScore">[] = [
  { name: "Prof. James Chen", initials: "JC", institution: "Stanford University", dimensions: { originality: 82, rigor: 95, generosity: 88, reproducibility: 90, mentorship: 85, collaboration: 78 }, overallScore: 86 },
  { name: "Dr. Ingrid Nørgaard", initials: "IN", institution: "University of Copenhagen", dimensions: { originality: 78, rigor: 85, generosity: 92, reproducibility: 88, mentorship: 90, collaboration: 85 }, overallScore: 86 },
  { name: "Dr. Sofia Martínez", initials: "SM", institution: "ETH Zürich", dimensions: { originality: 91, rigor: 88, generosity: 70, reproducibility: 95, mentorship: 60, collaboration: 82 }, overallScore: 81 },
];

// ─── Mock Provenance Graph ───
export const mockProvenanceNodes: ProvenanceNode[] = [
  { id: "pn-001", type: "idea", title: "Topological protection for quantum gates", author: { name: "Dr. Elena Vasquez", initials: "EV" }, timestamp: "2025-03-10", hashDigest: "hash_pn001", description: "Initial idea for using topological codes to protect quantum gate operations", field: "Quantum Computing" },
  { id: "pn-002", type: "hypothesis", title: "Surface code braiding reduces overhead by 40%", author: { name: "Dr. Elena Vasquez", initials: "EV" }, timestamp: "2025-05-22", hashDigest: "hash_pn002", description: "Formal hypothesis that braiding operations on surface codes can reduce qubit overhead", field: "Quantum Computing" },
  { id: "pn-003", type: "experiment", title: "Simulated braiding on 127-qubit lattice", author: { name: "Prof. James Chen", initials: "JC" }, timestamp: "2025-08-14", hashDigest: "hash_pn003", description: "Numerical simulation of braiding protocol using IBM Qiskit on 127-qubit lattice", field: "Quantum Computing" },
  { id: "pn-004", type: "dataset", title: "Braiding simulation results (10^6 shots)", author: { name: "Prof. James Chen", initials: "JC" }, timestamp: "2025-09-02", hashDigest: "hash_pn004", description: "Raw simulation data from braiding experiments", field: "Quantum Computing" },
  { id: "pn-005", type: "review", title: "Review of braiding overhead claims", author: { name: "Dr. Sofia Martínez", initials: "SM" }, timestamp: "2025-10-15", hashDigest: "hash_pn005", description: "Peer review identifying gap in noise model assumptions", field: "Quantum Computing" },
  { id: "pn-006", type: "paper", title: "Topological Quantum Error Correction via Surface Code Braiding", author: { name: "Dr. Elena Vasquez", initials: "EV" }, timestamp: "2026-01-15", hashDigest: "hash_pn006", description: "Published paper incorporating review feedback and simulation results", field: "Quantum Computing" },
  { id: "pn-007", type: "replication", title: "Independent replication on Quantinuum H2", author: { name: "Dr. Yuki Tanaka", initials: "YT" }, timestamp: "2026-02-28", hashDigest: "hash_pn007", description: "Successful replication of braiding protocol on trapped-ion hardware", field: "Quantum Computing" },
  { id: "pn-008", type: "idea", title: "Extension to color codes for higher-distance protection", author: { name: "Dr. Ingrid Nørgaard", initials: "IN" }, timestamp: "2026-03-05", hashDigest: "hash_pn008", description: "New idea inspired by the surface code braiding paper — extending to color codes", field: "Quantum Computing" },
];

export const mockProvenanceEdges: ProvenanceEdge[] = [
  { source: "pn-001", target: "pn-002", relationship: "refined" },
  { source: "pn-002", target: "pn-003", relationship: "inspired" },
  { source: "pn-003", target: "pn-004", relationship: "extended" },
  { source: "pn-004", target: "pn-006", relationship: "cited" },
  { source: "pn-005", target: "pn-006", relationship: "refined" },
  { source: "pn-006", target: "pn-007", relationship: "replicated" },
  { source: "pn-006", target: "pn-008", relationship: "inspired" },
  { source: "pn-002", target: "pn-005", relationship: "challenged" },
];

// ─── Contribution type metadata ───
export const CONTRIBUTION_TYPE_META: Record<ContributionType, { label: string; color: string; icon: string }> = {
  ideation: { label: "Ideation", color: "text-amber-500", icon: "💡" },
  peer_review: { label: "Peer Review", color: "text-blue-500", icon: "🔍" },
  data_sharing: { label: "Data Sharing", color: "text-emerald-500", icon: "📊" },
  mentorship: { label: "Mentorship", color: "text-purple-500", icon: "🎓" },
  replication: { label: "Replication", color: "text-rose-500", icon: "🔬" },
  feedback: { label: "Feedback", color: "text-cyan-500", icon: "💬" },
  curation: { label: "Curation", color: "text-orange-500", icon: "📚" },
  methodology: { label: "Methodology", color: "text-indigo-500", icon: "⚙️" },
};

export const PROVENANCE_NODE_META: Record<ProvenanceNode["type"], { label: string; color: string }> = {
  idea: { label: "Idea", color: "bg-amber-500" },
  hypothesis: { label: "Hypothesis", color: "bg-blue-500" },
  experiment: { label: "Experiment", color: "bg-emerald-500" },
  paper: { label: "Paper", color: "bg-purple-500" },
  dataset: { label: "Dataset", color: "bg-cyan-500" },
  review: { label: "Review", color: "bg-rose-500" },
  replication: { label: "Replication", color: "bg-orange-500" },
};
