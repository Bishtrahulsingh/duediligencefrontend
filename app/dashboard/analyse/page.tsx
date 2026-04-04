'use client'

import { useState, useRef } from 'react'
import { Shield, AlertTriangle, HelpCircle, BarChart2 } from 'lucide-react'
import Topbar from '@/app/components/dashboard/Topbar'
import { cn } from '@/app/lib/utils'

const DEMO_COMPANIES = [
  { name: 'Apple Inc.',    ticker: 'AAPL', fiscal_year: 2024 },
  { name: 'Tesla, Inc.',   ticker: 'TSLA', fiscal_year: 2024 },
  { name: 'Netflix, Inc.', ticker: 'NFLX', fiscal_year: 2024 },
  { name: 'Spotify AB',    ticker: 'SPOT', fiscal_year: 2024 },
]

const DEMO_DOCS = [
  { name: 'Apple 10-K 2024',     type: 'sec_filing',    chunks: 847,  status: 'indexed' },
  { name: 'Apple Q3 2024 10-Q',  type: 'sec_filing',    chunks: 312,  status: 'indexed' },
  { name: 'Shareholder Letter',  type: 'annual_report',  chunks: null, status: 'pending' },
]

const PIPELINE_STEPS = [
  { name: 'Vector Search',   desc: 'Qdrant · top 20 chunks · cosine', done: true  },
  { name: 'Stage 1: Analyst', desc: 'llama-3.1-8b-instant via Groq',   done: true  },
  { name: 'Stage 2: Judge',  desc: 'gpt-oss-20b · refine & validate',  done: true  },
  { name: 'Client Stream',   desc: 'SSE delta events · complete',       done: false, active: true },
]

const HINTS = [
  'Key revenue risks?',
  'What are the red flags?',
  'Summarize competitive moat',
  'Debt & liquidity position',
]

interface Risk { risk: string; severity: string; evidence?: string }
interface Question { question: string; decision_impact?: string }
interface Analysis {
  executive_summary?: string
  key_risks?: Risk[]
  open_questions?: (string | Question)[]
  confidence?: string | number
}

const riskColor: Record<string, string> = {
  high:   'text-dl-red   bg-[rgba(224,85,85,0.15)]',
  medium: 'text-dl-yellow bg-[rgba(232,192,64,0.15)]',
  low:    'text-dl-green  bg-[rgba(72,196,122,0.12)]',
}

