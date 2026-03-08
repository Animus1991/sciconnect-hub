const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem("sciconnect_token");

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, error.error || "Request failed");
  }

  return res.json();
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Auth ────────────────────────────────────────────────────────
export const auth = {
  login: (email: string, password: string) =>
    request<{ token: string; user: UserProfile }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (data: { name: string; email: string; password: string; institution?: string; field?: string }) =>
    request<{ token: string; user: UserProfile }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  me: () => request<{ user: UserProfile }>("/auth/me"),
};

// ─── Publications ────────────────────────────────────────────────
export const publications = {
  list: (params?: { status?: string; sort?: string; q?: string }) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ publications: Publication[]; total: number }>(`/publications${qs}`);
  },
  get: (id: string) => request<Publication>(`/publications/${id}`),
  create: (data: Partial<Publication>) =>
    request<Publication>("/publications", { method: "POST", body: JSON.stringify(data) }),
  stats: () => request<PublicationStats>("/publications/stats/summary"),
};

// ─── Projects ────────────────────────────────────────────────────
export const projects = {
  list: (params?: { status?: string }) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ projects: Project[]; total: number }>(`/projects${qs}`);
  },
  get: (id: string) => request<Project>(`/projects/${id}`),
  create: (data: Partial<Project>) =>
    request<Project>("/projects", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Project>) =>
    request<Project>(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  stats: () => request<ProjectStats>("/projects/stats/summary"),
};

// ─── Community ───────────────────────────────────────────────────
export const community = {
  researchers: (params?: { q?: string; field?: string; sort?: string }) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ researchers: Researcher[]; total: number }>(`/community/researchers${qs}`);
  },
  researcher: (id: string) => request<Researcher>(`/community/researchers/${id}`),
  toggleFollow: (id: string) =>
    request<{ following: boolean; followers: number }>(`/community/researchers/${id}/follow`, { method: "POST" }),
  stats: () => request<CommunityStats>("/community/stats"),
};

// ─── Notifications ───────────────────────────────────────────────
export const notifications = {
  list: (params?: { type?: string; unread?: string }) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ notifications: Notification[]; total: number; unread: number }>(`/notifications${qs}`);
  },
  markRead: (id: string) =>
    request<Notification>(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () =>
    request<{ success: boolean }>("/notifications/mark-all-read", { method: "POST" }),
  delete: (id: string) =>
    request<{ success: boolean }>(`/notifications/${id}`, { method: "DELETE" }),
  count: () => request<{ total: number; unread: number }>("/notifications/count"),
};

// ─── Analytics ───────────────────────────────────────────────────
export const analytics = {
  overview: () => request<AnalyticsOverview>("/analytics/overview"),
  monthly: (months?: number) => {
    const qs = months ? `?months=${months}` : "";
    return request<{ data: MonthlyData[] }>(`/analytics/monthly${qs}`);
  },
  fieldDistribution: () => request<{ distribution: FieldSlice[] }>("/analytics/field-distribution"),
  collaborations: () => request<{ countries: CollaborationCountry[] }>("/analytics/collaborations"),
  achievements: () => request<{ achievements: Achievement[] }>("/analytics/achievements"),
};

// ─── Search ──────────────────────────────────────────────────────
export const search = {
  query: (q: string, params?: { type?: string; limit?: string }) => {
    const qs = new URLSearchParams({ q, ...params }).toString();
    return request<SearchResults>(`/search?${qs}`);
  },
  suggestions: (q: string) =>
    request<{ suggestions: string[] }>(`/search/suggestions?q=${encodeURIComponent(q)}`),
};

// ─── Repositories ────────────────────────────────────────────────
export const repositoriesApi = {
  list: () => request<{ repositories: RepositoryConfig[]; total: number }>("/repositories"),
  get: (id: string) => request<RepositoryConfig>("/repositories/" + id),
  status: () => request<{ repositories: RepositoryStatus[] }>("/repositories/status/all"),
  proxy: (repoId: string, endpoint: string, params?: Record<string, string>, body?: unknown) =>
    request<{ success: boolean; repository: string; endpoint: string; data: unknown }>(
      `/repositories/${repoId}/proxy`, { method: "POST", body: JSON.stringify({ endpoint, params, body }) }
    ),
  test: (repoId: string) =>
    request<{ connected: boolean; message: string }>(`/repositories/${repoId}/test`, { method: "POST" }),
  unifiedSearch: (query: string, repoIds?: string[], limit?: number) =>
    request<{ query: string; results: Record<string, unknown>; errors?: Record<string, string> }>(
      "/repositories/search/unified", { method: "POST", body: JSON.stringify({ query, repositories: repoIds, limit }) }
    ),
};

