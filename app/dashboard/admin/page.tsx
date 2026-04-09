'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Link as LinkIcon, RefreshCw, CheckCircle2, Shield } from 'lucide-react'
import Topbar from '@/app/components/dashboard/Topbar'
import { Input } from '@/app/components/ui/Input'
import { Button } from '@/app/components/ui/Button'
import { companies as companiesApi, documents as docsApi } from '@/app/lib/api'
import { useCompanies } from '@/app/lib/CompaniesContext'
import { useAdmin } from '@/app/lib/useAdmin'

const SECTORS   = ['Technology', 'Healthcare', 'Automotive', 'Finance', 'Media', 'Energy', 'Consumer', 'Other']
const DOC_TYPES = ['10-K', '10-Q', '8-K', 'Annual Report', 'Prospectus', 'Other']

export default function AdminPage() {
  const router = useRouter()
  const { isAdmin, ready } = useAdmin()
  const { tickerMap, refresh } = useCompanies()

  // Only redirect once localStorage has been read (ready = true).
  // Without this, isAdmin is false on first render and redirects immediately
  // before the localStorage check completes.
  useEffect(() => {
    if (ready && !isAdmin) router.replace('/dashboard')
  }, [ready, isAdmin, router])

  // ── Create Company ─────────────────────────────────────────────────────────
  const [cName,    setCName]    = useState('')
  const [cTicker,  setCTicker]  = useState('')
  const [cSector,  setCSector]  = useState('Technology')
  const [cLoading, setCLoading] = useState(false)
  const [cSuccess, setCSuccess] = useState('')
  const [cError,   setCError]   = useState('')

  async function handleCreateCompany(e: FormEvent) {
    e.preventDefault()
    setCError(''); setCSuccess('')
    if (!cName.trim() || !cTicker.trim()) { setCError('Name and ticker are required'); return }
    setCLoading(true)
    try {
      await companiesApi.create({ name: cName, ticker: cTicker.toUpperCase(), sector: cSector })
      await refresh()
      setCSuccess(`Company "${cName}" (${cTicker.toUpperCase()}) created.`)
      setCName(''); setCTicker('')
    } catch (err: unknown) {
      setCError(err instanceof Error ? err.message : 'Failed to create company')
    } finally {
      setCLoading(false)
    }
  }

  // ── Ingest Document ────────────────────────────────────────────────────────
  const [dCompanyId, setDCompanyId] = useState('')
  const [dTitle,     setDTitle]     = useState('')
  const [dType,      setDType]      = useState('10-K')
  const [dUrl,       setDUrl]       = useState('')
  const [dYear,      setDYear]      = useState(String(new Date().getFullYear() - 1))
  const [dLoading,   setDLoading]   = useState(false)
  const [dSuccess,   setDSuccess]   = useState('')
  const [dError,     setDError]     = useState('')

  async function handleIngest(e: FormEvent) {
    e.preventDefault()
    setDError(''); setDSuccess('')
    if (!dCompanyId) { setDError('Select a company'); return }
    if (!dUrl.trim()) { setDError('PDF URL is required'); return }
    if (!dTitle.trim()) { setDError('Document title is required'); return }
    const year = parseInt(dYear)
    if (isNaN(year)) { setDError('Invalid fiscal year'); return }
    setDLoading(true)
    try {
      await docsApi.ingest({
        company_id:  dCompanyId,
        title:       dTitle,
        doc_type:    dType,
        source:      dUrl,
        fiscal_year: year,
      })
      setDSuccess(`"${dTitle}" ingested — chunks embedded into Qdrant.`)
      setDTitle(''); setDUrl('')
    } catch (err: unknown) {
      setDError(err instanceof Error ? err.message : 'Ingest failed')
    } finally {
      setDLoading(false)
    }
  }

  // Show nothing while we're waiting for localStorage to be read
  if (!ready) return null

  // Also show nothing if not admin (redirect is in flight)
  if (!isAdmin) return null

  return (
    <>
      <Topbar title="Admin" actionLabel="" />

      <div className="p-7 flex flex-col gap-6 max-w-2xl">

        {/* Admin badge */}
        <div className="flex items-center gap-2.5 px-4 py-3 bg-[rgba(232,160,32,0.06)] border border-[rgba(232,160,32,0.2)] rounded-xl">
          <Shield size={14} className="text-dl-amber shrink-0" />
          <div>
            <div className="font-mono text-[11px] text-dl-amber font-medium">Admin Access</div>
            <div className="font-mono text-[9px] text-dl-text3 mt-0.5">
              This panel is only visible to authorised administrators.
            </div>
          </div>
        </div>

        {/* ── Create Company ──────────────────────────────── */}
        <div className="bg-dl-surface border border-dl-border rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-dl-border flex items-center gap-2">
            <Plus size={13} className="text-dl-amber" />
            <span className="font-mono text-[10px] tracking-[1.2px] uppercase text-dl-text3">Create Company</span>
          </div>
          <form onSubmit={handleCreateCompany} className="px-5 py-5 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Company Name *"
                placeholder="e.g. Apple Inc."
                value={cName}
                onChange={(e) => setCName(e.target.value)}
                required
              />
              <Input
                label="Ticker *"
                placeholder="e.g. AAPL"
                value={cTicker}
                onChange={(e) => setCTicker(e.target.value.toUpperCase())}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] tracking-[1.2px] uppercase text-dl-text3">Sector</label>
              <select
                value={cSector}
                onChange={(e) => setCSector(e.target.value)}
                className="w-full bg-dl-surface2 border border-dl-border rounded-lg text-dl-text2 font-mono text-[12px] px-3 py-2.5 outline-none focus:border-dl-amber cursor-pointer"
              >
                {SECTORS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            <StatusMessage success={cSuccess} error={cError} />

            <div className="flex gap-2">
              <Button
                variant="ghost" type="button"
                onClick={() => { setCName(''); setCTicker(''); setCError(''); setCSuccess('') }}
                className="flex-1"
              >
                Clear
              </Button>
              <Button variant="primary" type="submit" disabled={cLoading} className="flex-[2] gap-2">
                {cLoading
                  ? <><RefreshCw size={12} className="animate-spin" /> Creating…</>
                  : <><Plus size={12} /> Create Company →</>}
              </Button>
            </div>
          </form>
        </div>

        {/* ── Ingest Document ─────────────────────────────── */}
        <div className="bg-dl-surface border border-dl-border rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-dl-border flex items-center gap-2">
            <LinkIcon size={13} className="text-dl-amber" />
            <span className="font-mono text-[10px] tracking-[1.2px] uppercase text-dl-text3">Ingest Document via URL</span>
          </div>
          <form onSubmit={handleIngest} className="px-5 py-5 flex flex-col gap-4">

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] tracking-[1.2px] uppercase text-dl-text3">Company *</label>
              <select
                value={dCompanyId}
                onChange={(e) => setDCompanyId(e.target.value)}
                className="w-full bg-dl-surface2 border border-dl-border rounded-lg text-dl-text2 font-mono text-[12px] px-3 py-2.5 outline-none focus:border-dl-amber cursor-pointer"
              >
                <option value="">— Select company —</option>
                {tickerMap.map((entry) => (
                  <option key={entry.row.id} value={entry.row.id}>
                    {entry.ticker} · {entry.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Document Title *"
              placeholder="e.g. Apple Inc. 10-K 2023"
              value={dTitle}
              onChange={(e) => setDTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] tracking-[1.2px] uppercase text-dl-text3">Doc Type</label>
                <select
                  value={dType}
                  onChange={(e) => setDType(e.target.value)}
                  className="w-full bg-dl-surface2 border border-dl-border rounded-lg text-dl-text2 font-mono text-[12px] px-3 py-2.5 outline-none focus:border-dl-amber cursor-pointer"
                >
                  {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <Input
                label="Fiscal Year *"
                placeholder="e.g. 2023"
                value={dYear}
                onChange={(e) => setDYear(e.target.value)}
                required
              />
            </div>

            <Input
              label="PDF URL *"
              type="url"
              placeholder="https://www.sec.gov/Archives/...pdf"
              value={dUrl}
              onChange={(e) => setDUrl(e.target.value)}
              required
            />

            <div className="bg-dl-surface2 border border-dl-border rounded-lg px-3.5 py-2.5">
              <div className="font-mono text-[9px] text-dl-text3 uppercase tracking-[1px] mb-1">Pipeline</div>
              <div className="font-mono text-[11px] text-dl-amber">
                URL → pymupdf4llm → chunk → fastembed → Qdrant upsert
              </div>
            </div>

            <StatusMessage success={dSuccess} error={dError} />

            <div className="flex gap-2">
              <Button
                variant="ghost" type="button"
                onClick={() => { setDTitle(''); setDUrl(''); setDError(''); setDSuccess('') }}
                className="flex-1"
              >
                Clear
              </Button>
              <Button variant="primary" type="submit" disabled={dLoading} className="flex-[2] gap-2">
                {dLoading
                  ? <><RefreshCw size={12} className="animate-spin" /> Ingesting…</>
                  : <><LinkIcon size={12} /> Ingest & Embed →</>}
              </Button>
            </div>
          </form>
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