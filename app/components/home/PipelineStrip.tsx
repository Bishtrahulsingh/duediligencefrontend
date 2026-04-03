import {
  MessageSquare, FileText, Search, RefreshCw,
  LayoutGrid, Shield, Radio,
} from 'lucide-react'

const nodes = [
  { icon: MessageSquare, label: 'Your\nQuery' },
  { icon: FileText,      label: 'HyDE\nPassage' },
  { icon: Search,        label: 'Hybrid\nSearch' },
  { icon: RefreshCw,     label: 'Reranker\nTop 5' },
  { icon: LayoutGrid,    label: 'Analyst\nLLM' },
  { icon: Shield,        label: 'Judge\nLLM' },
  { icon: Radio,         label: 'SSE\nStream' },
]

export default function PipelineStrip() {
  return (
    <div className="border-t border-b border-dl-border bg-dl-surface px-14 py-16">
      <div className="font-mono text-[10px] tracking-[2px] uppercase text-dl-text3 text-center mb-9">
        How it works
      </div>

      <div className="flex items-center justify-center flex-wrap">
        {nodes.map(({ icon: Icon, label }, i) => (
          <div key={label} className="flex items-center">
            <div className="group flex flex-col items-center gap-2 px-5">
              <div className="flex items-center justify-center w-12 h-12 rounded-full border border-dl-border2 bg-dl-surface2 text-dl-amber transition-all duration-200 group-hover:border-dl-amber group-hover:bg-[rgba(232,160,32,0.10)] group-hover:shadow-[0_0_16px_rgba(232,160,32,0.14)]">
                <Icon size={18} strokeWidth={2} />
              </div>
              <div className="font-mono text-[9px] uppercase tracking-[1px] text-dl-text3 text-center whitespace-pre-line">
                {label}
              </div>
            </div>

            {i < nodes.length - 1 && <div className="pipeline-arrow" />}
          </div>
        ))}
      </div>
    </div>
  )
}
