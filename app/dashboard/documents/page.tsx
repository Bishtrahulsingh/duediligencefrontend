'use client'

import { useState, FormEvent, useEffect } from 'react'
import { Upload, RefreshCw, FileText, CheckCircle2, Search } from 'lucide-react'
import Topbar from '@/app/components/dashboard/Topbar'
import { Input } from '@/app/components/ui/Input'
import { Button } from '@/app/components/ui/Button'
import { cn } from '@/app/lib/utils'
import { documents as docsApi, Document } from '@/app/lib/api'
import { useCompanies } from '@/app/lib/CompaniesContext'

const DOC_TYPES = ['sec_filing', 'annual_report', 'pitch_deck', 'earnings_call', 'prospectus', 'other']

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i)

export default function DocumentsPage() {
  const { companies, loading: companiesLoading } = useCompanies()

  // ── Ingest form state ────────────────────────────────────
  const [url,       setUrl]       = useState('')
  const [title,     setTitle]     = useState('')
  const [companyId, setCompanyId] = useState('')
  const [docType,   setDocType]   = useState('sec_filing')
  const [fiscalYear,setFiscalYear]= useState(String(CURRENT_YEAR - 1))
  const [dragging,  setDragging]  = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [success,   setSuccess]   = useState('')
  const [error,     setError]     = useState('')

  // ── Document list state ──────────────────────────────────
  const [docs,        setDocs]        = useState<Document[]>([])
  const [docsLoading, setDocsLoading] = useState(false)
  const [filterTicker,setFilterTicker]= useState('')
  const [filterYear,  setFilterYear]  = useState(String(CURRENT_YEAR - 1))

  // Auto-select first company
  useEffect(() => {
    if (companies.length > 0 && !companyId) {
      setCompanyId(companies[0].id)
    }
    if (companies.length > 0 && !filterTicker) {
      setFilterTicker(companies[0].ticker ?? '')
    }
  }, [companies, companyId, filterTicker])

  async function fetchDocs() {
    if (!filterTicker) return
    setDocsLoading(true)
    try {
      const data = await docsApi.listForCompany(filterTicker, filterYear)
      setDocs(Array.isArray(data) ? data : [])
    } catch {
      setDocs([])
    } finally {
      setDocsLoading(false)
    }
  }

  // Reload docs when filter changes
  useEffect(() => {
    if (filterTicker) fetchDocs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterTicker, filterYear])

  async function handleIngest(e: FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    if (!companyId) { setError('Select a company first'); return }
    setError(''); setSuccess(''); setLoading(true)
    try {
      await docsApi.ingest({
        company_id: companyId,
        title: title || url,
        doc_type: docType,
        source: url,
        fiscal_year: Number(fiscalYear),
      })
      setSuccess('Document ingested — chunks embedded into Qdrant.')
      setUrl(''); setTitle('')
      // Refresh doc list if the ticker matches
      const selected = companies.find((c) => c.id === companyId)
      if (selected?.ticker === filterTicker) fetchDocs()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ingest failed')
    } finally {
      setLoading(false)
    }
  }

  const selectedCompany = companies.find((c) => c.id === companyId)

  return (
    <>
      <Topbar title="Documents" actionLabel="Ingest Document" onAction={() => document.getElementById('url-input')?.focus()} />

      <div className="p-7 grid grid-cols-1 gap-6">

        {/* ── Document list ──────────────────────────────────── */}
        <div>
          {/* Filter bar */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div>
              <div className="font-serif text-[16px] font-normal text-dl-text">Indexed Documents</div>
              <div className="font-mono text-[11px] text-dl-text3 mt-0.5">
                {docsLoading ? 'Loading…' : `${docs.length} document${docs.length !== 1 ? 's' : ''} found`}
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2 flex-wrap">
              {/* Ticker filter */}
              <select
                value={filterTicker}
                onChange={(e) => setFilterTicker(e.target.value)}
                className="bg-dl-surface2 border border-dl-border rounded-lg text-dl-text2 font-mono text-[11px] px-2.5 py-1.5 outline-none focus:border-dl-amber cursor-pointer"
              >
                {companiesLoading
                  ? <option>Loading…</option>
                  : companies.map((c) => (
                    <option key={c.id} value={c.ticker ?? ''}>{c.ticker} — {c.name}</option>
                  ))
                }
              </select>
              {/* Year filter */}
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="bg-dl-surface2 border border-dl-border rounded-lg text-dl-text2 font-mono text-[11px] px-2.5 py-1.5 outline-none focus:border-dl-amber cursor-pointer"
              >
                {YEARS.map((y) => <option key={y} value={String(y)}>FY{y}</option>)}
              </select>
              <button
                onClick={fetchDocs}
                disabled={docsLoading}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-dl-surface2 border border-dl-border rounded-lg font-mono text-[11px] text-dl-text3 hover:text-dl-amber hover:border-dl-amber transition-all disabled:opacity-50"
              >
                <RefreshCw size={11} className={docsLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>

          <div className="bg-dl-surface border border-dl-border rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_80px] px-5 py-2.5 border-b border-dl-border font-mono text-[10px] tracking-[1px] uppercase text-dl-text3">
              <span>Document</span>
              <span>Type</span>
              <span>Source</span>
              <span>Status</span>
            </div>

            {docsLoading ? (
              [0, 1, 2].map((i) => (
                <div key={i} className="grid grid-cols-[2fr_1fr_1fr_80px] px-5 py-3.5 border-b border-dl-border last:border-b-0 items-center animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-[34px] h-[34px] rounded-lg bg-dl-surface3 shrink-0" />
                    <div className="flex flex-col gap-1.5">
                      <div className="w-28 h-3 rounded bg-dl-surface3" />
                      <div className="w-16 h-2 rounded bg-dl-surface3" />
                    </div>
                  </div>
                  <div className="w-16 h-3 rounded bg-dl-surface3" />
                  <div className="w-20 h-3 rounded bg-dl-surface3" />
                  <div className="w-12 h-3 rounded bg-dl-surface3" />
                </div>
              ))
            ) : docs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-dl-text3">
                <FileText size={28} className="mb-3 opacity-20" />
                <div className="font-serif text-[15px] text-dl-text2 mb-1">No documents found</div>
                <div className="font-mono text-[11px]">
                  {filterTicker ? `No docs for ${filterTicker} FY${filterYear}` : 'Select a company to view documents'}
                </div>
              </div>
            ) : (
              docs.map((doc) => (
                <div
                  key={doc.id}
                  className="grid grid-cols-[2fr_1fr_1fr_80px] px-5 py-3.5 border-b border-dl-border last:border-b-0 items-center hover:bg-dl-surface2 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-[34px] h-[34px] rounded-lg border bg-dl-surface3 border-dl-border text-dl-amber shrink-0">
                      <FileText size={13} />
                    </div>
                    <div>
                      <div className="text-[13px] font-medium text-dl-text">{doc.title}</div>
                      <div className="font-mono text-[10px] text-dl-text3 mt-0.5">
                        FY{doc.fiscal_year} · {doc.ticker}
                      </div>
                    </div>
                  </div>
                  <div className="font-mono text-[11px] text-dl-text2">{doc.doc_type}</div>
                  <div className="font-mono text-[10px] text-dl-text3 truncate max-w-[120px]">
                    {doc.source ? (
                      <a href={doc.source} target="_blank" rel="noreferrer" className="hover:text-dl-amber transition-colors truncate block">
                        {new URL(doc.source).hostname}
                      </a>
                    ) : '—'}
                  </div>
                  <div>
                    <span className="font-mono text-[11px] text-dl-green">● indexed</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        </div>
    </>
  )
}
