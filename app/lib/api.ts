/**
 * Centralized API service — all backend calls go through here.
 *
 * Auth calls go to Next.js proxy routes (/api/auth/*) which set cookies
 * on the frontend domain so the middleware can see them.
 *
 * All other backend calls use the /backend/* prefix which Next.js rewrites
 * to the real backend URL, forwarding the Cookie header automatically.
 */

let isLoggingOut = false;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));

    if (res.status === 401 && typeof window !== "undefined") {
      if (!isLoggingOut) {
        isLoggingOut = true;
        try {
          // Call our Next.js logout proxy — clears cookies on the frontend domain
          await fetch("/api/auth/logout", { method: "POST" });
        } catch {
          // ignore
        }
        window.location.href = "/login";
      }
      return new Promise(() => {});
    }

    throw new ApiError(res.status, err.detail ?? "Request failed");
  }

  return res.json() as Promise<T>;
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export const auth = {
  login: (email: string, password: string) =>
    request("/api/auth/login", {          // Next.js proxy route
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string) =>
    request("/backend/auth/register", {   // rewritten to backend
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
};

// ─── Companies ─────────────────────────────────────────────────────────────

export interface Company {
  id: string;
  name: string;
  ticker?: string;
  sector?: string;
  fiscal_year?: number;
  keywords?: string[];
  created_at: string;
}

export const companies = {
  list: (): Promise<Company[]> =>
    request("/backend/api/v1/company/distinct"),

  create: (payload: { name: string; ticker: string; sector: string }) =>
    request("/backend/api/v1/company", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  searchAndStore: (payload: { name: string; ticker: string; year: number[] }) =>
    request("/backend/api/v1/search/company", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// ─── Documents ─────────────────────────────────────────────────────────────

export interface Document {
  id: string;
  company_id: string;
  title: string;
  doc_type: string;
  source?: string;
  fiscal_year?: number;
  ticker?: string;
  headings?: string[];
  created_at: string;
}

export const documents = {
  listForCompany: (ticker: string, fiscal_year: string): Promise<Document[]> =>
    request("/backend/api/v1/storage/documents", {
      method: "POST",
      body: JSON.stringify({ ticker, fiscal_year }),
    }),

  yearsForTicker: (ticker: string): Promise<number[]> =>
    request("/backend/api/v1/storage/documents/years", {
      method: "POST",
      body: JSON.stringify({ ticker }),
    }),

  ingest: (payload: {
    company_id: string;
    title: string;
    doc_type: string;
    source: string;
    fiscal_year: number;
  }) =>
    request("/backend/api/v1/store/document", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// ─── Analysis ──────────────────────────────────────────────────────────────

export interface AnalysisPayload {
  query: string;
  company_name: string;
  collection_name: string;
  ticker: string;
  fiscal_year: number;
}

export interface AnalysisResult {
  response: string | StructuredAnalysis;
}

export interface StructuredAnalysis {
  executive_summary?: string;
  key_risks?: { risk: string; severity: string; evidence?: string }[];
  open_questions?: (string | { question: string; decision_impact?: string })[];
  confidence?: number | string;
}

export const analysis = {
  query: (payload: AnalysisPayload): Promise<AnalysisResult> =>
    request("/backend/api/result/stream", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};