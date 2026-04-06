'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Shield, AlertTriangle, HelpCircle, BarChart2, RefreshCw } from 'lucide-react'
import Topbar from '@/app/components/dashboard/Topbar'
import { cn } from '@/app/lib/utils'
import { analysis as analysisApi, StructuredAnalysis, Company } from '@/app/lib/api'
import { useCompanies } from '@/app/lib/CompaniesContext'

const PIPELINE_STEPS = [
  { name: 'HyDE Retrieval',   desc: 'Hypothetical document embedding · top 20' },
  { name: 'BM25 + RRF',       desc: 'Sparse + dense hybrid reranking'           },
  { name: 'Cross-encoder',    desc: 'Reranker · top 5 chunks'                   },
  { name: 'Analyst LLM',      desc: 'gemini-2.5-flash · initial answer'         },
  { name: 'Judge LLM',        desc: 'gpt-oss-20b · faithfulness + polish'       },
]

const HINTS = [
  'Key revenue risks?',
  'Competitive moat analysis',
  'Debt & liquidity position',
  'What are the red flags?',
  'Growth drivers for next FY',
  'Regulatory exposure',
]

const riskColor: Record<string, string> = {
  high:   'text-dl-red    bg-[rgba(224,85,85,0.15)]',
  medium: 'text-dl-yellow bg-[rgba(232,192,64,0.15)]',
  low:    'text-dl-green  bg-[rgba(72,196,122,0.12)]',
}

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 font-mono text-[10px] tracking-[1.2px] uppercase text-dl-amber">
      <span className="w-3.5 h-px bg-dl-amber opacity-50" />
      {icon}
      {label}
    </div>
  )
}

function InfoCard({ title, action, children }: {
  title: string
  action?: { label: string; onClick: () => void }
  children: React.ReactNode
}) {
  return (
    <div className="bg-dl-surface border border-dl-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-dl-border font-mono text-[10px] tracking-[1.2px] uppercase text-dl-text3">
        {title}
        {action && (
          <button onClick={action.onClick} className="text-dl-text3 hover:text-dl-amber transition-colors normal-case tracking-normal text-[11px]">
            {action.label}
          </button>
        )}
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  )
}

const AVATAR_COLORS = [
  'from-[#a06510] to-dl-amber',
  'from-[#1060a0] to-[#4090e0]',
  'from-[#a02020] to-[#e05550]',
  'from-[#107840] to-[#48c47a]',
  'from-[#6010a0] to-[#a050e0]',
]

