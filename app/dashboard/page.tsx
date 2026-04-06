'use client'

import { useRouter } from 'next/navigation'
import Topbar from '@/app/components/dashboard/Topbar'
import CompaniesTable from '@/app/components/dashboard/CompaniesTable'
import { useCompanies } from '@/app/lib/CompaniesContext'

export default function DashboardPage() {
  const router = useRouter()
  const { companies, loading } = useCompanies()

  const stats = [
    {
      label: 'Companies Tracked',
      value: loading ? '…' : String(companies.length),
      sub: 'tracked entities',
      subColor: 'text-dl-green',
    },
    {
      label: 'Fiscal Years',
      value: loading ? '…' : String(new Set(companies.map((c) => c.fiscal_year).filter(Boolean)).size || '—'),
      sub: 'unique years indexed',
      subColor: 'text-dl-amber',
    },
    {
      label: 'Sectors',
      value: loading ? '…' : String(new Set(companies.map((c) => c.sector).filter(Boolean)).size || '—'),
      sub: 'sectors covered',
      subColor: 'text-dl-amber',
    },
    {
      label: 'Pipeline',
      value: 'Live',
      sub: 'Qdrant · Groq · Gemini',
      subColor: 'text-dl-green',
      valueColor: 'text-dl-green',
    },
  ]

  return (
    <>
      <Topbar
        title="Dashboard"
        actionLabel="Request filings"
        onAction={() => router.push('/dashboard/companies')}
      />

      <div className="p-7 flex flex-col gap-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {stats.map(({ label, value, sub, subColor, valueColor }) => (
            <div
              key={label}
              className="relative bg-dl-surface border border-dl-border rounded-xl p-5 overflow-hidden group hover:border-dl-border2 transition-colors"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-dl-amber opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="font-mono text-[10px] tracking-[1.2px] uppercase text-dl-text3 mb-2.5">
                {label}
              </div>
              <div className={`font-serif text-[30px] font-light leading-none mb-1.5 ${valueColor ?? 'text-dl-text'}`}>
                {value}
              </div>
              <div className={`font-mono text-[11px] ${subColor}`}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Companies table */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <div className="font-serif text-[16px] font-normal text-dl-text">Tracked Companies</div>
              <div className="font-mono text-[11px] text-dl-text3 mt-0.5">Click any row to open analysis</div>
            </div>
            <button
              onClick={() => router.push('/dashboard/companies')}
              className="text-[13px] text-dl-text2 hover:text-dl-amber transition-colors font-mono"
            >
              Manage →
            </button>
          </div>
          <CompaniesTable clickable />
        </div>
      </div>
    </>
  )
}