export default function AnalysePage() {
  const base_url = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''
  const [selectedIdx,   setSelectedIdx]   = useState(0)
  const [query,         setQuery]         = useState('')
  const [streaming,     setStreaming]      = useState(false)
  const [streamText,    setStreamText]    = useState('')
  const [analysis,      setAnalysis]      = useState<Analysis | null>(null)
  const [error,         setError]         = useState('')
  const resultRef = useRef<HTMLDivElement>(null)

  const company = DEMO_COMPANIES[selectedIdx]

  async function runStream() {
    if (!query.trim() || streaming) return
    setStreaming(true)
    setStreamText('')
    setAnalysis(null)
    setError('')

    try {
      const res = await fetch(`${base_url}/api/result/stream`, {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          company_name:    company.name,
          collection_name: 'sec_filings',
          ticker:          company.ticker,
          fiscal_year:     company.fiscal_year,
        }),
      })

      if (!res.ok) {
        const d = await res.json()
        setError(d.detail ?? 'Request failed')
        return
      }
      const contentType = res.headers.get('content-type') ?? ''

      if (contentType.includes('text/event-stream')) {
        // True SSE path
        const reader = res.body!.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            if (line.startsWith('data:')) {
              try {
                const json = JSON.parse(line.slice(5))
                if (json.text) setStreamText((t) => t + json.text)
              } catch { /* skip */ }
            }
          }
        }
      } else {
        // Plain JSON fallback (current backend behaviour)
        const data = await res.json()
        const response = data.response ?? data
        if (typeof response === 'string') {
          setStreamText(response)
        } else {
          setAnalysis(response as Analysis)
        }
      }
    } catch (e) {
      setError('Network error — is the API running?')
      console.error(e)
    } finally {
      setStreaming(false)
    }
  }

  // Try to parse streamText as JSON once streaming ends
  const parsedFromStream: Analysis | null = (() => {
    if (streaming || !streamText) return null
    try { return JSON.parse(streamText) as Analysis } catch { return null }
  })()

  const result = analysis ?? parsedFromStream

  return (
    <>
      <div className="md:p-7 md:flex gap-5">
        <div className="py-5 flex-1 flex flex-col bg-dl-surface border border-dl-border rounded-xl">
          {/* Panel header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-dl-border">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#e8a020" strokeWidth={2}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            <span className="font-serif text-[15px] text-dl-text">Analysis Stream</span>
            <select
              value={selectedIdx}
              onChange={(e) => setSelectedIdx(Number(e.target.value))}
              className="ml-auto bg-dl-surface2 border border-dl-border text-dl-text2 font-mono text-[11px] px-2.5 py-1.5 rounded-lg outline-none focus:border-dl-amber cursor-pointer"
            >
              {DEMO_COMPANIES.map((c, i) => (
                <option key={c.ticker} value={i}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Result area */}
          <div ref={resultRef} className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 min-h-[320px] max-h-[480px]">

            {/* Streaming indicator */}
            {streaming && (
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-[rgba(232,160,32,0.06)] border border-[rgba(232,160,32,0.2)] rounded-lg font-mono text-[11px] text-dl-amber animate-fade-in">
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-dl-amber animate-blink" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
                Judge LLM reviewing analysis…
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="px-3.5 py-2.5 bg-[rgba(224,85,85,0.08)] border border-[rgba(224,85,85,0.2)] rounded-lg font-mono text-[11px] text-dl-red">
                {error}
              </div>
            )}

            {/* Raw stream text (before parse) */}
            {streamText && !result && (
              <div className="font-mono text-[12px] text-dl-text2 leading-relaxed whitespace-pre-wrap">
                {streamText}
                {streaming && <span className="text-dl-amber animate-blink">█</span>}
              </div>
            )}

            {/* Structured result */}
            {result && (
              <>
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
                          <span className={cn('inline-flex px-2 py-0.5 rounded-full font-mono text-[9px] font-medium shrink-0 mt-0.5', riskColor[r.severity?.toLowerCase()] ?? riskColor.medium)}>
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

                {result.confidence && (
                  <div className="flex flex-col gap-2">
                    <SectionLabel icon={<Shield size={12}/>} label="Confidence Score" />
                    <div className="flex items-center gap-4 px-4 py-3.5 bg-dl-surface2 border border-dl-border rounded-lg">
                      <span className="font-serif text-[36px] font-light text-dl-amber leading-none">
                        {typeof result.confidence === 'number'
                          ? result.confidence.toFixed(2)
                          : result.confidence}
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
              </>
            )}

            {/* Empty state */}
            {!streaming && !result && !streamText && !error && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-dl-text3">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="mb-3 opacity-30"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                <div className="font-serif text-[16px] text-dl-text2 mb-1">No analysis yet</div>
                <div className="font-mono text-[11px]">Enter a query below to stream results</div>
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
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); runStream() } }}
                placeholder="Ask about company's filings…"
                className="flex-1 bg-dl-surface2 border border-dl-border rounded-lg text-dl-text text-[13px] px-3.5 py-2.5 outline-none resize-none placeholder:text-dl-text3 focus:border-dl-amber focus:shadow-[0_0_0_3px_rgba(232,160,32,0.08)] transition-all leading-relaxed"
              />
              <button
                onClick={runStream}
                disabled={streaming || !query.trim()}
                className="flex items-center gap-1.5 px-4 h-[44px] text-[13px] font-medium text-dl-bg bg-dl-amber rounded-lg hover:bg-[#f0b030] transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {streaming ? 'Streaming…' : 'Analyse'}
                {!streaming && (
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Info Panel ── */}
        <div className="shrink-0 flex flex-col gap-3.5">
          {/* Company card */}
          <InfoCard title="Selected Company">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#a06510] to-dl-amber font-mono text-[13px] font-medium text-dl-bg shrink-0">
                {DEMO_COMPANIES[selectedIdx].ticker.slice(0, 2)}
              </div>
              <div>
                <div className="text-[15px] font-medium text-dl-text">{company.name}</div>
                <div className="font-mono text-[10px] text-dl-text3 mt-0.5">
                  {company.ticker} · FY{company.fiscal_year}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['sec_filings', '10-K', '10-Q'].map((t) => (
                <span key={t} className={cn(
                  'font-mono text-[9px] px-2 py-0.5 rounded border',
                  t === 'sec_filings'
                    ? 'text-dl-amber border-[rgba(232,160,32,0.3)] bg-[rgba(232,160,32,0.08)]'
                    : 'text-dl-text3 border-dl-border2 bg-dl-surface2'
                )}>{t}</span>
              ))}
            </div>
          </InfoCard>

          {/* Documents */}
          <InfoCard
            title="Indexed Documents"
            action={{ label: '+ Add', onClick: () => {} }}
          >
            {DEMO_DOCS.map((d) => (
              <div key={d.name} className="flex items-center gap-2.5 py-2.5 border-b border-dl-border last:border-b-0">
                <div className={cn(
                  'flex items-center justify-center w-7 h-7 rounded-md bg-dl-surface3 border border-dl-border shrink-0',
                  d.status === 'indexed' ? 'text-dl-amber' : 'text-dl-yellow'
                )}>
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] text-dl-text truncate">{d.name}</div>
                  <div className="font-mono text-[10px] text-dl-text3 mt-0.5">
                    {d.type} {d.chunks ? `· ${d.chunks} chunks` : '· embedding…'}
                  </div>
                </div>
                <span className={cn('font-mono text-[9px]', d.status === 'indexed' ? 'text-dl-green' : 'text-dl-yellow')}>
                  ● {d.status}
                </span>
              </div>
            ))}
          </InfoCard>

          {/* Pipeline */}
          <InfoCard title="LLM Pipeline">
            <div className="flex flex-col gap-0">
              {PIPELINE_STEPS.map(({ name, desc, done, active }, i) => (
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
              ))}
            </div>
          </InfoCard>
        </div>
      </div>
    </>
  )
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

function InfoCard({
  title, action, children,
}: {
  title: string
  action?: { label: string; onClick: () => void }
  children: React.ReactNode
}) {
  return (
    <div className="bg-dl-surface border border-dl-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-dl-border font-mono text-[10px] tracking-[1.2px] uppercase text-dl-text3">
        {title}
        {action && (
          <button
            onClick={action.onClick}
            className="text-dl-text3 hover:text-dl-amber transition-colors normal-case tracking-normal text-[11px]"
          >
            {action.label}
          </button>
        )}
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  )
}
