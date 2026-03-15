/* ─── Blockchain Utility Functions ─── */

/** Generate a deterministic SHA-256 hash (browser-native) */
export async function sha256(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Synchronous mock hash for display (deterministic from string) */
export function mockHash(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  }
  const hex = Math.abs(h).toString(16).padStart(8, "0");
  return `${hex}a1b2c3d4e5f6${hex}7890abcdef1234567890abcdef`.slice(0, 64);
}

/** Generate a mock transaction ID */
export function mockTxId(seed: string): string {
  return `0x${mockHash(seed).slice(0, 40)}`;
}

/** Format a hash for short display */
export function shortHash(hash: string, prefixLen = 6, suffixLen = 4): string {
  if (hash.length <= prefixLen + suffixLen + 3) return hash;
  return `${hash.slice(0, prefixLen)}…${hash.slice(-suffixLen)}`;
}

/** Generate a mock anchor timestamp */
export function mockAnchorTimestamp(baseDateStr: string): string {
  const d = new Date(baseDateStr);
  if (isNaN(d.getTime())) return "2026-01-15T10:30:00Z";
  d.setMinutes(d.getMinutes() + Math.floor(Math.random() * 60));
  return d.toISOString();
}

/** Get a blockchain status based on some heuristic */
export function deriveAnchorStatus(item: { status?: string; date?: string }): "verified" | "anchored" | "pending" | "unverified" {
  if (item.status === "published" || item.status === "completed" || item.status === "active") return "verified";
  if (item.status === "under review" || item.status === "in_progress" || item.status === "submitted") return "anchored";
  if (item.status === "draft" || item.status === "planning") return "pending";
  return "unverified";
}
