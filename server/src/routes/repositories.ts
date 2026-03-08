import { Router, Request, Response } from "express";

export const repositoriesRouter = Router();

// ─── Repository Configuration ────────────────────────────────────
// Each connector defines: base URL, auth type, rate limits, endpoints
interface RepositoryConfig {
  id: string;
  name: string;
  baseUrl: string;
  authType: "apikey" | "oauth" | "token" | "none";
  authHeader?: string;
  rateLimit: { requests: number; windowMs: number };
  endpoints: Record<string, { method: string; path: string; description: string }>;
  responseFormat: "json" | "xml";
  docsUrl: string;
}

const repositories: RepositoryConfig[] = [
  {
    id: "orcid",
    name: "ORCID",
    baseUrl: "https://pub.orcid.org/v3.0",
    authType: "token",
    authHeader: "Authorization",
    rateLimit: { requests: 24, windowMs: 1000 },
    responseFormat: "json",
    docsUrl: "https://info.orcid.org/documentation/api-tutorials/",
    endpoints: {
      profile: { method: "GET", path: "/{orcid}", description: "Get researcher profile" },
      works: { method: "GET", path: "/{orcid}/works", description: "Get researcher publications" },
      search: { method: "GET", path: "/search?q={query}", description: "Search ORCID records" },
      employment: { method: "GET", path: "/{orcid}/employments", description: "Get employment history" },
      education: { method: "GET", path: "/{orcid}/educations", description: "Get education history" },
      fundings: { method: "GET", path: "/{orcid}/fundings", description: "Get funding records" },
    },
  },
  {
    id: "arxiv",
    name: "arXiv",
    baseUrl: "https://export.arxiv.org/api",
    authType: "none",
    rateLimit: { requests: 1, windowMs: 3000 },
    responseFormat: "xml",
    docsUrl: "https://info.arxiv.org/help/api/index.html",
    endpoints: {
      search: { method: "GET", path: "/query?search_query={query}&start={start}&max_results={limit}", description: "Search papers" },
      paper: { method: "GET", path: "/query?id_list={id}", description: "Get paper by arXiv ID" },
      category: { method: "GET", path: "/query?search_query=cat:{category}&max_results={limit}", description: "Browse by category" },
    },
  },
  {
    id: "pubmed",
    name: "PubMed",
    baseUrl: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils",
    authType: "apikey",
    rateLimit: { requests: 10, windowMs: 1000 },
    responseFormat: "json",
    docsUrl: "https://www.ncbi.nlm.nih.gov/books/NBK25501/",
    endpoints: {
      search: { method: "GET", path: "/esearch.fcgi?db=pubmed&retmode=json&term={query}&retmax={limit}", description: "Search PubMed" },
      fetch: { method: "GET", path: "/efetch.fcgi?db=pubmed&retmode=xml&id={id}", description: "Fetch article details" },
      summary: { method: "GET", path: "/esummary.fcgi?db=pubmed&retmode=json&id={ids}", description: "Get article summaries" },
      related: { method: "GET", path: "/elink.fcgi?dbfrom=pubmed&db=pubmed&id={id}&cmd=neighbor_score", description: "Find related articles" },
      citations: { method: "GET", path: "/elink.fcgi?dbfrom=pubmed&db=pubmed&id={id}&linkname=pubmed_pubmed_citedin", description: "Get citing articles" },
    },
  },
  {
    id: "github",
    name: "GitHub",
    baseUrl: "https://api.github.com",
    authType: "token",
    authHeader: "Authorization",
    rateLimit: { requests: 5000, windowMs: 3600000 },
    responseFormat: "json",
    docsUrl: "https://docs.github.com/en/rest",
    endpoints: {
      user: { method: "GET", path: "/users/{username}", description: "Get user profile" },
      repos: { method: "GET", path: "/users/{username}/repos?sort=updated&per_page={limit}", description: "List user repos" },
      repo: { method: "GET", path: "/repos/{owner}/{repo}", description: "Get repository details" },
      search: { method: "GET", path: "/search/repositories?q={query}&per_page={limit}", description: "Search repositories" },
      commits: { method: "GET", path: "/repos/{owner}/{repo}/commits?per_page={limit}", description: "Get recent commits" },
      releases: { method: "GET", path: "/repos/{owner}/{repo}/releases?per_page={limit}", description: "Get releases" },
    },
  },
  {
    id: "zenodo",
    name: "Zenodo",
    baseUrl: "https://zenodo.org/api",
    authType: "token",
    authHeader: "Authorization",
    rateLimit: { requests: 60, windowMs: 60000 },
    responseFormat: "json",
    docsUrl: "https://developers.zenodo.org/",
    endpoints: {
      search: { method: "GET", path: "/records?q={query}&size={limit}&sort=mostrecent", description: "Search records" },
      record: { method: "GET", path: "/records/{id}", description: "Get record details" },
      deposit: { method: "POST", path: "/deposit/depositions", description: "Create new deposit" },
      communities: { method: "GET", path: "/communities?q={query}&size={limit}", description: "Search communities" },
      files: { method: "GET", path: "/records/{id}/files", description: "List files in record" },
    },
  },
  {
    id: "google_scholar",
    name: "Google Scholar",
    baseUrl: "https://serpapi.com/search",
    authType: "apikey",
    rateLimit: { requests: 100, windowMs: 3600000 },
    responseFormat: "json",
    docsUrl: "https://serpapi.com/google-scholar-api",
    endpoints: {
      search: { method: "GET", path: "?engine=google_scholar&q={query}&num={limit}", description: "Search scholarly articles" },
      cite: { method: "GET", path: "?engine=google_scholar_cite&q={id}", description: "Get citation formats" },
      author: { method: "GET", path: "?engine=google_scholar_author&author_id={id}", description: "Get author profile" },
      profiles: { method: "GET", path: "?engine=google_scholar_profiles&mauthors={query}", description: "Search author profiles" },
    },
  },
  {
    id: "semantic_scholar",
    name: "Semantic Scholar",
    baseUrl: "https://api.semanticscholar.org/graph/v1",
    authType: "apikey",
    authHeader: "x-api-key",
    rateLimit: { requests: 100, windowMs: 300000 },
    responseFormat: "json",
    docsUrl: "https://api.semanticscholar.org/api-docs/",
    endpoints: {
      search: { method: "GET", path: "/paper/search?query={query}&limit={limit}&fields=title,authors,year,citationCount,abstract,url", description: "Search papers" },
      paper: { method: "GET", path: "/paper/{id}?fields=title,authors,year,citationCount,abstract,references,citations,url,venue,externalIds", description: "Get paper details" },
      author: { method: "GET", path: "/author/{id}?fields=name,hIndex,paperCount,citationCount,papers", description: "Get author profile" },
      authorSearch: { method: "GET", path: "/author/search?query={query}&limit={limit}", description: "Search authors" },
      recommendations: { method: "POST", path: "/recommendations/v1/papers", description: "Get paper recommendations" },
      citations: { method: "GET", path: "/paper/{id}/citations?fields=title,authors,year&limit={limit}", description: "Get citing papers" },
      references: { method: "GET", path: "/paper/{id}/references?fields=title,authors,year&limit={limit}", description: "Get referenced papers" },
    },
  },
  {
    id: "ieee_xplore",
    name: "IEEE Xplore",
    baseUrl: "https://ieeexploreapi.ieee.org/api/v1",
    authType: "apikey",
    rateLimit: { requests: 200, windowMs: 86400000 },
    responseFormat: "json",
    docsUrl: "https://developer.ieee.org/docs",
    endpoints: {
      search: { method: "GET", path: "/search/articles?querytext={query}&max_records={limit}", description: "Search articles" },
      article: { method: "GET", path: "/search/articles?article_number={id}", description: "Get article by number" },
      author: { method: "GET", path: "/search/articles?author={name}&max_records={limit}", description: "Search by author" },
      doi: { method: "GET", path: "/search/articles?doi={doi}", description: "Get by DOI" },
    },
  },
  {
    id: "scopus",
    name: "Scopus",
    baseUrl: "https://api.elsevier.com/content",
    authType: "apikey",
    authHeader: "X-ELS-APIKey",
    rateLimit: { requests: 9, windowMs: 1000 },
    responseFormat: "json",
    docsUrl: "https://dev.elsevier.com/documentation/SCOPUSSearchAPI.wadl",
    endpoints: {
      search: { method: "GET", path: "/search/scopus?query={query}&count={limit}", description: "Search Scopus" },
      abstract: { method: "GET", path: "/abstract/scopus_id/{id}", description: "Get abstract" },
      author: { method: "GET", path: "/search/author?query={query}", description: "Search authors" },
      authorProfile: { method: "GET", path: "/author/author_id/{id}", description: "Get author profile" },
      affiliation: { method: "GET", path: "/affiliation/affiliation_id/{id}", description: "Get affiliation" },
      serial: { method: "GET", path: "/serial/title?title={query}", description: "Search journals" },
      citations: { method: "GET", path: "/abstract/citations?scopus_id={id}", description: "Get citations overview" },
    },
  },
  {
    id: "web_of_science",
    name: "Web of Science",
    baseUrl: "https://wos-api.clarivate.com/api/wos",
    authType: "apikey",
    authHeader: "X-ApiKey",
    rateLimit: { requests: 5, windowMs: 1000 },
    responseFormat: "json",
    docsUrl: "https://developer.clarivate.com/apis/wos",
    endpoints: {
      search: { method: "GET", path: "?databaseId=WOS&usrQuery={query}&count={limit}", description: "Search Web of Science" },
      record: { method: "GET", path: "/id/{id}", description: "Get record by ID" },
      citing: { method: "GET", path: "/citing?uniqueId={id}&count={limit}", description: "Get citing articles" },
      related: { method: "GET", path: "/related?uniqueId={id}&count={limit}", description: "Get related records" },
    },
  },
  {
    id: "figshare",
    name: "Figshare",
    baseUrl: "https://api.figshare.com/v2",
    authType: "token",
    authHeader: "Authorization",
    rateLimit: { requests: 100, windowMs: 60000 },
    responseFormat: "json",
    docsUrl: "https://docs.figshare.com/",
    endpoints: {
      search: { method: "POST", path: "/articles/search", description: "Search articles" },
      article: { method: "GET", path: "/articles/{id}", description: "Get article details" },
      files: { method: "GET", path: "/articles/{id}/files", description: "List article files" },
      collections: { method: "GET", path: "/collections/search", description: "Search collections" },
      projects: { method: "GET", path: "/projects", description: "List projects" },
      categories: { method: "GET", path: "/categories", description: "List categories" },
    },
  },
  {
    id: "mendeley",
    name: "Mendeley",
    baseUrl: "https://api.mendeley.com",
    authType: "oauth",
    authHeader: "Authorization",
    rateLimit: { requests: 150, windowMs: 3600000 },
    responseFormat: "json",
    docsUrl: "https://dev.mendeley.com/methods/",
    endpoints: {
      search: { method: "GET", path: "/search/catalog?query={query}&limit={limit}", description: "Search catalog" },
      document: { method: "GET", path: "/catalog/{id}?view=all", description: "Get document details" },
      profiles: { method: "GET", path: "/profiles/v2?query={query}", description: "Search researcher profiles" },
      profile: { method: "GET", path: "/profiles/v2/{id}", description: "Get researcher profile" },
      datasets: { method: "GET", path: "/datasets?query={query}", description: "Search datasets" },
      groups: { method: "GET", path: "/groups/v2?query={query}", description: "Search groups" },
    },
  },
];

