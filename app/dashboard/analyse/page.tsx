'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Shield, AlertTriangle, HelpCircle, BarChart2,
  RefreshCw, CheckCircle, XCircle, BookOpen, Activity,
  ExternalLink, FileText, X,
} from 'lucide-react'
import Topbar from '@/app/components/dashboard/Topbar'
import { cn } from '@/app/lib/utils'
import { analysis as analysisApi } from '@/app/lib/api'
import { useCompanies, TickerEntry } from '@/app/lib/CompaniesContext'

// ── Types ─────────────────────────────────────────────────────────────────────

interface KeyRisk {
  risk: string
  severity: 'high' | 'medium' | 'low' | string
  evidence?: string
  source_url?: string
}

interface OpenQuestion {
  question: string
  decision_impact?: string
}

interface Source {
  source_url: string
  snippet: string
}

interface PolishedAnswer {
  executive_summary?: string
  key_risks?: KeyRisk[]
  open_questions?: (OpenQuestion | string)[]
  confidence?: number | string
  summary?: string
  sources?: Source[]
}

interface EvidenceBlock {
  supporting_chunk_index: number | null
  supporting: string | null
  supporting_source_url: string | null
  contradicting_chunk_index: number | null
  contradicting: string | null
  contradicting_source_url: string | null
}

interface AnalysisResponse {
  polished_answer: PolishedAnswer
  faithfulness: number
  answer_relevance: number
  context_precision: number
  verdict: 'pass' | 'fail'
  issues: string[]
  hallucinated_claims: string[]
  evidence: EvidenceBlock
}

function parseResponse(raw: unknown): AnalysisResponse | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const inner = (r.response && typeof r.response === 'object')
    ? r.response as Record<string, unknown>
    : r
  if (!inner.polished_answer) return null
  return {
    polished_answer:   inner.polished_answer   as PolishedAnswer,
    faithfulness:      (inner.faithfulness      as number) ?? 0,
    answer_relevance:  (inner.answer_relevance  as number) ?? 0,
    context_precision: (inner.context_precision as number) ?? 0,
    verdict:           (inner.verdict           as 'pass' | 'fail') ?? 'fail',
    issues:            (inner.issues            as string[]) ?? [],
    hallucinated_claims: (inner.hallucinated_claims as string[]) ?? [],
    evidence: (inner.evidence as EvidenceBlock) ?? {
      supporting_chunk_index: null, supporting: null, supporting_source_url: null,
      contradicting_chunk_index: null, contradicting: null, contradicting_source_url: null,
    },
  }
}

// ── PDF Viewer Modal ──────────────────────────────────────────────────────────

