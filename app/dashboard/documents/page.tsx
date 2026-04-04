'use client'

import { useState, FormEvent } from 'react'
import { Upload } from 'lucide-react'
import Topbar from '@/app/components/dashboard/Topbar'
import { Input } from '@/app/components/ui/Input'
import { Button } from '@/app/components/ui/Button'
import { cn } from '@/app/lib/utils'

const DEMO_DOCS = [
  { name: 'Apple 10-K 2024',          company: 'Apple Inc.',    type: 'sec_filing',    chunks: 847,   status: 'indexed',  age: '3 days ago' },
  { name: 'Tesla 10-K 2024',          company: 'Tesla, Inc.',   type: 'sec_filing',    chunks: 1203,  status: 'indexed',  age: '1 week ago' },
  { name: 'Shareholder Letter 2024',  company: 'Apple Inc.',    type: 'annual_report', chunks: null,  status: 'pending',  age: 'just now'   },
  { name: 'Netflix Q2 2024 10-Q',     company: 'Netflix, Inc.', type: 'sec_filing',    chunks: 429,   status: 'indexed',  age: '5 days ago' },
  { name: 'Spotify Annual Report',    company: 'Spotify AB',    type: 'annual_report', chunks: 364,   status: 'indexed',  age: '2 weeks ago' },
]

const DOC_TYPES = ['sec_filing', 'annual_report', 'pitch_deck', 'other']
const COMPANIES = ['Apple Inc.', 'Tesla, Inc.', 'Netflix, Inc.', 'Spotify AB']

export default function DocumentsPage() {
  const base_url = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''
  const [url,      setUrl]      = useState('')
  const [title,    setTitle]    = useState('')
  const [company,  setCompany]  = useState('Apple Inc.')
  const [docType,  setDocType]  = useState('sec_filing')
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [error,    setError]    = useState('')
  const [dragging, setDragging] = useState(false)

  async function handleIngest(e: FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setError(''); setLoading(true)
    try {
      // You need a company_id — in production fetch from your companies list
      // Here we use a placeholder UUID
      const res = await fetch(`${base_url}/api/v1/store/document`, {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: '00000000-0000-0000-0000-000000000001',
          title,
          doc_type: docType,
          source:   url,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.detail ?? 'Ingest failed')
        return
      }
      setSuccess(true)
      setUrl(''); setTitle('')
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Network error — is the API running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Topbar title="Documents" actionLabel="Ingest Document" onAction={() => {}} />

      <div className="p-7 grid grid-cols-[1fr_360px] gap-6">
        {/* Document list */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-serif text-[16px] font-normal text-dl-text">All Documents</div>
              <div className="font-mono text-[11px] text-dl-text3 mt-0.5">{DEMO_DOCS.length} documents across {COMPANIES.length} companies</div>
            </div>
          </div>

          <div className="bg-dl-surface border border-dl-border rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_80px] px-5 py-2.5 border-b border-dl-border font-mono text-[10px] tracking-[1px] uppercase text-dl-text3">
              <span>Document</span>
              <span>Company</span>
              <span>Chunks</span>
              <span>Status</span>
            </div>

            {DEMO_DOCS.map((doc) => (
              <div key={doc.name} className="grid grid-cols-[2fr_1fr_1fr_80px] px-5 py-3.5 border-b border-dl-border last:border-b-0 items-center hover:bg-dl-surface2 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'flex items-center justify-center w-[34px] h-[34px] rounded-lg border shrink-0',
                    doc.status === 'indexed' ? 'bg-dl-surface3 border-dl-border text-dl-amber' : 'bg-dl-surface3 border-dl-border text-dl-yellow'
                  )}>
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-dl-text">{doc.name}</div>
                    <div className="font-mono text-[10px] text-dl-text3 mt-0.5">{doc.type} · {doc.age}</div>
                  </div>
                </div>
                <div className="font-mono text-[12px] text-dl-text2">{doc.company}</div>
                <div className="font-mono text-[12px] text-dl-text2">
                  {doc.chunks ? doc.chunks.toLocaleString() : '—'}
                </div>
                <div>
                  <span className={cn('font-mono text-[11px]', doc.status === 'indexed' ? 'text-dl-green' : 'text-dl-yellow')}>
                    ● {doc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ingest form */}
        <div>
          <div className="mb-4">
            <div className="font-serif text-[16px] font-normal text-dl-text">Ingest Document</div>
          </div>

          <div className="bg-dl-surface border border-dl-border rounded-xl p-5">
            <form onSubmit={handleIngest} className="flex flex-col gap-4">
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false) }}
                className={cn(
                  'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all',
                  dragging
                    ? 'border-dl-amber bg-[rgba(232,160,32,0.08)] text-dl-amber'
                    : 'border-dl-border2 bg-dl-surface2 text-dl-text3 hover:border-dl-amber hover:bg-[rgba(232,160,32,0.05)] hover:text-dl-amber'
                )}
              >
                <Upload size={26} className="mx-auto mb-2 opacity-70" />
                <div className="text-[12px] font-medium">Drop a PDF or paste a URL below</div>
                <div className="font-mono text-[10px] mt-1 opacity-70">10-K · 10-Q · Annual Reports · Prospectus</div>
              </div>

              <div className="flex items-center gap-3 font-mono text-[10px] text-dl-text3 uppercase tracking-[1px]">
                <div className="flex-1 h-px bg-dl-border" /> or paste URL <div className="flex-1 h-px bg-dl-border" />
              </div>

              <Input
                label="Document URL"
                type="url"
                placeholder="https://sec.gov/Archives/edgar/data/…"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <Input
                label="Title"
                placeholder="Apple 10-K 2024"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] tracking-[1.2px] uppercase text-dl-text3">Company</label>
                  <select
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-dl-surface2 border border-dl-border rounded-lg text-dl-text2 font-mono text-[12px] px-3 py-2.5 outline-none focus:border-dl-amber cursor-pointer"
                  >
                    {COMPANIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] tracking-[1.2px] uppercase text-dl-text3">Doc Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full bg-dl-surface2 border border-dl-border rounded-lg text-dl-text2 font-mono text-[12px] px-3 py-2.5 outline-none focus:border-dl-amber cursor-pointer"
                  >
                    {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* API hint */}
              <div className="bg-dl-surface2 border border-dl-border rounded-lg px-3.5 py-2.5">
                <div className="font-mono text-[9px] text-dl-text3 uppercase tracking-[1px] mb-1">API Endpoint</div>
                <code className="font-mono text-[11px] text-dl-amber">POST /api/v1/store/document</code>
              </div>

              {error && (
                <p className="font-mono text-[11px] text-dl-red bg-[rgba(224,85,85,0.08)] border border-[rgba(224,85,85,0.2)] rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              {success && (
                <p className="font-mono text-[11px] text-dl-green bg-[rgba(72,196,122,0.08)] border border-[rgba(72,196,122,0.2)] rounded-lg px-3 py-2">
                  ✓ Document ingested and embedding started
                </p>
              )}

              <Button variant="primary" type="submit" fullWidth disabled={loading || !url.trim()} className="gap-2">
                <Upload size={13} />
                {loading ? 'Ingesting…' : 'Ingest & Embed →'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
