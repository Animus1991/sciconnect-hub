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
