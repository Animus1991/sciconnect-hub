/**
 * Blockchain Service Layer
 * 
 * Configurable service for SHA-256 document hashing, immutable audit trails,
 * and Hedera Hashgraph timestamp anchoring.
 * 
 * Configure VITE_BLOCKCHAIN_API_URL to point to your custom backend.
 * All methods are ready for real blockchain integration.
 */

import { sha256 } from "./blockchain-utils";

// ─── Configuration ───────────────────────────────────────────────────────────
const BLOCKCHAIN_API = import.meta.env.VITE_BLOCKCHAIN_API_URL || "http://localhost:3002/api/blockchain";

interface BlockchainConfig {
  apiUrl: string;
  network: "mainnet" | "testnet" | "previewnet";
  enableTimestamps: boolean;
  enableAuditTrail: boolean;
}

const config: BlockchainConfig = {
  apiUrl: BLOCKCHAIN_API,
  network: (import.meta.env.VITE_HEDERA_NETWORK as BlockchainConfig["network"]) || "testnet",
  enableTimestamps: import.meta.env.VITE_BLOCKCHAIN_TIMESTAMPS !== "false",
  enableAuditTrail: import.meta.env.VITE_BLOCKCHAIN_AUDIT !== "false",
};

// ─── Types ───────────────────────────────────────────────────────────────────
export interface HashAnchorRequest {
  documentType: "publication" | "protocol" | "dataset" | "citation" | "wiki" | "lab-entry" | "credential" | "review" | "contribution";
  documentId: string;
  title: string;
  content: string;
  author: string;
  metadata?: Record<string, unknown>;
}

export interface HashAnchorResponse {
  hash: string;
  txId: string;
  topicId: string;
  consensusTimestamp: string;
  network: string;
  status: "pending" | "anchored" | "verified";
  explorerUrl: string;
}

export interface AuditTrailEntry {
  id: string;
  action: string;
  actor: string;
  actorId?: string;
  timestamp: string;
  hash: string;
  txId?: string;
  consensusTimestamp?: string;
  documentType: string;
  documentId: string;
  metadata?: Record<string, unknown>;
  status: "pending" | "anchored" | "verified";
}

export interface VerificationResult {
  valid: boolean;
  originalHash: string;
  currentHash: string;
  anchoredAt?: string;
  txId?: string;
  consensusTimestamp?: string;
  tampered: boolean;
}

export interface HederaTimestamp {
  seconds: number;
  nanos: number;
  consensusTimestamp: string;
  topicId: string;
  sequenceNumber: number;
}

// ─── Core Service ────────────────────────────────────────────────────────────

