import Topbar from '@/app/components/dashboard/Topbar'

const STACK = [
  { label: 'Framework',  tags: [{ t: 'FastAPI', h: true }, { t: 'Uvicorn' }, { t: 'Python 3.11' }] },
  { label: 'LLMs',       tags: [{ t: 'Groq API', h: true }, { t: 'llama-3.1-8b' }, { t: 'gpt-oss-20b' }, { t: 'Gemini 2.5' }] },
  { label: 'Vector DB',  tags: [{ t: 'Qdrant Cloud', h: true }, { t: 'HNSW' }, { t: 'cosine' }] },
  { label: 'Embeddings', tags: [{ t: 'fastembed', h: true }, { t: 'BM25 sparse' }, { t: 'local · no API' }] },
  { label: 'Streaming',  tags: [{ t: 'SSE', h: true }, { t: 'Pydantic v2' }, { t: 'pypdf' }] },
]

const FALLBACK = [
  { model: 'gemini-2.5-flash',        desc: 'Primary · fastest · low cost', active: true },
  { model: 'llama-3.1-8b-instant',    desc: 'Groq fallback #1' },
  { model: 'llama-3.3-70b-versatile', desc: 'Groq fallback #2 · larger context' },
  { model: 'meta/llama-3.1-405b',     desc: 'NIM fallback · highest capacity' },
]

const ENDPOINTS = [
  { method: 'GET',  path: '/health',                  desc: 'Health check' },
  { method: 'POST', path: '/auth/login',              desc: 'Sign in · sets HttpOnly cookie' },
  { method: 'POST', path: '/auth/register',           desc: 'Create account via Supabase' },
  { method: 'POST', path: '/api/v1/company',          desc: 'Create company entity' },
  { method: 'POST', path: '/api/v1/search/company',   desc: 'Auto-fetch 10-K from EDGAR + embed' },
  { method: 'POST', path: '/api/v1/store/document',   desc: 'Ingest PDF URL → chunk → embed → upsert Qdrant' },
  { method: 'POST', path: '/api/result/stream',       desc: 'Query → HyDE → RRF → rerank → 2-stage LLM → SSE' },
]

const NODES = [
  { label: 'USER QUERY',   sub: 'POST /stream',         highlight: false },
  { label: 'EMBED QUERY',  sub: 'fastembed local',       highlight: false },
  { label: 'VECTOR SEARCH',sub: 'Qdrant · BM25 · RRF',  highlight: true  },
  { label: 'RERANKER',     sub: 'cross-encoder · top 5', highlight: false },
  { label: 'ANALYST LLM',  sub: 'gemini-2.5-flash',      highlight: false },
  { label: 'JUDGE LLM',    sub: 'gpt-oss-20b · refine',  highlight: false },
  { label: 'SSE',          sub: '',                       highlight: false },
]

const methodColor: Record<string, string> = {
  GET:  'text-dl-green  bg-[rgba(72,196,122,0.12)]',
  POST: 'text-dl-yellow bg-[rgba(232,192,64,0.15)]',
}

