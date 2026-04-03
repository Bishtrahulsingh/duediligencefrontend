import {
  Search, Shield, Activity, FileText, Monitor, BarChart2,
} from 'lucide-react'

const features = [
  {
    icon: Search,
    title: 'HyDE Retrieval',
    desc:  'Hypothetical Document Embeddings bridge the gap between casual queries and dense SEC filing prose — so you always find the right context.',
    tag:   'Vector Search',
  },
  {
    icon: Shield,
    title: 'Judge LLM',
    desc:  'A second model audits every claim — classifying it as SUPPORTED, DERIVABLE, or UNSUPPORTED — and removes hallucinations before you see the answer.',
    tag:   'Anti-Hallucination',
  },
  {
    icon: Activity,
    title: 'Real-time Stream',
    desc:  'Results stream directly to your browser via Server-Sent Events. No waiting for the full response — the analysis appears as it\'s being written.',
    tag:   'SSE · Live',
  },
  {
    icon: FileText,
    title: 'SEC Filing Ingest',
    desc:  'Paste a URL to any 10-K or 10-Q. The system fetches, parses, and chunks it — extracting section structure, keywords, and NER entities automatically.',
    tag:   'PDF · EDGAR',
  },
  {
    icon: Monitor,
    title: 'Hybrid Search',
    desc:  'Dense fastembed vectors + BM25 sparse encoding fused with RRF — catching both semantic meaning and exact financial terminology in the same query.',
    tag:   'RRF Fusion',
  },
  {
    icon: BarChart2,
    title: 'Confidence Scoring',
    desc:  'Every analysis comes with faithfulness, answer relevance, and context precision scores. You know exactly how much to trust the answer.',
    tag:   'Eval System',
  },
]

export default function Features() {
  return (
    <section id='Features' className="px-14 py-[90px] flex flex-col gap-20">
      {/* Header */}
      <div className="text-center max-w-[560px] mx-auto">
        <div className="font-mono text-[10px] tracking-[2px] uppercase text-dl-amber mb-3.5">
          What we do
        </div>
        <h2 className="font-serif font-light text-[clamp(28px,4vw,42px)] leading-[1.15] tracking-tight text-dl-text mb-4">
          Analyze company filings at{' '}
          <em className="italic text-dl-amber">machine speed</em>
        </h2>
        <p className="text-[14px] text-dl-text2 leading-[1.7] font-light">
        Stop spending hours reading filings. Ask questions and get structured answers in minutes — grounded strictly in the documents you upload.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-3.5">
        {features.map(({ icon: Icon, title, desc, tag }) => (
          <div
            key={title}
            className="feature-card-line relative bg-dl-surface border border-dl-border rounded-2xl p-7 transition-all duration-200 hover:border-dl-border2 hover:-translate-y-0.5 overflow-hidden"
          >
            <div className="flex items-center justify-center w-[42px] h-[42px] rounded-[10px] bg-[rgba(232,160,32,0.10)] border border-[rgba(232,160,32,0.2)] mb-[18px] text-dl-amber">
              <Icon size={18} strokeWidth={2} />
            </div>
            <div className="font-serif text-[18px] font-normal text-dl-text mb-2 leading-snug">
              {title}
            </div>
            <p className="text-[13px] text-dl-text2 leading-[1.65] font-light">{desc}</p>
            <div className="inline-block mt-3.5 font-mono text-[9px] tracking-[1px] uppercase text-dl-amber bg-[rgba(232,160,32,0.08)] border border-[rgba(232,160,32,0.15)] px-2 py-0.5 rounded">
              {tag}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