function PdfModal({
  url,
  snippet,
  onClose,
}: {
  url: string
  snippet: string
  onClose: () => void
}) {
  const hashIdx = url.indexOf('#page=')
  const baseUrl = hashIdx !== -1 ? url.slice(0, hashIdx) : url
  const pageNum = hashIdx !== -1 ? url.slice(hashIdx + 6) : '1'
  const fileName = baseUrl.split('/').pop() ?? 'document.pdf'

  function highlightSnippet(text: string) {
    return text.split(/(\d[\d,.]*(?:\s*(?:million|billion|thousand|%))?)/gi).map((part, i) =>
      /^\d/.test(part)
        ? <strong key={i} className="text-dl-amber font-semibold">{part}</strong>
        : <span key={i}>{part}</span>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-2xl bg-dl-surface border border-dl-border rounded-xl flex flex-col overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-dl-border shrink-0">
          <FileText size={14} className="text-dl-amber shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[11px] text-dl-text truncate">{fileName}</div>
            <div className="font-mono text-[9px] text-dl-text3 mt-0.5">Page {pageNum}</div>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-mono text-[10px] text-dl-text3 hover:text-dl-amber transition-colors px-2.5 py-1.5 border border-dl-border hover:border-dl-amber rounded-lg"
          >
            <ExternalLink size={11} /> Open PDF →
          </a>
          <button onClick={onClose} className="text-dl-text3 hover:text-dl-red transition-colors p-1 ml-1">
            <X size={16} />
          </button>
        </div>

        {/* Page indicator */}
        <div className="flex items-center gap-3 px-4 py-3 bg-dl-surface2 border-b border-dl-border shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(232,160,32,0.08)] border border-[rgba(232,160,32,0.2)]">
            <span className="font-mono text-[9px] uppercase tracking-[1px] text-dl-amber">Page</span>
            <span className="font-mono text-[15px] font-semibold text-dl-amber leading-none">{pageNum}</span>
          </div>
          <div className="font-mono text-[10px] text-dl-text3 leading-relaxed">
            Evidence extracted from this page. Click <span className="text-dl-amber">Open PDF →</span> to view in context.
          </div>
        </div>

        {/* Evidence text */}
        <div className="px-5 py-5 flex flex-col gap-3">
          <div className="font-mono text-[9px] uppercase tracking-[1.2px] text-dl-text3">Extracted Evidence</div>
          <div className="px-4 py-4 bg-[rgba(232,160,32,0.04)] border border-[rgba(232,160,32,0.15)] rounded-xl font-mono text-[12px] text-dl-text2 leading-[1.8]">
            {highlightSnippet(snippet)}
          </div>
          <div className="font-mono text-[9px] text-dl-text3 leading-relaxed">
            Numbers highlighted in <span className="text-dl-amber">amber</span>. Open the PDF to see surrounding context.
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-5 pb-5">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-dl-amber text-dl-bg font-mono text-[12px] font-medium rounded-lg hover:bg-[#f0b030] transition-colors"
          >
            <ExternalLink size={13} />
            Open PDF at Page {pageNum}
          </a>
        </div>
      </div>
    </div>
  )
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PIPELINE_STEPS = [
  { name: 'HyDE Retrieval', desc: 'Hypothetical doc embedding · top 20' },
  { name: 'BM25 + RRF',     desc: 'Sparse + dense hybrid reranking'      },
  { name: 'Cross-encoder',  desc: 'Reranker · top 5 chunks'              },
  { name: 'Analyst LLM',    desc: '· initial answer'                     },
  { name: 'Judge LLM',      desc: '· faithfulness + polish'              },
]

const HINTS = [
  'What risks does the company mention?',
  "What is the company's primary revenue source?",
  'Are there any ongoing legal issues?',
  'What is the current debt level?',
  'Who are the main competitors?',
  'What is the revenue growth trend?',
]

const AVATAR_COLORS = [
  'from-[#a06510] to-dl-amber', 'from-[#1060a0] to-[#4090e0]',
  'from-[#a02020] to-[#e05550]', 'from-[#107840] to-[#48c47a]',
  'from-[#6010a0] to-[#a050e0]',
]

const RISK_COLOR: Record<string, string> = {
  high:   'text-dl-red    bg-[rgba(224,85,85,0.15)]',
  medium: 'text-dl-yellow bg-[rgba(232,192,64,0.15)]',
  low:    'text-dl-green  bg-[rgba(72,196,122,0.12)]',
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 font-mono text-[10px] tracking-[1.2px] uppercase text-dl-amber">
      <span className="w-3.5 h-px bg-dl-amber opacity-50" />
      {icon}
      {label}
    </div>
  )
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-dl-surface border border-dl-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-dl-border font-mono text-[10px] tracking-[1.2px] uppercase text-dl-text3">
        {title}
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  )
}

function ScoreBar({ label, value, threshold = 0.7 }: { label: string; value: number; threshold?: number }) {
  const color     = value >= threshold ? 'bg-dl-green' : value >= threshold - 0.2 ? 'bg-dl-yellow' : 'bg-dl-red'
  const textColor = value >= threshold ? 'text-dl-green' : value >= threshold - 0.2 ? 'text-dl-yellow' : 'text-dl-red'
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="font-mono text-[10px] text-dl-text3 uppercase tracking-[0.8px]">{label}</span>
        <span className={cn('font-mono text-[11px] font-semibold', textColor)}>{value.toFixed(2)}</span>
      </div>
      <div className="h-1.5 bg-dl-surface3 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${Math.round(value * 100)}%` }} />
      </div>
    </div>
  )
}