export default function PipelinePage() {
  return (
    <>
      <Topbar title="Pipeline" actionLabel="Refresh Status" />

      <div className="p-7 flex flex-col gap-6">

        {/* Status pills */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(72,196,122,0.08)] border border-[rgba(72,196,122,0.2)] font-mono text-[11px] text-dl-green">
            <span className="w-1.5 h-1.5 rounded-full bg-dl-green shadow-[0_0_4px_#48c47a]" />
            All systems nominal
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-dl-surface2 border border-dl-border font-mono text-[11px] text-dl-text3">
            Semaphore: max <span className="text-dl-amber mx-1">10</span> concurrent requests
          </div>
        </div>

        {/* Architecture */}
        <div className="bg-dl-surface border border-dl-border rounded-xl p-5 overflow-x-auto">
          <div className="font-mono text-[10px] tracking-[1.5px] uppercase text-dl-text3 mb-4 text-center">
            RAG Pipeline Architecture
          </div>
          <div className="flex justify-evenly h-48 items-center text-[12px] text-dl-text2">
            {NODES.map(({ label, sub, highlight }, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`bg-dl-bg p-4 text-center ${highlight ? 'border border-dl-green' : ''}`}>
                  <div>{label}</div>
                  {sub && <div className="font-mono text-[9px] text-dl-text3 mt-1">{sub}</div>}
                </div>
                {i < NODES.length - 1 && (
                  <span className="text-dl-text3 text-[10px]">→</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Two col: stack + fallback */}
        <div className="grid grid-cols-2 gap-5">

          {/* Tech stack */}
          <div className="bg-dl-surface border border-dl-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-dl-border font-mono text-[10px] tracking-[1.2px] uppercase text-dl-text3">
              Tech Stack
            </div>
            <div className="px-5 py-4 flex flex-col gap-3">
              {STACK.map(({ label, tags }) => (
                <div key={label} className="flex items-center gap-3 pb-3 border-b border-dl-border last:border-b-0 last:pb-0">
                  <div className="font-mono text-[10px] text-dl-text3 w-24 shrink-0">{label}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map(({ t, h }) => (
                      <span
                        key={t}
                        className={h
                          ? 'font-mono text-[10px] px-2 py-0.5 rounded border text-dl-amber border-[rgba(232,160,32,0.3)] bg-[rgba(232,160,32,0.08)]'
                          : 'font-mono text-[10px] px-2 py-0.5 rounded border text-dl-text3 border-dl-border2 bg-dl-surface2'
                        }
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fallback chain */}
          <div className="bg-dl-surface border border-dl-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-dl-border font-mono text-[10px] tracking-[1.2px] uppercase text-dl-text3">
              LLM Fallback Chain
            </div>
            <div className="px-5 py-4 flex flex-col gap-0">
              {FALLBACK.map(({ model, desc, active }, i) => (
                <div key={model} className="flex gap-3 pb-3.5 last:pb-0">
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`flex items-center justify-center w-[22px] h-[22px] rounded-full border font-mono text-[9px] ${
                      active ? 'bg-[rgba(232,160,32,0.10)] border-dl-amber text-dl-amber' : 'bg-dl-surface2 border-dl-border2 text-dl-text3'
                    }`}>
                      {i + 1}
                    </div>
                    {i < FALLBACK.length - 1 && (
                      <div className="flex-1 w-px bg-dl-border mt-1" style={{ minHeight: 14 }} />
                    )}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <div className="text-[12px] font-medium text-dl-text font-mono">{model}</div>
                    <div className="font-mono text-[10px] text-dl-text3 mt-0.5">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mx-5 mb-4 bg-dl-surface2 border border-dl-border rounded-lg px-3 py-2 font-mono text-[10px] text-dl-text3">
              Auto-retry on rate limit · Semaphore: max <span className="text-dl-amber">10</span> concurrent
            </div>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="bg-dl-surface border border-dl-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-dl-border font-mono text-[10px] tracking-[1.2px] uppercase text-dl-text3">
            API Endpoints
          </div>
          <div className="px-5 py-4 flex flex-col gap-2.5">
            {ENDPOINTS.map(({ method, path, desc }) => (
              <div
                key={path}
                className="flex items-center gap-4 px-3.5 py-2.5 bg-dl-surface2 border border-dl-border rounded-lg hover:border-dl-border2 transition-colors"
              >
                <span className={`font-mono text-[10px] px-2 py-0.5 rounded w-10 text-center shrink-0 ${methodColor[method]}`}>
                  {method}
                </span>
                <code className="font-mono text-[12px] text-dl-amber flex-1">{path}</code>
                <span className="font-mono text-[10px] text-dl-text3 text-right">{desc}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  )
}