// ─── Rate limiter (in-memory, per-repository) ────────────────────
const rateLimitStore: Record<string, { count: number; resetAt: number }> = {};

function checkRateLimit(repoId: string, config: RepositoryConfig): boolean {
  const now = Date.now();
  const key = repoId;
  if (!rateLimitStore[key] || now > rateLimitStore[key].resetAt) {
    rateLimitStore[key] = { count: 0, resetAt: now + config.rateLimit.windowMs };
  }
  if (rateLimitStore[key].count >= config.rateLimit.requests) {
    return false;
  }
  rateLimitStore[key].count++;
  return true;
}

// ─── Credential store (env-based) ────────────────────────────────
function getCredentials(repoId: string): string | null {
  const envKey = `${repoId.toUpperCase().replace(/-/g, "_")}_API_KEY`;
  return process.env[envKey] || null;
}

// ─── Proxy helper ────────────────────────────────────────────────
function buildUrl(baseUrl: string, pathTemplate: string, params: Record<string, string>): string {
  let url = `${baseUrl}${pathTemplate}`;
  for (const [key, value] of Object.entries(params)) {
    url = url.replace(`{${key}}`, encodeURIComponent(value));
  }
  // Remove unused placeholders
  url = url.replace(/\{[^}]+\}/g, "");
  return url;
}

