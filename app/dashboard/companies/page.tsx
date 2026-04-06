'use client'

import { useState, FormEvent } from 'react'
import { Plus, Search, RefreshCw, CheckCircle2 } from 'lucide-react'
import Topbar from '@/app/components/dashboard/Topbar'
import CompaniesTable from '@/app/components/dashboard/CompaniesTable'
import { Input } from '@/app/components/ui/Input'
import { Button } from '@/app/components/ui/Button'
import { cn } from '@/app/lib/utils'
import { companies as companiesApi } from '@/app/lib/api'
import { useCompanies } from '@/app/lib/CompaniesContext'

const SECTORS = ['Technology', 'Healthcare', 'Automotive', 'Finance', 'Media', 'Audio', 'Energy', 'Consumer', 'Other']

// Available fiscal years (last 5)
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i)

type Mode = 'create' | 'edgar'

export default function CompaniesPage() {
  const { refresh } = useCompanies()

  // form mode toggle
  const [mode, setMode] = useState<Mode>('edgar')

  // ── Create company fields ──────────────────────────────────
  const [name,    setName]    = useState('')
  const [ticker,  setTicker]  = useState('')
  const [sector,  setSector]  = useState('Technology')

  // ── EDGAR search fields ────────────────────────────────────
  const [eName,    setEName]    = useState('')
  const [eTicker,  setETicker]  = useState('')
  const [eYears,   setEYears]   = useState<number[]>([CURRENT_YEAR - 1])

  // ── Shared state ───────────────────────────────────────────
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error,   setError]   = useState('')

  function toggleYear(y: number) {
    setEYears((prev) =>
      prev.includes(y) ? prev.filter((x) => x !== y) : [...prev, y]
    )
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!ticker.trim()) { setError('Ticker is required'); return }
    setLoading(true)
    try {
      await companiesApi.create({ name, ticker: ticker.toUpperCase(), sector })
      await refresh()
      setSuccess(`Company "${name}" created successfully.`)
      setName(''); setTicker('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create company')
    } finally {
      setLoading(false)
    }
  }

  async function handleEdgarSearch(e: FormEvent) {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!eTicker.trim()) { setError('Ticker is required for EDGAR search'); return }
    if (eYears.length === 0) { setError('Select at least one fiscal year'); return }
    setLoading(true)
    try {
      await companiesApi.searchAndStore({
        name: eName || eTicker.toUpperCase(),
        ticker: eTicker.toUpperCase(),
        year: eYears,
      })
      await refresh()
      setSuccess(`EDGAR 10-K filings for ${eTicker.toUpperCase()} fetched, chunked, and embedded successfully.`)
      setEName(''); setETicker(''); setEYears([CURRENT_YEAR - 1])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'EDGAR fetch failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Topbar title="Companies" actionLabel="Add Company" onAction={() => setMode('create')} />

      <div className="p-7 lg:grid lg:grid-cols-[1fr_380px] gap-6 flex flex-col">

        {/* ── Table ───────────────────────────────────────────── */}
        <div>
          <div className="mb-4">
            <div className="font-serif text-[16px] font-normal text-dl-text">All Companies</div>
            <div className="font-mono text-[11px] text-dl-text3 mt-0.5">Manage tracked entities · click a row to analyse</div>
          </div>
          <CompaniesTable clickable />
        </div>

        {/* ── Right panel ─────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Mode toggle */}
          <div className="flex bg-dl-surface border border-dl-border rounded-xl p-1 gap-1">
            <button
              onClick={() => { setMode('edgar'); setError(''); setSuccess('') }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-mono text-[11px] transition-all',
                mode === 'edgar'
                  ? 'bg-[rgba(232,160,32,0.12)] text-dl-amber border border-[rgba(232,160,32,0.25)]'
                  : 'text-dl-text3 hover:text-dl-text2'
              )}
            >
              <Search size={12} />
              Fetch from EDGAR
            </button>
            <button
              onClick={() => { setMode('create'); setError(''); setSuccess('') }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-mono text-[11px] transition-all',
                mode === 'create'
                  ? 'bg-[rgba(232,160,32,0.12)] text-dl-amber border border-[rgba(232,160,32,0.25)]'
                  : 'text-dl-text3 hover:text-dl-text2'
              )}
            >
              <Plus size={12} />
              Manual Entry
            </button>
          </div>

          {/* ── EDGAR Form ─────────────────────────────────────── */}
          {mode === 'edgar' && (
            <div className="bg-dl-surface border border-dl-border rounded-xl p-5">
              <div className="mb-4">
                <div className="font-serif text-[15px] text-dl-text">Fetch SEC Filings</div>
                <div className="font-mono text-[10px] text-dl-text3 mt-0.5">
                  Auto-downloads 10-K from EDGAR · chunks · embeds into Qdrant
                </div>
              </div>

              <form onSubmit={handleEdgarSearch} className="flex flex-col gap-4">
                <Input
                  label="Company Name"
                  placeholder="e.g. Apple Inc."
                  value={eName}
                  onChange={(e) => setEName(e.target.value)}
                />
                <Input
                  label="Ticker Symbol *"
                  placeholder="e.g. AAPL"
                  value={eTicker}
                  onChange={(e) => setETicker(e.target.value.toUpperCase())}
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] tracking-[1.2px] uppercase text-dl-text3">
                    Fiscal Year(s) *
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {YEARS.map((y) => (
                      <button
                        key={y}
                        type="button"
                        onClick={() => toggleYear(y)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg font-mono text-[11px] border transition-all',
                          eYears.includes(y)
                            ? 'bg-[rgba(232,160,32,0.12)] text-dl-amber border-[rgba(232,160,32,0.35)]'
                            : 'bg-dl-surface2 text-dl-text3 border-dl-border hover:border-dl-border2 hover:text-dl-text2'
                        )}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                  <div className="font-mono text-[9px] text-dl-text3 mt-0.5">
                    {eYears.length === 0 ? 'Select at least one year' : `${eYears.length} year(s) selected`}
                  </div>
                </div>

                {/* Info pill */}
                <div className="bg-dl-surface2 border border-dl-border rounded-lg px-3.5 py-2.5">
                  <div className="font-mono text-[9px] text-dl-text3 uppercase tracking-[1px] mb-1">Pipeline</div>
                  <div className="font-mono text-[11px] text-dl-amber">
                    EDGAR → chunk → fastembed → Qdrant upsert
                  </div>
                </div>

                <StatusMessage success={success} error={error} />

                <div className="flex gap-2 pt-1">
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => { setEName(''); setETicker(''); setEYears([CURRENT_YEAR - 1]); setError(''); setSuccess('') }}
                    className="flex-1"
                  >
                    Clear
                  </Button>
                  <Button variant="primary" type="submit" disabled={loading} className="flex-[2] gap-2">
                    {loading ? (
                      <><RefreshCw size={12} className="animate-spin" /> Fetching…</>
                    ) : (
                      <><Search size={12} /> Fetch & Embed →</>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* ── Manual Create Form ─────────────────────────────── */}
          {mode === 'create' && (
            <div className="bg-dl-surface border border-dl-border rounded-xl p-5">
              <div className="mb-4">
                <div className="font-serif text-[15px] text-dl-text">Add Company Manually</div>
                <div className="font-mono text-[10px] text-dl-text3 mt-0.5">
                  Creates an entity — upload documents separately
                </div>
              </div>

              <form onSubmit={handleCreate} className="flex flex-col gap-4">
                <Input
                  label="Company Name *"
                  placeholder="e.g. OpenAI, Inc."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Ticker Symbol *"
                  placeholder="e.g. AAPL"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  required
                />
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] tracking-[1.2px] uppercase text-dl-text3">
                    Sector
                  </label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full bg-dl-surface2 border border-dl-border rounded-lg text-dl-text2 font-mono text-[12px] px-3 py-2.5 outline-none focus:border-dl-amber cursor-pointer"
                  >
                    {SECTORS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>

                <StatusMessage success={success} error={error} />

                <div className="flex gap-2 pt-1">
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => { setName(''); setTicker(''); setError(''); setSuccess('') }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" disabled={loading} className="flex-[2]">
                    {loading ? 'Creating…' : 'Create Company →'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function StatusMessage({ success, error }: { success: string; error: string }) {
  if (error) return (
    <p className="font-mono text-[11px] text-dl-red bg-[rgba(224,85,85,0.08)] border border-[rgba(224,85,85,0.2)] rounded-lg px-3 py-2">
      ✗ {error}
    </p>
  )
  if (success) return (
    <p className="font-mono text-[11px] text-dl-green bg-[rgba(72,196,122,0.08)] border border-[rgba(72,196,122,0.2)] rounded-lg px-3 py-2 flex items-start gap-2">
      <CheckCircle2 size={13} className="mt-0.5 shrink-0" />
      {success}
    </p>
  )
  return null
}
