'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/app/lib/utils'

export interface Company {
  id:         string
  initials:   string
  color:      string
  name:       string
  sector:     string
  docs:       number
  confidence: number
}

export const DEMO_COMPANIES: Company[] = [
  { id: 'a1b2', initials: 'AP', color: 'from-[#a06510] to-dl-amber',         name: 'Apple Inc.',    sector: 'Technology', docs: 3,confidence: 0.92 },
  { id: 'b2c3', initials: 'TS', color: 'from-[#1060a0] to-[#4090e0]',        name: 'Tesla, Inc.',   sector: 'Automotive', docs: 4,confidence: 0.71 },
  { id: 'c3d4', initials: 'NT', color: 'from-[#a02020] to-[#e05050]',        name: 'Netflix, Inc.', sector: 'Media',      docs: 2,confidence: 0.78 },
  { id: 'd4e5', initials: 'SP', color: 'from-[#107840] to-[#48c47a]',        name: 'Spotify AB',    sector: 'Audio',      docs: 2,confidence: 0.65 },
]


function ConfBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2 pl-3 md:pl-0">
      <div className="flex-1 h-1 bg-dl-surface3 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full conf-bar-fill transition-all"
          style={{ width: `${value * 100}%` }}
        />
      </div>
      <span className="font-mono text-[10px] text-dl-text2 shrink-0">{value.toFixed(2)}</span>
    </div>
  )
}

interface CompaniesTableProps {
  companies?: Company[]
  clickable?: boolean
}

export default function CompaniesTable({ companies = DEMO_COMPANIES, clickable = true }: CompaniesTableProps) {
  const router = useRouter()

  return (
    <div className="bg-dl-surface border-dl-border rounded-xl ">
      {/* Header */}
      <div className="grid grid-cols-4 px-3 py-2.5 border-b border-dl-border font-mono text-[10px] tracking-[1px] uppercase text-dl-text3">
        <span className='text-center' >Company</span>
        <span className='text-center'>Sector</span>
        <span className='text-center'>Documents</span>
        <span className='text-center'>Confidence</span>
      </div>

      {companies.map((c) => (
        <div
          key={c.id}
          onClick={() => clickable && router.push('/dashboard/analyse')}
          className={cn(
            'grid grid-cols-4 px-3 py-3.5 border-b border-dl-border last:border-b-0 items-center transition-colors',
            clickable && 'cursor-pointer hover:bg-dl-surface2'
          )}
        >
          {/* Name */}
          <div className="flex justify-center items-center gap-3 flex-wrap">
            <div className={cn('flex items-center justify-center w-8.5 h-8,5 rounded-lg bg-linear-to-br shrink-0 font-mono text-[11px] font-medium text-dl-bg', c.color)}>
              {c.initials}
            </div>
            <div>
              <div className="text-[13px] font-medium text-dl-text">{c.name}</div>
              <div className="font-mono text-[10px] text-dl-text3">uuid: {c.id}…</div>
            </div>
          </div>
          <div className="font-mono text-center text-[12px] text-dl-text2">{c.sector}</div>
          <div className="font-mono text-[12px] text-center text-dl-text2">{c.docs}</div>
          <ConfBar value={c.confidence} />
        </div>
      ))}
    </div>
  )
}