export default function AnalysePage() {
  const searchParams = useSearchParams()
  const { companies, loading: companiesLoading } = useCompanies()

  // Resolve initial company from URL query params (set when clicking from table)
  const paramTicker = searchParams.get('ticker')
  const paramYear   = searchParams.get('fiscal_year')
  const paramName   = searchParams.get('name')

  const [selectedId, setSelectedId] = useState<string>('')

  // Once companies load, select the correct one (from URL params or first)
  useEffect(() => {
    if (companies.length === 0) return
    if (paramTicker) {
      const match = companies.find((c) => c.ticker === paramTicker)
      if (match) { setSelectedId(match.id); return }
    }
    if (!selectedId) setSelectedId(companies[0].id)
  }, [companies, paramTicker, selectedId])

  const company: Company | undefined = companies.find((c) => c.id === selectedId) ?? companies[0]

  const [query,      setQuery]      = useState(paramName ? `Key risks for ${paramName}?` : '')
  const [running,    setRunning]    = useState(false)
  const [streamText, setStreamText] = useState('')
  const [result,     setResult]     = useState<StructuredAnalysis | null>(null)
  const [error,      setError]      = useState('')
  const [activeStep, setActiveStep] = useState(-1)
  const resultRef = useRef<HTMLDivElement>(null)

  async function runAnalysis() {
    if (!query.trim() || running || !company) return
    setRunning(true)
    setStreamText('')
    setResult(null)
    setError('')
    setActiveStep(0)

    // Step progression simulation while waiting
    const stepTimer = setInterval(() => {
      setActiveStep((s) => (s < PIPELINE_STEPS.length - 1 ? s + 1 : s))
    }, 900)

    try {
      const fiscal_year = company.fiscal_year ?? Number(paramYear) ?? new Date().getFullYear() - 1
      const data = await analysisApi.query({
        query,
        company_name:    company.name,
        collection_name: 'sec_filings',
        ticker:          company.ticker ?? '',
        fiscal_year,
      })

      const response = data.response
      if (typeof response === 'string') {
        // Try to parse as JSON
        try {
          const parsed = JSON.parse(response) as StructuredAnalysis
          setResult(parsed)
        } catch {
          setStreamText(response)
        }
      } else {
        setResult(response as StructuredAnalysis)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      clearInterval(stepTimer)
      setActiveStep(PIPELINE_STEPS.length - 1)
      setRunning(false)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    }
  }

  const hasResult = result || streamText

  return (
    <>
      <Topbar title="Analyse" actionLabel="New Query" onAction={() => { setResult(null); setStreamText(''); setQuery(''); setActiveStep(-1) }} />

      <div className="md:p-7 md:flex gap-5">

        {/* ── LEFT: Stream panel ─────────────────────────────── */}
        <div className="py-5 flex-1 flex flex-col bg-dl-surface border border-dl-border rounded-xl">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-dl-border">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#e8a020" strokeWidth={2}>
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <span className="font-serif text-[15px] text-dl-text">Analysis Stream</span>

            {/* Company selector */}
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              disabled={companiesLoading}
              className="ml-auto bg-dl-surface2 border border-dl-border text-dl-text2 font-mono text-[11px] px-2.5 py-1.5 rounded-lg outline-none focus:border-dl-amber cursor-pointer disabled:opacity-50"
            >
              {companiesLoading
                ? <option>Loading…</option>
                : companies.length === 0
                ? <option>— No companies —</option>
                : companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.ticker} · {c.name}{c.fiscal_year ? ` · FY${c.fiscal_year}` : ''}
                  </option>
                ))
              }
            </select>
          </div>

          {/* Result area */}
          <div ref={resultRef} className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 min-h-[320px] max-h-[520px]">

            {/* Running indicator */}
            {running && (
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-[rgba(232,160,32,0.06)] border border-[rgba(232,160,32,0.2)] rounded-lg font-mono text-[11px] text-dl-amber animate-fade-in">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-dl-amber animate-blink" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
                {PIPELINE_STEPS[activeStep]?.name ?? 'Processing'} — {PIPELINE_STEPS[activeStep]?.desc ?? ''}
              </div>
            )}

            {error && (
              <div className="px-3.5 py-2.5 bg-[rgba(224,85,85,0.08)] border border-[rgba(224,85,85,0.2)] rounded-lg font-mono text-[11px] text-dl-red">
                ✗ {error}
              </div>
            )}

            {/* Plain text result */}
            {streamText && !result && (
              <div className="font-mono text-[12px] text-dl-text2 leading-relaxed whitespace-pre-wrap">
                {streamText}
              </div>
            )}

            {/* Structured result */}
            {result && (
              <div className="flex flex-col gap-4 animate-fade-in">

                {result.executive_summary && (
                  <div className="flex flex-col gap-2">
                    <SectionLabel icon={<BarChart2 size={12}/>} label="Executive Summary" />
                    <div className="font-serif text-[15px] font-light italic text-dl-text leading-[1.7] px-4 py-3.5 bg-[rgba(232,160,32,0.05)] border-l-2 border-dl-amber rounded-r-lg">
                      {result.executive_summary}
                    </div>
                  </div>
                )}

                {result.key_risks && result.key_risks.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <SectionLabel icon={<AlertTriangle size={12}/>} label="Key Risks" />
                    <div className="flex flex-col gap-2">
                      {result.key_risks.map((r, i) => (
                        <div key={i} className="flex items-start gap-3 px-3.5 py-3 bg-dl-surface2 border border-dl-border rounded-lg hover:border-dl-border2 transition-colors">
                          <span className={cn(
                            'inline-flex px-2 py-0.5 rounded-full font-mono text-[9px] font-medium shrink-0 mt-0.5',
                            riskColor[r.severity?.toLowerCase()] ?? riskColor.medium
                          )}>
                            {r.severity?.toUpperCase() ?? 'MED'}
                          </span>
                          <div>
                            <p className="text-[13px] text-dl-text2 leading-relaxed">{r.risk}</p>
                            {r.evidence && <p className="font-mono text-[10px] text-dl-text3 mt-1">Evidence: {r.evidence}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.open_questions && result.open_questions.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <SectionLabel icon={<HelpCircle size={12}/>} label="Open Questions" />
                    <div className="flex flex-col gap-1.5">
                      {result.open_questions.map((q, i) => (
                        <div key={i} className="flex items-start gap-2.5 px-3.5 py-2.5 bg-dl-surface2 border border-dl-border rounded-lg text-[13px] text-dl-text2 leading-relaxed">
                          <span className="font-mono text-[10px] text-dl-text3 shrink-0 mt-0.5 min-w-[22px]">
                            {String(i + 1).padStart(2, '0')}.
                          </span>
                          {typeof q === 'string' ? q : q.question}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.confidence !== undefined && result.confidence !== null && (
                  <div className="flex flex-col gap-2">
                    <SectionLabel icon={<Shield size={12}/>} label="Confidence Score" />
                    <div className="flex items-center gap-4 px-4 py-3.5 bg-dl-surface2 border border-dl-border rounded-lg">
                      <span className="font-serif text-[36px] font-light text-dl-amber leading-none">
                        {typeof result.confidence === 'number' ? result.confidence.toFixed(2) : result.confidence}
                      </span>
                      <div className="flex-1">
                        <div className="font-mono text-[9px] text-dl-text3 uppercase tracking-[1px] mb-1.5">Context Coverage</div>
                        <div className="h-1.5 bg-dl-surface3 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full conf-bar-fill"
                            style={{ width: `${typeof result.confidence === 'number' ? result.confidence * 100 : 80}%` }}
                          />
                        </div>
                        <div className="font-mono text-[10px] text-dl-text3 mt-1.5">
                          {typeof result.confidence === 'number' && result.confidence >= 0.8
                            ? 'Strong evidence — well grounded'
                            : typeof result.confidence === 'number' && result.confidence >= 0.6
                            ? 'Moderate support — some gaps'
                            : 'Weak support — limited context'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Empty state */}
            {!running && !hasResult && !error && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-dl-text3">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="mb-3 opacity-30">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                <div className="font-serif text-[16px] text-dl-text2 mb-1">No analysis yet</div>
                <div className="font-mono text-[11px]">
                  {company ? `Ask about ${company.name} below` : 'Select a company and enter a query'}
                </div>
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="border-t border-dl-border px-5 py-4 flex flex-col gap-3">
            <div className="flex flex-wrap gap-1.5">
              {HINTS.map((h) => (
                <button
                  key={h}
                  onClick={() => setQuery(h)}
                  className="px-2.5 py-1 bg-dl-surface2 border border-dl-border rounded-full font-mono text-[11px] text-dl-text3 hover:border-dl-amber hover:text-dl-amber hover:bg-[rgba(232,160,32,0.05)] transition-all"
                >
                  {h}
                </button>
              ))}
            </div>
            <div className="flex gap-2 items-end">
              <textarea
                rows={1}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); runAnalysis() } }}
                placeholder={company ? `Ask about ${company.name}'s filings…` : 'Select a company first…'}
                disabled={!company || companiesLoading}
                className="flex-1 bg-dl-surface2 border border-dl-border rounded-lg text-dl-text text-[13px] px-3.5 py-2.5 outline-none resize-none placeholder:text-dl-text3 focus:border-dl-amber focus:shadow-[0_0_0_3px_rgba(232,160,32,0.08)] transition-all leading-relaxed disabled:opacity-50"
              />
              <button
                onClick={runAnalysis}
                disabled={running || !query.trim() || !company}
                className="flex items-center gap-1.5 px-4 h-[44px] text-[13px] font-medium text-dl-bg bg-dl-amber rounded-lg hover:bg-[#f0b030] transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {running
                  ? <><RefreshCw size={13} className="animate-spin" /> Running…</>
                  : <>Analyse <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>
                }
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Info panel ──────────────────────────────── */}
        <div className="shrink-0 flex flex-col gap-3.5 w-full md:w-[260px]">

          {/* Company card */}
          <InfoCard title="Selected Company">
            {companiesLoading ? (
              <div className="animate-pulse flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-dl-surface3 shrink-0" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="w-24 h-3 rounded bg-dl-surface3" />
                  <div className="w-16 h-2 rounded bg-dl-surface3" />
                </div>
              </div>
            ) : companies.length === 0 ? (
              <div className="font-mono text-[11px] text-dl-text3 py-2">
                No companies found.{' '}
                <a href="/dashboard/companies" className="text-dl-amber hover:underline">Add one →</a>
              </div>
            ) : company ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br font-mono text-[13px] font-medium text-dl-bg shrink-0',
                    AVATAR_COLORS[companies.indexOf(company) % AVATAR_COLORS.length]
                  )}>
                    {company.name.split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <div className="text-[14px] font-medium text-dl-text">{company.name}</div>
                    <div className="font-mono text-[10px] text-dl-text3 mt-0.5">
                      {company.ticker}{company.fiscal_year ? ` · FY${company.fiscal_year}` : ''}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['sec_filings', company.sector, company.ticker].filter(Boolean).map((t) => (
                    <span key={t} className={cn(
                      'font-mono text-[9px] px-2 py-0.5 rounded border',
                      t === 'sec_filings'
                        ? 'text-dl-amber border-[rgba(232,160,32,0.3)] bg-[rgba(232,160,32,0.08)]'
                        : 'text-dl-text3 border-dl-border2 bg-dl-surface2'
                    )}>{t}</span>
                  ))}
                </div>
              </>
            ) : null}
          </InfoCard>

          {/* Pipeline steps */}
          <InfoCard title="LLM Pipeline">
            <div className="flex flex-col gap-0">
              {PIPELINE_STEPS.map(({ name, desc }, i) => {
                const done = running ? i < activeStep : (hasResult ? true : false)
                const active = running && i === activeStep
                return (
                  <div key={name} className="flex gap-3 pb-3.5 last:pb-0">
                    <div className="flex flex-col items-center shrink-0">
                      <div className={cn(
                        'flex items-center justify-center w-[22px] h-[22px] rounded-full border font-mono text-[9px]',
                        done   ? 'bg-[rgba(72,196,122,0.12)] border-dl-green text-dl-green'
                        : active ? 'bg-[rgba(232,160,32,0.10)] border-dl-amber text-dl-amber'
                        : 'bg-dl-surface2 border-dl-border2 text-dl-text3'
                      )}>
                        {done ? '✓' : active ? '→' : i + 1}
                      </div>
                      {i < PIPELINE_STEPS.length - 1 && (
                        <div className={cn('flex-1 w-px mt-1', done ? 'bg-dl-green opacity-30' : 'bg-dl-border')} style={{ minHeight: '14px' }} />
                      )}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <div className="text-[12px] font-medium text-dl-text">{name}</div>
                      <div className="font-mono text-[10px] text-dl-text3 mt-0.5">{desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </InfoCard>

          {/* All companies quick-switch */}
          {companies.length > 1 && (
            <InfoCard title="Switch Company">
              <div className="flex flex-col gap-0">
                {companies.map((c, idx) => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedId(c.id); setResult(null); setStreamText(''); setError(''); setActiveStep(-1) }}
                    className={cn(
                      'flex items-center gap-2.5 py-2.5 border-b border-dl-border last:border-b-0 w-full text-left transition-colors',
                      c.id === selectedId ? 'text-dl-amber' : 'text-dl-text2 hover:text-dl-text'
                    )}
                  >
                    <div className={cn(
                      'flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br shrink-0 font-mono text-[9px] font-medium text-dl-bg',
                      AVATAR_COLORS[idx % AVATAR_COLORS.length]
                    )}>
                      {c.name.split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] truncate">{c.name}</div>
                      <div className="font-mono text-[10px] text-dl-text3">{c.ticker}{c.fiscal_year ? ` · FY${c.fiscal_year}` : ''}</div>
                    </div>
                    {c.id === selectedId && <span className="w-1.5 h-1.5 rounded-full bg-dl-amber" />}
                  </button>
                ))}
              </div>
            </InfoCard>
          )}
        </div>
      </div>
    </>
  )
}
