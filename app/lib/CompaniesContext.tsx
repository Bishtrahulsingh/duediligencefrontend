'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from 'react'
import { companies as companiesApi, documents as docsApi, Company } from '@/app/lib/api'

// ─── Derived types ──────────────────────────────────────────────────────────

/**
 * One entry per unique ticker, derived from the flat companies list.
 * The companies table does NOT have fiscal_year — years come from the
 * documents table via POST /api/v1/storage/documents/years.
 */
export interface TickerEntry {
  ticker: string
  name:   string
  sector?: string
  /** Latest Company row for this ticker (for id, sector etc.) */
  row: Company
}

// ─── Context shape ──────────────────────────────────────────────────────────

interface CompaniesContextValue {
  /** Raw rows from GET /api/v1/company/distinct */
  companies: Company[]

  /**
   * Deduplicated by ticker — one TickerEntry per unique ticker.
   * Use this to populate company selectors.
   */
  tickerMap: TickerEntry[]

  /**
   * Fetch the available fiscal years for a ticker from the documents table.
   * Results are cached in the context so repeated calls don't re-fetch.
   * Returns [] if no documents exist yet.
   */
  fetchYearsForTicker: (ticker: string) => Promise<number[]>

  /**
   * Cached years per ticker — read this synchronously after
   * fetchYearsForTicker has been called at least once.
   * Shape: { AAPL: [2022, 2023, 2024], TSLA: [2023] }
   */
  yearCache: Record<string, number[]>

  loading: boolean
  error:   string
  refresh: () => Promise<void>
}

// ─── Defaults ───────────────────────────────────────────────────────────────

const CompaniesContext = createContext<CompaniesContextValue>({
  companies:           [],
  tickerMap:           [],
  fetchYearsForTicker: async () => [],
  yearCache:           {},
  loading:             false,
  error:               '',
  refresh:             async () => {},
})

// ─── Helper: build tickerMap from flat rows ──────────────────────────────────

function buildTickerMap(rows: Company[]): TickerEntry[] {
  const seen = new Map<string, Company>()
  for (const row of rows) {
    const t = (row.ticker ?? '').toUpperCase()
    if (!t) continue
    // Keep the first occurrence (API returns them newest-first ideally)
    if (!seen.has(t)) seen.set(t, row)
  }
  return Array.from(seen.entries())
    .map(([ticker, row]) => ({
      ticker,
      name:   row.name,
      sector: row.sector,
      row,
    }))
    .sort((a, b) => a.ticker.localeCompare(b.ticker))
}

// ─── Provider ───────────────────────────────────────────────────────────────

export function CompaniesProvider({ children }: { children: ReactNode }) {
  const [companies,  setCompanies]  = useState<Company[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  // ticker → sorted year list cache
  const [yearCache,  setYearCache]  = useState<Record<string, number[]>>({})

  // ── Fetch company list ────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await companiesApi.list()
      setCompanies(Array.isArray(data) ? data : [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load companies')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  // ── Ticker map (memoised) ─────────────────────────────────────────────────
  const tickerMap = useMemo(() => buildTickerMap(companies), [companies])

  // ── Fetch years for a ticker (with cache) ─────────────────────────────────
  const fetchYearsForTicker = useCallback(
    async (ticker: string): Promise<number[]> => {
      const key = ticker.toUpperCase()

      // Return from cache if already fetched
      if (yearCache[key] !== undefined) return yearCache[key]

      try {
        const raw = await docsApi.yearsForTicker(key)
        // raw is number[] — sort descending so latest year is first
        const sorted = [...new Set(raw)]
          .filter((y) => y != null)
          .sort((a, b) => b - a)

        setYearCache((prev) => ({ ...prev, [key]: sorted }))
        return sorted
      } catch {
        // On error store empty so we don't keep retrying
        setYearCache((prev) => ({ ...prev, [key]: [] }))
        return []
      }
    },
    [yearCache]
  )

  return (
    <CompaniesContext.Provider
      value={{
        companies,
        tickerMap,
        fetchYearsForTicker,
        yearCache,
        loading,
        error,
        refresh,
      }}
    >
      {children}
    </CompaniesContext.Provider>
  )
}

export function useCompanies() {
  return useContext(CompaniesContext)
}