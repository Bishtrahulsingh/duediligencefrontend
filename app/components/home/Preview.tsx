'use client'

const risks = [
  { level: 'HIGH', color: 'text-dl-red bg-[rgba(224,85,85,0.15)]',   text: 'China revenue concentration — regulatory headwinds + Huawei competition cited in Item 1A' },
  { level: 'MED',  color: 'text-dl-yellow bg-[rgba(232,192,64,0.15)]', text: 'EU DMA App Store mandates — take-rate reduction 3–5pp estimated from filing disclosures' },
  { level: 'LOW',  color: 'text-dl-green bg-[rgba(72,196,122,0.12)]', text: 'TSMC supply concentration — multi-source strategy partially mitigates risk' },
]

const bullets = [
  'Claims grounded strictly in retrieved document chunks',
  'Severity rated: High / Medium / Low with named evidence',
  'Open questions flag gaps that block investment decisions',
  'Judge model removes any claim it cannot verify',
]

function TerminalCard() {
  return (
    <div className="terminal-glow bg-dl-surface border border-dl-border rounded-2xl overflow-hidden">
      {/* Bar */}
      <div className="flex items-center gap-1.5 px-4 py-3 bg-dl-surface2 border-b border-dl-border">
        <div className="w-2.5 h-2.5 rounded-full bg-dl-red" />
        <div className="w-2.5 h-2.5 rounded-full bg-dl-yellow" />
        <div className="w-2.5 h-2.5 rounded-full bg-dl-green" />
        <span className="ml-1 font-mono text-[10px] text-dl-text3 tracking-[0.5px]">
          analysis stream · AAPL · FY2024
        </span>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Summary */}
        <div className="flex gap-2.5 mb-3.5 font-mono text-[11px] leading-relaxed">
          <span className="text-dl-amber opacity-70 uppercase tracking-[1.2px] text-[9px] mt-0.5 shrink-0 w-20">Summary</span>
          <span className="text-dl-text2">
            Apple&apos;s services segment reached 74.6% gross margin, though China
            exposure (~18% revenue) and EU DMA compliance represent the primary
            structural risks heading into FY2025.
            <span className="text-dl-amber animate-blink">█</span>
          </span>
        </div>

        <div className="h-px bg-dl-border my-3.5" />

        <div className="font-mono text-[9px] tracking-[1.2px] uppercase text-dl-amber mb-2.5">
          Key Risks
        </div>

        {risks.map(({ level, color, text }) => (
          <div key={level} className="flex gap-2.5 mb-2 font-mono text-[11px]">
            <span className={`shrink-0 w-20 mt-0.5`}>
              <span className={`inline-flex items-center px-1.5 py-[1px] rounded text-[9px] font-medium ${color}`}>
                {level}
              </span>
            </span>
            <span className="text-dl-text2 text-[11px] leading-relaxed">{text}</span>
          </div>
        ))}

        {/* Confidence */}
        <div className="flex items-center gap-3.5 mt-4 pt-3.5 border-t border-dl-border">
          <span className="font-serif text-[28px] font-light text-dl-amber">0.92</span>
          <div className="flex-1">
            <div className="font-mono text-[9px] text-dl-text3 tracking-[1px] uppercase mb-1.5">
              Confidence · 20 chunks retrieved
            </div>
            <div className="h-1 bg-dl-surface3 rounded-full overflow-hidden">
              <div className="h-full rounded-full conf-bar-fill" style={{ width: '92%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Preview() {
  return (
    <section className="px-14 pb-[90px] grid grid-cols-2 gap-16 items-center">
      {/* Copy */}
      <div>
        <div className="font-mono text-[10px] tracking-[2px] uppercase text-dl-amber mb-4">
          See it in action
        </div>
        <h2 className="font-serif font-light text-[38px] leading-[1.15] tracking-tight text-dl-text mb-4">
          Analyst-grade output,<br />
          <em className="italic text-dl-amber">instantly</em>
        </h2>
        <p className="text-[14px] text-dl-text2 leading-[1.7] font-light mb-7">
          Ask &quot;What are the key revenue risks?&quot; and get a structured breakdown —
          executive summary, severity-rated risks with source evidence, open questions
          that block the decision, and a confidence score.
        </p>
        <div className="flex flex-col gap-2.5">
          {bullets.map((b) => (
            <div key={b} className="flex items-start gap-2.5 text-[13px] text-dl-text2">
              <div className="flex items-center justify-center w-4 h-4 rounded-full bg-[rgba(232,160,32,0.10)] border border-[rgba(232,160,32,0.3)] shrink-0 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-dl-amber" />
              </div>
              {b}
            </div>
          ))}
        </div>
      </div>

      <TerminalCard />
    </section>
  )
}
