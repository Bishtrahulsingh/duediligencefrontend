'use client'

import { useState, FormEvent } from 'react'
import { Send, RefreshCw, CheckCircle2 } from 'lucide-react'
import Topbar from '@/app/components/dashboard/Topbar'
import CompaniesTable from '@/app/components/dashboard/CompaniesTable'
import { Input } from '@/app/components/ui/Input'
import { Button } from '@/app/components/ui/Button'
import { cn } from '@/app/lib/utils'
import { useCompanies } from '@/app/lib/CompaniesContext'

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i)

export default function CompaniesPage() {
  const { refresh } = useCompanies()

  const [name,    setName]    = useState('')
  const [ticker,  setTicker]  = useState('')
  const [eYears,  setEYears]  = useState<number[]>([CURRENT_YEAR - 1])

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error,   setError]   = useState('')

  function toggleYear(y: number) {
    setEYears((prev) =>
      prev.includes(y) ? prev.filter((x) => x !== y) : [...prev, y]
    )
  }

  async function handleRequest(e: FormEvent) {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!name.trim()) { setError('Company name is required'); return }
    if (eYears.length === 0) { setError('Select at least one fiscal year'); return }
    setLoading(true)
    // Simulated delay — backend not ready yet
    await new Promise((res) => setTimeout(res, 1200))
    setLoading(false)
    const label = ticker.trim() ? `${name} (${ticker.toUpperCase()})` : name
    setSuccess(`Request received for ${label} — ${eYears.sort((a, b) => b - a).join(', ')}. We'll notify you once the filings are indexed.`)
    setName(''); setTicker(''); setEYears([CURRENT_YEAR - 1])
  }

  return (
    <>
      <Topbar title="Companies" actionLabel="Request Filings" />

      <div className="p-7 lg:grid lg:grid-cols-[1fr_360px] gap-6 flex flex-col">

        {/* ── Table ───────────────────────────────────────────── */}
        <div>
          <div className="mb-4">
            <div className="font-serif text-[16px] font-normal text-dl-text">Tracked Companies</div>
            <div className="font-mono text-[11px] text-dl-text3 mt-0.5">
              Companies with indexed filings · click a row to analyse
            </div>
          </div>
          <CompaniesTable clickable />
        </div>

        {/* ── Request panel ───────────────────────────────────── */}
        <div>
          <div className="bg-dl-surface border border-dl-border rounded-xl p-5">

            <div className="mb-5">
              <div className="font-serif text-[15px] text-dl-text">Request Filings</div>
              <div className="font-mono text-[10px] text-dl-text3 mt-1 leading-relaxed">
                Tell us which company and years you need. We'll source and index the filings for you.
              </div>
            </div>

            <form onSubmit={handleRequest} className="flex flex-col gap-4">
              <Input
                label="Company Name *"
                placeholder="e.g. Apple Inc."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Ticker Symbol"
                placeholder="e.g. AAPL  (optional)"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
              />

              {/* Year picker */}
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

              {/* Status */}
              {error && (
                <p className="font-mono text-[11px] text-dl-red bg-[rgba(224,85,85,0.08)] border border-[rgba(224,85,85,0.2)] rounded-lg px-3 py-2">
                  ✗ {error}
                </p>
              )}
              {success && (
                <p className="font-mono text-[11px] text-dl-green bg-[rgba(72,196,122,0.08)] border border-[rgba(72,196,122,0.2)] rounded-lg px-3 py-2 flex items-start gap-2">
                  <CheckCircle2 size={13} className="mt-0.5 shrink-0" />
                  {success}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => { setName(''); setTicker(''); setEYears([CURRENT_YEAR - 1]); setError(''); setSuccess('') }}
                  className="flex-1"
                >
                  Clear
                </Button>
                <Button variant="primary" type="submit" disabled={loading} className="flex-[2] gap-2">
                  {loading ? (
                    <><RefreshCw size={12} className="animate-spin" /> Submitting…</>
                  ) : (
                    <><Send size={12} /> Request Filings →</>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Info note */}
          <div className="mt-3 bg-dl-surface border border-dl-border rounded-xl px-4 py-3">
            <div className="font-mono text-[9px] text-dl-text3 uppercase tracking-[1px] mb-1">How it works</div>
            <div className="font-mono text-[11px] text-dl-text2 leading-relaxed">
              Filings are sourced from SEC EDGAR, chunked, and embedded into the vector store. Once indexed, the company appears in your table and is ready to analyse.
            </div>
          </div>
        </div>

      </div>
    </>
  )
}