// ─── Routes ──────────────────────────────────────────────────────

// List all supported repositories and their configuration
repositoriesRouter.get("/", (_req: Request, res: Response) => {
  const configs = repositories.map(r => ({
    id: r.id,
    name: r.name,
    baseUrl: r.baseUrl,
    authType: r.authType,
    docsUrl: r.docsUrl,
    endpoints: Object.entries(r.endpoints).map(([key, ep]) => ({
      id: key,
      ...ep,
    })),
    rateLimit: r.rateLimit,
    connected: !!getCredentials(r.id),
  }));
  res.json({ repositories: configs, total: configs.length });
});

// Get configuration for a specific repository
repositoriesRouter.get("/:repoId", (req: Request, res: Response) => {
  const config = repositories.find(r => r.id === req.params.repoId);
  if (!config) return res.status(404).json({ error: "Repository not found" });

  res.json({
    ...config,
    connected: !!getCredentials(config.id),
    endpoints: Object.entries(config.endpoints).map(([key, ep]) => ({ id: key, ...ep })),
  });
});

// Check connection status for all repositories
repositoriesRouter.get("/status/all", (_req: Request, res: Response) => {
  const statuses = repositories.map(r => ({
    id: r.id,
    name: r.name,
    connected: !!getCredentials(r.id),
    authType: r.authType,
  }));
  res.json({ repositories: statuses });
});