async function blockchainRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("sciconnect_token");
  const res = await fetch(`${config.apiUrl}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new BlockchainError(res.status, err.error || "Blockchain request failed");
  }
  return res.json();
}

export class BlockchainError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "BlockchainError";
  }
}

// ─── Document Hashing ────────────────────────────────────────────────────────

/** Generate SHA-256 hash of document content locally (browser-native) */
export async function hashDocument(content: string): Promise<string> {
  return sha256(content);
}

/** Hash and anchor a document to blockchain via your backend */
export async function anchorDocument(request: HashAnchorRequest): Promise<HashAnchorResponse> {
  const contentHash = await sha256(request.content);
  
  return blockchainRequest<HashAnchorResponse>("/anchor", {
    method: "POST",
    body: JSON.stringify({
      ...request,
      hash: contentHash,
      network: config.network,
    }),
  });
}

/** Verify a document's integrity against its blockchain anchor */
export async function verifyDocument(documentId: string, currentContent: string): Promise<VerificationResult> {
  const currentHash = await sha256(currentContent);
  
  return blockchainRequest<VerificationResult>(`/verify/${documentId}`, {
    method: "POST",
    body: JSON.stringify({ currentHash }),
  });
}

// ─── Hedera Hashgraph Timestamps ─────────────────────────────────────────────

/** Submit a message to a Hedera Consensus Service topic for timestamping */
export async function submitHederaTimestamp(data: {
  topicId?: string;
  message: string;
  documentType: string;
  documentId: string;
}): Promise<HederaTimestamp> {
  return blockchainRequest<HederaTimestamp>("/hedera/timestamp", {
    method: "POST",
    body: JSON.stringify({
      ...data,
      network: config.network,
    }),
  });
}

/** Get the Hedera consensus timestamp for a document */
export async function getHederaTimestamp(documentId: string): Promise<HederaTimestamp | null> {
  return blockchainRequest<HederaTimestamp | null>(`/hedera/timestamp/${documentId}`);
}

// ─── Immutable Audit Trail ───────────────────────────────────────────────────

/** Record an action in the immutable audit trail */
export async function recordAuditEntry(entry: Omit<AuditTrailEntry, "id" | "hash" | "status">): Promise<AuditTrailEntry> {
  const entryHash = await sha256(JSON.stringify({
    action: entry.action,
    actor: entry.actor,
    timestamp: entry.timestamp,
    documentType: entry.documentType,
    documentId: entry.documentId,
  }));

  return blockchainRequest<AuditTrailEntry>("/audit-trail", {
    method: "POST",
    body: JSON.stringify({
      ...entry,
      hash: entryHash,
      network: config.network,
    }),
  });
}

/** Get the complete audit trail for a document */
export async function getAuditTrail(params?: {
  documentType?: string;
  documentId?: string;
  actor?: string;
  limit?: number;
  offset?: number;
}): Promise<{ entries: AuditTrailEntry[]; total: number }> {
  const qs = params ? "?" + new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)])
  ).toString() : "";
  
  return blockchainRequest<{ entries: AuditTrailEntry[]; total: number }>(`/audit-trail${qs}`);
}

/** Verify the integrity of an entire audit trail chain */
export async function verifyAuditChain(documentId: string): Promise<{
  valid: boolean;
  entries: number;
  brokenAt?: number;
  details: string;
}> {
  return blockchainRequest(`/audit-trail/${documentId}/verify`);
}

// ─── Credential Verification ─────────────────────────────────────────────────

export async function anchorCredential(data: {
  credentialType: string;
  holder: string;
  holderId?: string;
  institution?: string;
  details: string;
  issuedDate: string;
}): Promise<HashAnchorResponse> {
  const credentialHash = await sha256(JSON.stringify(data));
  
  return blockchainRequest<HashAnchorResponse>("/credentials/anchor", {
    method: "POST",
    body: JSON.stringify({
      ...data,
      hash: credentialHash,
      network: config.network,
    }),
  });
}

export async function verifyCredential(credentialId: string): Promise<VerificationResult> {
  return blockchainRequest<VerificationResult>(`/credentials/verify/${credentialId}`);
}

// ─── SBT (Soulbound Token) Operations ────────────────────────────────────────

export interface SBTToken {
  tokenId: string;
  name: string;
  description: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  earnedDate: string;
  holder: string;
  metadata: {
    category: string;
    criteria: string;
    verifications: number;
    hash: string;
    txId?: string;
    consensusTimestamp?: string;
  };
  imageUrl?: string;
}

export async function mintSBT(data: {
  name: string;
  description: string;
  rarity: SBTToken["rarity"];
  holder: string;
  category: string;
  criteria: string;
}): Promise<SBTToken> {
  return blockchainRequest<SBTToken>("/sbt/mint", {
    method: "POST",
    body: JSON.stringify({ ...data, network: config.network }),
  });
}

export async function getSBTGallery(holderId?: string): Promise<{ tokens: SBTToken[]; total: number }> {
  const qs = holderId ? `?holder=${holderId}` : "";
  return blockchainRequest<{ tokens: SBTToken[]; total: number }>(`/sbt/gallery${qs}`);
}

// ─── Smart Contract Milestones ───────────────────────────────────────────────

export interface SmartContractMilestone {
  id: string;
  grantId: string;
  title: string;
  status: "locked" | "unlocked" | "claimed";
  amount: string;
  dueDate: string;
  completedDate?: string;
  txId?: string;
  contractAddress?: string;
}

export async function getMilestones(grantId: string): Promise<{ milestones: SmartContractMilestone[] }> {
  return blockchainRequest<{ milestones: SmartContractMilestone[] }>(`/milestones/${grantId}`);
}

export async function claimMilestone(milestoneId: string): Promise<SmartContractMilestone> {
  return blockchainRequest<SmartContractMilestone>(`/milestones/${milestoneId}/claim`, { method: "POST" });
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface BlockchainAnalytics {
  totalAnchored: number;
  totalVerified: number;
  totalPending: number;
  sbtDistribution: { rarity: string; count: number }[];
  auditTrailTimeline: { date: string; entries: number }[];
  contributionsByType: { type: string; count: number; verified: number }[];
  networkStats: {
    network: string;
    totalTransactions: number;
    averageConfirmationTime: string;
  };
}

export async function getBlockchainAnalytics(): Promise<BlockchainAnalytics> {
  return blockchainRequest<BlockchainAnalytics>("/analytics");
}

// ─── Export ──────────────────────────────────────────────────────────────────

export const blockchainService = {
  // Config
  config,
  
  // Document hashing
  hashDocument,
  anchorDocument,
  verifyDocument,
  
  // Hedera timestamps
  submitHederaTimestamp,
  getHederaTimestamp,
  
  // Audit trail
  recordAuditEntry,
  getAuditTrail,
  verifyAuditChain,
  
  // Credentials
  anchorCredential,
  verifyCredential,
  
  // SBT
  mintSBT,
  getSBTGallery,
  
  // Milestones
  getMilestones,
  claimMilestone,
  
  // Analytics
  getBlockchainAnalytics,
};
