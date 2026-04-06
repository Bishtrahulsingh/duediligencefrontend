/**
 * Centralized API service — all backend calls go through here.
 * Base URL is read from NEXT_PUBLIC_BACKEND_URL.
 */

const BASE = () => process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE()}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(err.detail ?? 'Request failed')
  }
  return res.json() as Promise<T>
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export const auth = {
  login: (email: string, password: string) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
}

// ─── Companies ─────────────────────────────────────────────────────────────

export interface Company {
  id: string
  name: string
  ticker?: string
  sector?: string
  fiscal_year?: number
  keywords?: string[]
  created_at: string
}

export const companies = {
  list: (): Promise<Company[]> =>
    request('/api/v1/company/distinct'),

  create: (payload: { name: string; ticker: string; sector: string }) =>
    request('/api/v1/company', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  /** Auto-fetch 10-K filings from EDGAR and embed them */
  searchAndStore: (payload: { name: string; ticker: string; year: number[] }) =>
    request('/api/v1/search/company', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}

// ─── Documents ─────────────────────────────────────────────────────────────

export interface Document {
  id: string
  company_id: string
  title: string
  doc_type: string
  source?: string
  fiscal_year?: number
  ticker?: string
  headings?: string[]
  created_at: string
}

export const documents = {
  /** Get documents for a specific company + fiscal_year */
  listForCompany: (ticker: string, fiscal_year: string): Promise<Document[]> =>
    request('/api/v1/storage/documents', {
      method: 'POST',
      body: JSON.stringify({ ticker, fiscal_year }),
    }),

  /** Ingest a PDF URL */
  ingest: (payload: {
    company_id: string
    title: string
    doc_type: string
    source: string
    fiscal_year: number
  }) =>
    request('/api/v1/store/document', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}

// ─── Analysis ──────────────────────────────────────────────────────────────

export interface AnalysisPayload {
  query: string
  company_name: string
  collection_name: string
  ticker: string
  fiscal_year: number
}

export interface AnalysisResult {
  response: string | StructuredAnalysis
}

export interface StructuredAnalysis {
  executive_summary?: string
  key_risks?: { risk: string; severity: string; evidence?: string }[]
  open_questions?: (string | { question: string; decision_impact?: string })[]
  confidence?: number | string
}

export const analysis = {
  query: (payload: AnalysisPayload): Promise<AnalysisResult> =>
    request('/api/result/stream', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}
