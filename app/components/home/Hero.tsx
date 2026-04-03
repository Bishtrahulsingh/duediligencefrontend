import Link from 'next/link'

const stats = [
  { value: '2-stage', label: 'LLM Pipeline' },
  { value: '0.9+',    label: 'Faithfulness Score' },
  { value: 'HyDE',   label: 'RAG Retrieval' },
  { value: 'SSE',    label: 'Real-time Stream' },
]

export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center text-center px-8 pt-20 pb-16 overflow-hidden">
      {/* Grid bg */}
      <div
        className="absolute inset-0 opacity-35 grid-mask pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#222630 1px, transparent 1px), linear-gradient(90deg, #222630 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      {/* Amber orb */}
      <div className="hero-orb absolute w-[600px] h-[400px] top-[10%] left-1/2 -translate-x-1/2 pointer-events-none" />

      {/* Title */}
      <h1 className="animate-fade-up delay-2 opacity-0 relative z-10 font-serif font-light text-[clamp(44px,5vw,80px)] leading-[1.05] tracking-[-2px] text-dl-text mb-6 max-w-[820px]">
        Turn complex SEC filings<br />
        into{' '}
        <em className="text-dl-amber not-italic italic"> answers.</em>
      </h1>

      {/* Sub */}
      <p className="animate-fade-up delay-3 opacity-0 relative z-10 text-[16px] text-dl-text2 max-w-[600px] leading-[1.7] font-light mb-10">
        An AI system that analyzes SEC filings and allows users to ask questions about company financials, risks, and business operations, with every response grounded in the original documents and supported by source citations and evaluation metrics.
      </p>

      {/* Actions */}
      <div className="animate-fade-up delay-4 opacity-0 relative z-10 flex items-center gap-3 mb-16">
        <Link
          href="/signup"
          className="flex items-center gap-2 px-7 py-3.5 text-[14px] font-medium text-dl-bg bg-dl-amber border border-dl-amber rounded-[10px] transition-all hover:bg-[#f0b030]"
        >
          Start free analysis
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
        <button className="flex items-center gap-2 px-7 py-3.5 text-[14px] text-dl-text2 border border-dl-border2 rounded-[10px] transition-all hover:bg-dl-surface2 hover:text-dl-text">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <polygon points="10 8 16 12 10 16 10 8" />
          </svg>
          Watch demo
        </button>
      </div>

      {/* Stats */}
      <div className="animate-fade-up delay-5 opacity-0 flex items-center flex-wrap justify-center gap-5">
        {stats.map((s, i) => (
          <div key={s.value} className="flex items-center gap-10">
            <div className="text-center">
              <div className="font-serif text-[28px] font-light text-dl-text">{s.value}</div>
              <div className="font-mono text-[9px] tracking-[1px] uppercase text-dl-text3 mt-1">{s.label}</div>
            </div>
            {i < stats.length - 1 && <div className="w-px h-8 bg-dl-border" />}
          </div>
        ))}
      </div>
    </section>
  )
}