// Clickable evidence pill that opens PDF modal
function EvidencePill({
  text,
  sourceUrl,
  onOpen,
}: {
  text: string
  sourceUrl?: string
  onOpen: (url: string, snippet: string) => void
}) {
  if (!text) return null
  const clickable = !!sourceUrl
  return (
    <button
      onClick={() => clickable && onOpen(sourceUrl!, text)}
      disabled={!clickable}
      title={clickable ? 'Click to view in PDF' : undefined}
      className={cn(
        'text-left font-mono text-[10px] leading-relaxed mt-1 px-2.5 py-1.5 rounded-lg border transition-all w-full',
        clickable
          ? 'text-dl-text3 border-dl-border bg-dl-surface2 hover:border-dl-amber hover:text-dl-amber hover:bg-[rgba(232,160,32,0.05)] cursor-pointer group'
          : 'text-dl-text3 border-dl-border bg-dl-surface2 cursor-default',
      )}
    >
      <span className="text-dl-amber mr-1.5">
        {clickable ? '⌕' : ''}Evidence:
      </span>
      {text}
      {clickable && (
        <ExternalLink size={9} className="inline ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

function AnalysePageInner() {
  const searchParams = useSearchParams()
  const { tickerMap, fetchYearsForTicker, yearCache, loading: companiesLoading } = useCompanies()

  const paramTicker = searchParams.get('ticker')
  const paramYear   = searchParams.get('fiscal_year')

  const [selectedTicker, setSelectedTicker] = useState('')
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [selectedYear,   setSelectedYear]   = useState<number | null>(null)
  const [yearsLoading,   setYearsLoading]   = useState(false)

  useEffect(() => {
    if (!tickerMap.length || selectedTicker) return
    const initial = paramTicker
      ? (tickerMap.find((e) => e.ticker === paramTicker)?.ticker ?? tickerMap[0].ticker)
      : tickerMap[0].ticker
    setSelectedTicker(initial)
  }, [tickerMap, paramTicker, selectedTicker])

  useEffect(() => {
    if (!selectedTicker) return
    setAvailableYears([])
    setSelectedYear(null)
    setYearsLoading(true)
    fetchYearsForTicker(selectedTicker)
      .then((years) => {
        setAvailableYears(years)
        const fromParam = paramYear ? Number(paramYear) : null
        setSelectedYear(fromParam && years.includes(fromParam) ? fromParam : (years[0] ?? null))
      })
      .finally(() => setYearsLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTicker, fetchYearsForTicker])

  const currentEntry: TickerEntry | undefined = tickerMap.find((e) => e.ticker === selectedTicker)

  const [query,      setQuery]      = useState('')
  const [running,    setRunning]    = useState(false)
  const [result,     setResult]     = useState<AnalysisResponse | null>(null)
  const [streamText, setStreamText] = useState('')
  const [error,      setError]      = useState('')
  const [activeStep, setActiveStep] = useState(-1)
  const resultRef = useRef<HTMLDivElement>(null)

  // PDF modal state
  const [pdfModal, setPdfModal] = useState<{ url: string; snippet: string } | null>(null)

  function openPdf(url: string, snippet: string) {
    setPdfModal({ url, snippet })
  }

  function reset() {
    setResult(null); setStreamText(''); setError(''); setActiveStep(-1)
  }

  function handleTickerChange(ticker: string) {
    setSelectedTicker(ticker); reset()
  }

  async function runAnalysis() {
    if (!query.trim() || running || !currentEntry || selectedYear === null) return
    setRunning(true); reset(); setActiveStep(0)
    const stepTimer = setInterval(
      () => setActiveStep((s) => (s < PIPELINE_STEPS.length - 1 ? s + 1 : s)),
      1200,
    )
    try {
      const data = await analysisApi.query({
        query,
        company_name:    currentEntry.name,
        collection_name: 'sec_filings',
        ticker:          currentEntry.ticker,
        fiscal_year:     selectedYear,
      })
      const parsed = parseResponse(data)
      if (parsed) {
        setResult(parsed)
      } else if (typeof (data as unknown as Record<string,unknown>).response === 'string') {
        setStreamText((data as unknown as Record<string,unknown>).response as string)
      } else {
        setStreamText(JSON.stringify(data, null, 2))
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
  const pa        = result?.polished_answer

  return (
    <>
      <Topbar title="Analyse" actionLabel="New Query" onAction={() => { reset(); setQuery('') }} />

      {/* PDF Modal */}
      {pdfModal && (
        <PdfModal url={pdfModal.url} snippet={pdfModal.snippet} onClose={() => setPdfModal(null)} />
      )}

      <div className="md:p-7 md:flex gap-5">

        {/* ── LEFT ────────────────────────────────────────── */}
        <div className="py-5 flex-1 flex flex-col bg-dl-surface border border-dl-border rounded-xl">

          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-dl-border flex-wrap">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#e8a020" strokeWidth={2}>
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <span className="font-serif text-[15px] text-dl-text">Analysis Stream</span>

            <div className="ml-auto flex items-center gap-2 flex-wrap">
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[8px] tracking-[1px] uppercase text-dl-text3 px-0.5">Company</span>
                <select
                  value={selectedTicker}
                  onChange={(e) => handleTickerChange(e.target.value)}
                  disabled={companiesLoading}
                  className="bg-dl-surface2 border border-dl-border text-dl-text2 font-mono text-[11px] px-2.5 py-1.5 rounded-lg outline-none focus:border-dl-amber cursor-pointer disabled:opacity-50"
                >
                  {companiesLoading ? <option>Loading…</option>
                    : tickerMap.length === 0 ? <option>— No companies —</option>
                    : tickerMap.map((e) => <option key={e.ticker} value={e.ticker}>{e.ticker} · {e.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[8px] tracking-[1px] uppercase text-dl-text3 px-0.5">
                  Fiscal Year
                  {!yearsLoading && availableYears.length > 0 && (
                    <span className="ml-1 text-dl-amber">({availableYears.length})</span>
                  )}
                </span>
                <select
                  value={selectedYear ?? ''}
                  onChange={(e) => { setSelectedYear(Number(e.target.value)); reset() }}
                  disabled={yearsLoading || availableYears.length === 0}
                  className="bg-dl-surface2 border border-dl-border text-dl-text2 font-mono text-[11px] px-2.5 py-1.5 rounded-lg outline-none focus:border-dl-amber cursor-pointer disabled:opacity-50 min-w-[90px]"
                >
                  {yearsLoading ? <option>Loading…</option>
                    : availableYears.length === 0 ? <option value="">— no docs —</option>
                    : availableYears.map((yr) => <option key={yr} value={yr}>FY{yr}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Result area */}
          <div ref={resultRef} className="flex-1 p-5 overflow-y-auto flex flex-col gap-5 min-h-[320px] max-h-[640px]">

            {running && (
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-[rgba(232,160,32,0.06)] border border-[rgba(232,160,32,0.2)] rounded-lg font-mono text-[11px] text-dl-amber animate-fade-in">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-dl-amber animate-blink" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
                {PIPELINE_STEPS[activeStep]?.name ?? 'Processing'} — {PIPELINE_STEPS[activeStep]?.desc}
              </div>
            )}

            {error && (
              <div className="px-3.5 py-2.5 bg-[rgba(224,85,85,0.08)] border border-[rgba(224,85,85,0.2)] rounded-lg font-mono text-[11px] text-dl-red">
                ✗ {error}
              </div>
            )}

            {streamText && !result && (
              <div className="font-mono text-[12px] text-dl-text2 leading-relaxed whitespace-pre-wrap">{streamText}</div>
            )}

            {result && pa && (
              <div className="flex flex-col gap-5 animate-fade-in">

                {/* Insufficient data */}
                {pa.summary && (
                  <div className="px-4 py-3.5 bg-[rgba(232,160,32,0.05)] border-l-2 border-dl-amber rounded-r-lg font-serif text-[15px] font-light text-dl-text leading-[1.7]">
                    {pa.summary}
                  </div>
                )}

                {/* 1 · Executive Summary */}
                {pa.executive_summary && (
                  <div className="flex flex-col gap-2">
                    <SectionLabel icon={<BarChart2 size={12} />} label="Executive Summary" />
                    <div className="px-4 py-3.5 bg-[rgba(232,160,32,0.05)] border-l-2 border-dl-amber rounded-r-lg font-serif text-[15px] font-light text-dl-text leading-[1.7]">
                      {pa.executive_summary}
                    </div>
                  </div>
                )}

                {/* 2 · Key Risks */}
                {pa.key_risks && pa.key_risks.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <SectionLabel icon={<AlertTriangle size={12} />} label="Key Risks" />
                    <div className="flex flex-col gap-2">
                      {pa.key_risks.map((r, i) => (
                        <div key={i} className="flex items-start gap-3 px-3.5 py-3 bg-dl-surface2 border border-dl-border rounded-lg hover:border-dl-border2 transition-colors">
                          <span className={cn('inline-flex px-2 py-0.5 rounded-full font-mono text-[9px] font-medium shrink-0 mt-0.5', RISK_COLOR[r.severity?.toLowerCase()] ?? RISK_COLOR.medium)}>
                            {(r.severity ?? 'med').toUpperCase()}
                          </span>
                          <div className="flex flex-col gap-1 flex-1">
                            <p className="text-[13px] text-dl-text2 leading-relaxed">{r.risk}</p>
                            {r.evidence && (
                              <EvidencePill text={r.evidence} sourceUrl={r.source_url} onOpen={openPdf} />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3 · Open Questions */}
                {pa.open_questions && pa.open_questions.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <SectionLabel icon={<HelpCircle size={12} />} label="Open Questions" />
                    <div className="flex flex-col gap-2">
                      {pa.open_questions.map((q, i) => {
                        const isObj       = typeof q === 'object' && q !== null
                        const question    = isObj ? (q as OpenQuestion).question        : (q as string)
                        const decisionBlk = isObj ? (q as OpenQuestion).decision_impact : undefined
                        return (
                          <div key={i} className="flex items-start gap-2.5 px-3.5 py-3 bg-dl-surface2 border border-dl-border rounded-lg">
                            <span className="font-mono text-[10px] text-dl-text3 shrink-0 mt-0.5 min-w-[22px]">
                              {String(i + 1).padStart(2, '0')}.
                            </span>
                            <div className="flex flex-col gap-1">
                              <p className="text-[13px] text-dl-text2 leading-relaxed">{question}</p>
                              {decisionBlk && (
                                <p className="font-mono text-[10px] text-dl-text3">
                                  <span className="text-dl-amber mr-1">Blocks:</span>{decisionBlk}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* 4 · Sources Used */}
                {pa.sources && pa.sources.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <SectionLabel icon={<BookOpen size={12} />} label="Sources Used" />
                    <div className="flex flex-col gap-2">
                      {pa.sources.map((src, i) => (
                        <button
                          key={i}
                          onClick={() => openPdf(src.source_url, src.snippet)}
                          className="flex items-start gap-3 px-3.5 py-3 bg-dl-surface2 border border-dl-border rounded-lg hover:border-dl-amber hover:bg-[rgba(232,160,32,0.04)] transition-all text-left group w-full"
                        >
                          <FileText size={13} className="text-dl-text3 group-hover:text-dl-amber transition-colors shrink-0 mt-0.5" />
                          <div className="flex flex-col gap-1 min-w-0 flex-1">
                            <p className="font-mono text-[10px] text-dl-amber truncate">
                              {src.source_url.split('/').pop()?.split('#')[0] ?? src.source_url}
                            </p>
                            <p className="font-mono text-[10px] text-dl-text3 leading-relaxed line-clamp-2">
                              {src.snippet}
                            </p>
                          </div>
                          <ExternalLink size={11} className="text-dl-text3 group-hover:text-dl-amber transition-colors shrink-0 mt-0.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5 · Judge Evidence (supporting / contradicting) */}
                {(result.evidence?.supporting || result.evidence?.contradicting) && (
                  <div className="flex flex-col gap-2">
                    <SectionLabel icon={<BookOpen size={12} />} label="Judge Evidence" />
                    <div className="flex flex-col gap-2">
                      {result.evidence.supporting && (
                        <button
                          onClick={() => result.evidence.supporting_source_url && openPdf(result.evidence.supporting_source_url, result.evidence.supporting!)}
                          disabled={!result.evidence.supporting_source_url}
                          className={cn(
                            'px-3.5 py-3 bg-[rgba(72,196,122,0.06)] border border-[rgba(72,196,122,0.2)] rounded-lg text-left w-full transition-all',
                            result.evidence.supporting_source_url
                              ? 'hover:border-dl-green hover:bg-[rgba(72,196,122,0.10)] cursor-pointer group'
                              : 'cursor-default',
                          )}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="font-mono text-[9px] uppercase tracking-[0.8px] text-dl-green">Supporting</p>
                            {result.evidence.supporting_source_url && (
                              <ExternalLink size={10} className="text-dl-green opacity-50 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>
                          <p className="font-mono text-[11px] text-dl-text2 leading-relaxed">{result.evidence.supporting}</p>
                        </button>
                      )}
                      {result.evidence.contradicting && (
                        <button
                          onClick={() => result.evidence.contradicting_source_url && openPdf(result.evidence.contradicting_source_url, result.evidence.contradicting!)}
                          disabled={!result.evidence.contradicting_source_url}
                          className={cn(
                            'px-3.5 py-3 bg-[rgba(224,85,85,0.06)] border border-[rgba(224,85,85,0.15)] rounded-lg text-left w-full transition-all',
                            result.evidence.contradicting_source_url
                              ? 'hover:border-dl-red hover:bg-[rgba(224,85,85,0.10)] cursor-pointer group'
                              : 'cursor-default',
                          )}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="font-mono text-[9px] uppercase tracking-[0.8px] text-dl-red">Contradicting</p>
                            {result.evidence.contradicting_source_url && (
                              <ExternalLink size={10} className="text-dl-red opacity-50 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>
                          <p className="font-mono text-[11px] text-dl-text2 leading-relaxed">{result.evidence.contradicting}</p>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 6 · Audit Issues */}
                {result.issues && result.issues.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <SectionLabel icon={<XCircle size={12} />} label="Audit Issues" />
                    <div className="flex flex-col gap-1.5">
                      {result.issues.map((issue, i) => (
                        <div key={i} className="flex items-start gap-2.5 px-3.5 py-2.5 bg-[rgba(224,85,85,0.06)] border border-[rgba(224,85,85,0.15)] rounded-lg font-mono text-[11px] text-dl-red leading-relaxed">
                          <span className="shrink-0 mt-0.5">⚠</span>{issue}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7 · Judge Scores */}
                <div className="flex flex-col gap-2">
                  <SectionLabel icon={<Activity size={12} />} label="Judge Scores" />
                  <div className="px-4 py-4 bg-dl-surface2 border border-dl-border rounded-lg flex flex-col gap-3.5">
                    <div className="flex items-center gap-3">
                      {result.verdict === 'pass' ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(72,196,122,0.12)] border border-[rgba(72,196,122,0.3)] font-mono text-[10px] text-dl-green">
                          <CheckCircle size={11} /> PASS
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(224,85,85,0.12)] border border-[rgba(224,85,85,0.3)] font-mono text-[10px] text-dl-red">
                          <XCircle size={11} /> FAIL
                        </span>
                      )}
                      <span className="font-mono text-[9px] text-dl-text3">thresholds · faithfulness ≥ 0.7 · relevance ≥ 0.7</span>
                    </div>
                    <ScoreBar label="Faithfulness"     value={result.faithfulness}   />
                    <ScoreBar label="Answer Relevance" value={result.answer_relevance} />
                  </div>
                </div>

                {/* 8 · Confidence */}
                {pa.confidence != null && (
                  <div className="flex flex-col gap-2">
                    <SectionLabel icon={<Shield size={12} />} label="Confidence" />
                    <div className="flex items-center gap-4 px-4 py-3.5 bg-dl-surface2 border border-dl-border rounded-lg">
                      <span className="font-serif text-[36px] font-light text-dl-amber leading-none">
                        {typeof pa.confidence === 'number' ? pa.confidence.toFixed(2) : pa.confidence}
                      </span>
                      <div className="flex-1">
                        <div className="font-mono text-[9px] text-dl-text3 uppercase tracking-[1px] mb-1.5">Context Coverage</div>
                        <div className="h-1.5 bg-dl-surface3 rounded-full overflow-hidden">
                          <div className="h-full rounded-full conf-bar-fill" style={{ width: `${typeof pa.confidence === 'number' ? pa.confidence * 100 : 80}%` }} />
                        </div>
                        <div className="font-mono text-[10px] text-dl-text3 mt-1.5">
                          {typeof pa.confidence === 'number' && pa.confidence >= 0.8
                            ? 'Strong evidence — well grounded'
                            : typeof pa.confidence === 'number' && pa.confidence >= 0.6
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
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                <div className="font-serif text-[16px] text-dl-text2 mb-1">No analysis yet</div>
                <div className="font-mono text-[11px]">
                  {availableYears.length === 0 && !yearsLoading && selectedTicker
                    ? `No documents found for ${selectedTicker} — ingest one first`
                    : currentEntry
                    ? `Ask about ${currentEntry.name} · FY${selectedYear} below`
                    : 'Select a company and enter a query'}
                </div>
              </div>
            )}

          </div>

          {/* Input */}
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
                placeholder={currentEntry ? `Ask about ${currentEntry.name}${selectedYear ? ` FY${selectedYear}` : ''}…` : 'Select a company first…'}
                disabled={!currentEntry || companiesLoading || availableYears.length === 0}
                className="flex-1 bg-dl-surface2 border border-dl-border rounded-lg text-dl-text text-[13px] px-3.5 py-2.5 outline-none resize-none placeholder:text-dl-text3 focus:border-dl-amber focus:shadow-[0_0_0_3px_rgba(232,160,32,0.08)] transition-all leading-relaxed disabled:opacity-50"
              />
              <button
                onClick={runAnalysis}
                disabled={running || !query.trim() || !currentEntry || selectedYear === null}
                className="flex items-center gap-1.5 px-4 h-[44px] text-[13px] font-medium text-dl-bg bg-dl-amber rounded-lg hover:bg-[#f0b030] transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {running ? (
                  <><RefreshCw size={13} className="animate-spin" /> Running…</>
                ) : (
                  <>Analyse <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg></>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT ───────────────────────────────────────── */}
        <div className="shrink-0 flex flex-col gap-3.5 w-full md:w-[260px]">

          <InfoCard title="Selected Company">
            {companiesLoading ? (
              <div className="animate-pulse flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-dl-surface3 shrink-0" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="w-24 h-3 rounded bg-dl-surface3" />
                  <div className="w-16 h-2 rounded bg-dl-surface3" />
                </div>
              </div>
            ) : !currentEntry ? (
              <div className="font-mono text-[11px] text-dl-text3 py-2">
                No companies. <a href="/dashboard/companies" className="text-dl-amber hover:underline">Add one →</a>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn('flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br font-mono text-[13px] font-medium text-dl-bg shrink-0', AVATAR_COLORS[tickerMap.indexOf(currentEntry) % AVATAR_COLORS.length])}>
                    {currentEntry.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <div className="text-[14px] font-medium text-dl-text">{currentEntry.name}</div>
                    <div className="font-mono text-[10px] text-dl-text3 mt-0.5">{currentEntry.ticker}{selectedYear ? ` · FY${selectedYear}` : ''}</div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="font-mono text-[9px] uppercase tracking-[1px] text-dl-text3">Available years</div>
                  {yearsLoading ? (
                    <div className="flex gap-1.5 animate-pulse">
                      {[0, 1, 2].map((i) => <div key={i} className="w-10 h-5 rounded bg-dl-surface3" />)}
                    </div>
                  ) : availableYears.length === 0 ? (
                    <div className="font-mono text-[10px] text-dl-text3">
                      No documents yet — <a href="/dashboard/documents" className="text-dl-amber hover:underline">ingest one →</a>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {availableYears.map((yr) => (
                        <button
                          key={yr}
                          onClick={() => { setSelectedYear(yr); reset() }}
                          className={cn('font-mono text-[10px] px-2 py-0.5 rounded border transition-all',
                            yr === selectedYear
                              ? 'text-dl-amber border-[rgba(232,160,32,0.35)] bg-[rgba(232,160,32,0.10)]'
                              : 'text-dl-text3 border-dl-border2 bg-dl-surface2 hover:text-dl-amber hover:border-[rgba(232,160,32,0.25)]',
                          )}
                        >
                          FY{yr}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </InfoCard>

          <InfoCard title="LLM Pipeline">
            <div className="flex flex-col gap-0">
              {PIPELINE_STEPS.map(({ name, desc }, i) => {
                const done   = running ? i < activeStep : !!hasResult
                const active = running && i === activeStep
                return (
                  <div key={name} className="flex gap-3 pb-3.5 last:pb-0">
                    <div className="flex flex-col items-center shrink-0">
                      <div className={cn('flex items-center justify-center w-[22px] h-[22px] rounded-full border font-mono text-[9px]',
                        done   ? 'bg-[rgba(72,196,122,0.12)] border-dl-green text-dl-green'
                               : active ? 'bg-[rgba(232,160,32,0.10)] border-dl-amber text-dl-amber'
                               : 'bg-dl-surface2 border-dl-border2 text-dl-text3',
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

          {tickerMap.length > 1 && (
            <InfoCard title="Switch Company">
              <div className="flex flex-col">
                {tickerMap.map((entry, idx) => {
                  const cachedYears = yearCache[entry.ticker] ?? []
                  return (
                    <button
                      key={entry.ticker}
                      onClick={() => handleTickerChange(entry.ticker)}
                      className={cn('flex items-center gap-2.5 py-2.5 border-b border-dl-border last:border-b-0 w-full text-left transition-colors',
                        entry.ticker === selectedTicker ? 'text-dl-amber' : 'text-dl-text2 hover:text-dl-text',
                      )}
                    >
                      <div className={cn('flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br shrink-0 font-mono text-[9px] font-medium text-dl-bg', AVATAR_COLORS[idx % AVATAR_COLORS.length])}>
                        {entry.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] truncate">{entry.name}</div>
                        <div className="font-mono text-[10px] text-dl-text3">
                          {entry.ticker}{cachedYears.length > 0 && <span className="ml-1">· {cachedYears.length} yr{cachedYears.length !== 1 ? 's' : ''}</span>}
                        </div>
                      </div>
                      {entry.ticker === selectedTicker && <span className="w-1.5 h-1.5 rounded-full bg-dl-amber shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </InfoCard>
          )}

        </div>
      </div>
    </>
  )
}

export default function AnalysePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-dl-muted">Loading…</div>}>
      <AnalysePageInner />
    </Suspense>
  )
}