'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/app/lib/utils'
import { useCompanies } from '@/app/lib/CompaniesContext'
import { Company } from '@/app/lib/api'

// Colour palette cycling for company avatars
const AVATAR_COLORS = [
  'from-[#a06510] to-dl-amber',
  'from-[#1060a0] to-[#4090e0]',
  'from-[#a02020] to-[#e05550]',
  'from-[#107840] to-[#48c47a]',
  'from-[#6010a0] to-[#a050e0]',
  'from-[#a07010] to-[#e0b030]',
]

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-4 px-3 py-3.5 border-b border-dl-border last:border-b-0 items-center animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-dl-surface3 shrink-0" />
        <div className="flex flex-col gap-1.5">
          <div className="w-24 h-3 rounded bg-dl-surface3" />
          <div className="w-16 h-2 rounded bg-dl-surface3" />
        </div>
      </div>
      <div className="w-16 h-3 rounded bg-dl-surface3 mx-auto" />
      <div className="w-10 h-3 rounded bg-dl-surface3 mx-auto" />
      <div className="flex items-center gap-2 pl-3">
        <div className="flex-1 h-1 rounded-full bg-dl-surface3" />
        <div className="w-8 h-3 rounded bg-dl-surface3" />
      </div>
    </div>
  )
}

interface CompaniesTableProps {
  companies?: Company[]
  clickable?: boolean
}

export default function CompaniesTable({ companies: propCompanies, clickable = true }: CompaniesTableProps) {
  const router = useRouter()
  const { companies: ctxCompanies, loading } = useCompanies()

  const data = propCompanies ?? ctxCompanies

  return (
    <div className="bg-dl-surface border border-dl-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-4 px-3 py-2.5 border-b border-dl-border font-mono text-[10px] tracking-[1px] uppercase text-dl-text3">
        <span className="text-center">Company</span>
        <span className="text-center">Sector / Year</span>
        <span className="text-center">Ticker</span>
        <span className="text-center">Keywords</span>
      </div>

      {loading && propCompanies === undefined ? (
        <>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-dl-text3">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="mb-3 opacity-30">
            <path d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h1v11H4zm15 0h1v11h-1zM9 10h1v11H9zm5 0h1v11h-1z" />
          </svg>
          <div className="font-serif text-[15px] text-dl-text2 mb-1">No companies yet</div>
          <div className="font-mono text-[11px]">Add one using the form →</div>
        </div>
      ) : (
        data.map((c, idx) => (
          <div
            key={c.id}
            onClick={() => clickable && router.push(`/dashboard/analyse?ticker=${c.ticker}&fiscal_year=${c.fiscal_year}&name=${encodeURIComponent(c.name)}`)}
            className={cn(
              'grid grid-cols-4 px-3 py-3.5 border-b border-dl-border last:border-b-0 items-center transition-colors',
              clickable && 'cursor-pointer hover:bg-dl-surface2'
            )}
          >
            {/* Name */}
            <div className="flex justify-center items-center gap-3 flex-wrap">
              <div className={cn(
                'flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br shrink-0 font-mono text-[11px] font-medium text-dl-bg',
                AVATAR_COLORS[idx % AVATAR_COLORS.length]
              )}>
                {initials(c.name)}
              </div>
              <div>
                <div className="text-[13px] font-medium text-dl-text">{c.name}</div>
                <div className="font-mono text-[10px] text-dl-text3">id: {c.id.slice(0, 8)}…</div>
              </div>
            </div>

            {/* Sector / Year */}
            <div className="font-mono text-center text-[12px] text-dl-text2">
              {c.sector || '—'}
              {c.fiscal_year ? <span className="text-dl-text3"> · FY{c.fiscal_year}</span> : null}
            </div>

            {/* Ticker */}
            <div className="font-mono text-[12px] text-center">
              {c.ticker ? (
                <span className="text-dl-amber border border-[rgba(232,160,32,0.3)] bg-[rgba(232,160,32,0.08)] px-2 py-0.5 rounded text-[11px]">
                  {c.ticker}
                </span>
              ) : (
                <span className="text-dl-text3">—</span>
              )}
            </div>

            {/* Keywords */}
            <div className="flex flex-wrap gap-1 justify-center">
              {(c.keywords ?? []).slice(0, 3).map((k) => (
                <span key={k} className="font-mono text-[9px] px-1.5 py-0.5 rounded border border-dl-border2 bg-dl-surface2 text-dl-text3">
                  {k}
                </span>
              ))}
              {(c.keywords ?? []).length > 3 && (
                <span className="font-mono text-[9px] text-dl-text3">+{(c.keywords?.length ?? 0) - 3}</span>
              )}
              {!c.keywords?.length && <span className="font-mono text-[10px] text-dl-text3">—</span>}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