// Proxy request to a specific repository endpoint
repositoriesRouter.post("/:repoId/proxy", async (req: Request, res: Response) => {
  const config = repositories.find(r => r.id === req.params.repoId);
  if (!config) return res.status(404).json({ error: "Repository not found" });

  const { endpoint, params = {}, body: reqBody } = req.body;
  if (!endpoint) return res.status(400).json({ error: "Endpoint is required" });

  const endpointConfig = config.endpoints[endpoint];
  if (!endpointConfig) return res.status(400).json({ error: `Unknown endpoint: ${endpoint}` });

  // Rate limiting
  if (!checkRateLimit(config.id, config)) {
    return res.status(429).json({
      error: "Rate limit exceeded",
      retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
    });
  }

  // Build URL
  const url = buildUrl(config.baseUrl, endpointConfig.path, params);

  // Build headers
  const headers: Record<string, string> = {
    Accept: config.responseFormat === "json" ? "application/json" : "application/xml",
  };

  // Add auth if required
  if (config.authType !== "none") {
    const credentials = getCredentials(config.id);
    if (!credentials) {
      return res.status(401).json({
        error: `No credentials configured for ${config.name}`,
        setup: `Set ${config.id.toUpperCase().replace(/-/g, "_")}_API_KEY environment variable`,
      });
    }
    const headerName = config.authHeader || "Authorization";
    if (config.authType === "token" || config.authType === "oauth") {
      headers[headerName] = `Bearer ${credentials}`;
    } else {
      // For apikey type, append to URL or header depending on service
      if (headerName === "Authorization") {
        headers[headerName] = `Bearer ${credentials}`;
      } else {
        headers[headerName] = credentials;
      }
    }
  }

  try {
    const fetchOptions: RequestInit = {
      method: endpointConfig.method,
      headers,
    };

    if (endpointConfig.method === "POST" && reqBody) {
      headers["Content-Type"] = "application/json";
      fetchOptions.body = JSON.stringify(reqBody);
    }

    const response = await fetch(url, fetchOptions);
    const contentType = response.headers.get("content-type") || "";

    let data: unknown;
    if (contentType.includes("json")) {
      data = await response.json();
    } else if (contentType.includes("xml")) {
      data = await response.text();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: `${config.name} API error`,
        status: response.status,
        data,
      });
    }

    res.json({
      success: true,
      repository: config.id,
      endpoint,
      data,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[${config.name}] Proxy error:`, errorMessage);
    res.status(502).json({
      error: `Failed to reach ${config.name}`,
      message: errorMessage,
    });
  }
});

// Test connection to a repository
repositoriesRouter.post("/:repoId/test", async (req: Request, res: Response) => {
  const config = repositories.find(r => r.id === req.params.repoId);
  if (!config) return res.status(404).json({ error: "Repository not found" });

  if (config.authType === "none") {
    return res.json({ connected: true, message: `${config.name} is a public API, no credentials needed` });
  }

  const credentials = getCredentials(config.id);
  if (!credentials) {
    return res.json({
      connected: false,
      message: `No credentials found for ${config.name}`,
      setup: `Set ${config.id.toUpperCase().replace(/-/g, "_")}_API_KEY environment variable`,
    });
  }

  try {
    // Use the first GET endpoint as a test
    const testEndpoint = Object.entries(config.endpoints).find(([, ep]) => ep.method === "GET");
    if (!testEndpoint) {
      return res.json({ connected: true, message: "Credentials found, but no test endpoint available" });
    }

    const headers: Record<string, string> = { Accept: "application/json" };
    const headerName = config.authHeader || "Authorization";
    headers[headerName] = config.authType === "apikey" ? credentials : `Bearer ${credentials}`;

    const testUrl = `${config.baseUrl}${testEndpoint[1].path.split("?")[0]}`.replace(/\{[^}]+\}/g, "test");
    const response = await fetch(testUrl, { method: "GET", headers });

    res.json({
      connected: response.ok || response.status === 404, // 404 means auth works, just no resource
      status: response.status,
      message: response.ok ? `Successfully connected to ${config.name}` : `${config.name} returned status ${response.status}`,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.json({ connected: false, message: `Could not reach ${config.name}: ${errorMessage}` });
  }
});

// Unified search across multiple repositories
repositoriesRouter.post("/search/unified", async (req: Request, res: Response) => {
  const { query, repositories: repoIds, limit = 10 } = req.body;
  if (!query) return res.status(400).json({ error: "Query is required" });

  const targetRepos = repoIds
    ? repositories.filter(r => repoIds.includes(r.id))
    : repositories.filter(r => r.endpoints.search);

  const results: Record<string, unknown> = {};
  const errors: Record<string, string> = {};

  await Promise.allSettled(
    targetRepos.map(async (config) => {
      if (!config.endpoints.search) return;
      if (!checkRateLimit(config.id, config)) {
        errors[config.id] = "Rate limit exceeded";
        return;
      }

      const searchEndpoint = config.endpoints.search;
      const url = buildUrl(config.baseUrl, searchEndpoint.path, {
        query,
        limit: String(limit),
        start: "0",
        category: "",
        name: query,
        doi: "",
        id: "",
        ids: "",
        username: "",
        owner: "",
        repo: "",
      });

      const headers: Record<string, string> = {
        Accept: config.responseFormat === "json" ? "application/json" : "application/xml",
      };

      if (config.authType !== "none") {
        const credentials = getCredentials(config.id);
        if (!credentials) {
          errors[config.id] = "No credentials configured";
          return;
        }
        const headerName = config.authHeader || "Authorization";
        headers[headerName] = config.authType === "apikey" ? credentials : `Bearer ${credentials}`;
      }

      try {
        const fetchOptions: RequestInit = { method: searchEndpoint.method, headers };
        if (searchEndpoint.method === "POST") {
          headers["Content-Type"] = "application/json";
          fetchOptions.body = JSON.stringify({ search_for: query });
        }

        const response = await fetch(url, fetchOptions);
        if (response.ok) {
          const contentType = response.headers.get("content-type") || "";
          results[config.id] = contentType.includes("json") ? await response.json() : await response.text();
        } else {
          errors[config.id] = `HTTP ${response.status}`;
        }
      } catch (error: unknown) {
        errors[config.id] = error instanceof Error ? error.message : "Request failed";
      }
    })
  );

  res.json({
    query,
    results,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
    searched: targetRepos.map(r => r.id),
  });
});