// ─── Funding/Grants ──────────────────────────────────────────────
export const funding = {
  list: () => request<{ grants: any[]; total: number; stats: any }>("/funding"),
  get: (id: string) => request<any>(`/funding/${id}`),
  create: (data: { title: string; funder: string; amount: number; currency: string; description?: string; deadline?: string; tags?: string[] }) =>
    request<any>("/funding", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, any>) =>
    request<any>(`/funding/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  stats: () => request<any>("/funding/stats/summary"),
};

// ─── Lab Notebook / Protocols ────────────────────────────────────
export const protocols = {
  list: (params?: { category?: string; status?: string }) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ protocols: any[]; total: number }>(`/protocols${qs}`);
  },
  get: (id: string) => request<any>(`/protocols/${id}`),
  create: (data: { title: string; category: string; visibility: string; description?: string; tags?: string[] }) =>
    request<any>("/protocols", { method: "POST", body: JSON.stringify(data) }),
  fork: (id: string) => request<{ success: boolean; forks: number }>(`/protocols/${id}/fork`, { method: "POST" }),
  star: (id: string) => request<{ success: boolean; stars: number }>(`/protocols/${id}/star`, { method: "POST" }),
};

// ─── Citation Manager ────────────────────────────────────────────
export const citations = {
  list: (params?: { collection?: string; type?: string; q?: string }) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ citations: any[]; total: number }>(`/citations${qs}`);
  },
  collections: () => request<{ collections: any[] }>("/citations/collections"),
  create: (data: { title: string; authors: string[]; journal: string; year: number; doi?: string; type: string; tags?: string[]; collections?: string[] }) =>
    request<any>("/citations", { method: "POST", body: JSON.stringify(data) }),
  importBibtex: (bibtex: string) =>
    request<{ imported: number }>("/citations/import/bibtex", { method: "POST", body: JSON.stringify({ bibtex }) }),
  importDois: (dois: string[]) =>
    request<{ resolved: number }>("/citations/import/doi", { method: "POST", body: JSON.stringify({ dois }) }),
  toggleStar: (id: string) => request<{ starred: boolean }>(`/citations/${id}/star`, { method: "PATCH" }),
  exportBibtex: (ids?: string[]) =>
    request<{ bibtex: string; count: number }>("/citations/export/bibtex", { method: "POST", body: JSON.stringify({ ids }) }),
};

// ─── Blockchain ──────────────────────────────────────────────────
export const blockchain = {
  contributions: (params?: { type?: string; status?: string }) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ contributions: any[]; total: number; stats: any }>(`/blockchain/contributions${qs}`);
  },
  createContribution: (data: { type: string; title: string; description?: string; field?: string; authorName: string }) =>
    request<any>("/blockchain/contributions", { method: "POST", body: JSON.stringify(data) }),
  verifyContribution: (id: string) =>
    request<any>(`/blockchain/contributions/${id}/verify`, { method: "POST" }),
  provenance: () => request<{ nodes: any[]; edges: any[] }>("/blockchain/provenance/graph"),
  reviews: () => request<{ reviews: any[]; total: number }>("/blockchain/reviews"),
  revealReview: (id: string) => request<any>(`/blockchain/reviews/${id}/reveal`, { method: "PATCH" }),
  bounties: (params?: { status?: string }) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ bounties: any[]; total: number }>(`/blockchain/bounties${qs}`);
  },
  reputation: () => request<any>("/blockchain/reputation"),
  events: (params?: { type?: string; unread?: string }) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ events: any[]; total: number; unread: number }>(`/blockchain/events${qs}`);
  },

  // ─── Document Hashing & Anchoring ────────────────────────────────
  anchorDocument: (data: {
    documentType: string;
    documentId: string;
    title: string;
    hash: string;
    author: string;
    network?: string;
  }) => request<{ txId: string; topicId: string; consensusTimestamp: string; status: string; explorerUrl: string }>(
    "/blockchain/anchor", { method: "POST", body: JSON.stringify(data) }
  ),

  verifyDocument: (documentId: string, currentHash: string) =>
    request<{ valid: boolean; originalHash: string; currentHash: string; tampered: boolean; anchoredAt?: string; txId?: string }>(
      `/blockchain/verify/${documentId}`, { method: "POST", body: JSON.stringify({ currentHash }) }
    ),

  // ─── Hedera Hashgraph Timestamps ─────────────────────────────────
  submitHederaTimestamp: (data: { topicId?: string; message: string; documentType: string; documentId: string; network?: string }) =>
    request<{ seconds: number; nanos: number; consensusTimestamp: string; topicId: string; sequenceNumber: number }>(
      "/blockchain/hedera/timestamp", { method: "POST", body: JSON.stringify(data) }
    ),

  getHederaTimestamp: (documentId: string) =>
    request<{ seconds: number; nanos: number; consensusTimestamp: string; topicId: string } | null>(
      `/blockchain/hedera/timestamp/${documentId}`
    ),

  // ─── Audit Trail ─────────────────────────────────────────────────
  recordAuditEntry: (data: {
    action: string; actor: string; timestamp: string;
    hash: string; documentType: string; documentId: string;
  }) => request<any>("/blockchain/audit-trail", { method: "POST", body: JSON.stringify(data) }),

  getAuditTrail: (params?: { documentType?: string; documentId?: string; limit?: number }) => {
    const qs = params ? "?" + new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
    ).toString() : "";
    return request<{ entries: any[]; total: number }>(`/blockchain/audit-trail${qs}`);
  },

  verifyAuditChain: (documentId: string) =>
    request<{ valid: boolean; entries: number; brokenAt?: number; details: string }>(
      `/blockchain/audit-trail/${documentId}/verify`
    ),

  // ─── Credentials ─────────────────────────────────────────────────
  anchorCredential: (data: { credentialType: string; holder: string; institution?: string; details: string; hash: string; network?: string }) =>
    request<any>("/blockchain/credentials/anchor", { method: "POST", body: JSON.stringify(data) }),

  verifyCredential: (credentialId: string) =>
    request<{ valid: boolean; originalHash: string; tampered: boolean }>(
      `/blockchain/credentials/verify/${credentialId}`
    ),

  // ─── SBT ─────────────────────────────────────────────────────────
  mintSBT: (data: { name: string; description: string; rarity: string; holder: string; category: string; criteria: string; network?: string }) =>
    request<any>("/blockchain/sbt/mint", { method: "POST", body: JSON.stringify(data) }),

  getSBTGallery: (holderId?: string) => {
    const qs = holderId ? `?holder=${holderId}` : "";
    return request<{ tokens: any[]; total: number }>(`/blockchain/sbt/gallery${qs}`);
  },

  // ─── Analytics ───────────────────────────────────────────────────
  analytics: () => request<{
    totalAnchored: number; totalVerified: number; totalPending: number;
    sbtDistribution: any[]; auditTrailTimeline: any[]; contributionsByType: any[]; networkStats: any;
  }>("/blockchain/analytics"),
};

// ─── Conferences ─────────────────────────────────────────────────
export const conferences = {
  list: (params?: { type?: string; field?: string }) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ conferences: any[]; total: number }>(`/conferences${qs}`);
  },
  get: (id: string) => request<any>(`/conferences/${id}`),
  create: (data: { name: string; type: string; field: string; location: string; startDate: string; endDate: string; website?: string }) =>
    request<any>("/conferences", { method: "POST", body: JSON.stringify(data) }),
  addSubmission: (confId: string, data: { title: string; type: string }) =>
    request<any>(`/conferences/${confId}/submissions`, { method: "POST", body: JSON.stringify(data) }),
  toggleAttend: (id: string) => request<{ isAttending: boolean }>(`/conferences/${id}/attend`, { method: "PATCH" }),
  upcomingDeadlines: () => request<{ deadlines: any[]; total: number }>("/conferences/deadlines/upcoming"),
};

// ─── Health ──────────────────────────────────────────────────────
export const health = () =>
  request<{ status: string; version: string; timestamp: string }>("/health");

// ─── Types ───────────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  institution: string;
  field: string;
  hIndex: number;
  publications: number;
  citations: number;
}

export interface Publication {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  citations: number;
  doi: string;
  status: string;
  tags: string[];
  abstract: string;
}

export interface PublicationStats {
  totalPublications: number;
  totalCitations: number;
  published: number;
  preprints: number;
  drafts: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  progress: number;
  collaborators: number;
  repos: number;
  deadline: string;
  tags: string[];
  funding: string;
  createdAt: string;
}

export interface ProjectStats {
  total: number;
  active: number;
  planning: number;
  completed: number;
  totalCollaborators: number;
}

export interface Researcher {
  id: string;
  name: string;
  institution: string;
  field: string;
  hIndex: number;
  papers: number;
  followers: number;
  following: boolean;
}

export interface CommunityStats {
  totalResearchers: number;
  following: number;
  institutions: number;
  fields: number;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AnalyticsOverview {
  kpis: {
    totalCitations: number;
    hIndex: number;
    totalReads: number;
    totalDownloads: number;
    collaborators: number;
    publications: number;
    globalRank: number;
  };
  trends: {
    citationGrowth: string;
    readGrowth: string;
    downloadGrowth: string;
  };
}

export interface MonthlyData {
  month: string;
  citations: number;
  reads: number;
  downloads: number;
}

export interface FieldSlice {
  name: string;
  value: number;
  color: string;
}

export interface CollaborationCountry {
  country: string;
  collaborators: number;
  papers: number;
}

export interface Achievement {
  icon: string;
  label: string;
  time: string;
}

export interface SearchResults {
  query: string;
  results: SearchResult[];
  total: number;
  types: Record<string, number>;
}

export interface SearchResult {
  type: string;
  id: string;
  title: string;
  subtitle: string;
  tags: string[];
}

export interface RepositoryConfig {
  id: string;
  name: string;
  baseUrl: string;
  authType: string;
  docsUrl: string;
  connected: boolean;
  endpoints: { id: string; method: string; path: string; description: string }[];
  rateLimit: { requests: number; windowMs: number };
}

export interface RepositoryStatus {
  id: string;
  name: string;
  connected: boolean;
  authType: string;
}
