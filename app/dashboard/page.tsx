'use client'

import { useRouter } from 'next/navigation'
import Topbar from '@/app/components/dashboard/Topbar'
import CompaniesTable from '@/app/components/dashboard/CompaniesTable'
import { useEffect, useState } from 'react'

const stats = [
  { label: 'Companies Tracked', value: '4',   sub: '↑ 2 this month',        subColor: 'text-dl-green' },
  { label: 'Documents Indexed', value: '11',  sub: '↑ 3 this week',          subColor: 'text-dl-green' },
  { label: 'Queries Run',       value: '38',  sub: 'avg conf 0.79',           subColor: 'text-dl-amber' },
  { label: 'Avg Risk Level',    value: 'Med', sub: '2 High · 1 Low',         subColor: 'text-dl-red',  valueColor: 'text-dl-yellow' },
]

export default function DashboardPage() {
  const [companies,setCompanies] = useState([])
  const base_url = process.env.NEXT_PUBLIC_BACKEND_URL
  useEffect(()=>{
    async function getCompanies() {
      try {
        const res = await fetch(base_url+'/auth/login', {
          method:      'POST',
          credentials: 'include',
          headers:     { 'Content-Type': 'application/json' },
          body:        JSON.stringify({ email, password }),
        })
      } catch {
        
      } finally {
        setLoading(false)
      }
    }
  },[])
  const router = useRouter()

  return (
    <>
      <Topbar
        title="Dashboard"
        actionLabel="request filings"
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
              {/* top accent line */}
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
              View all →
            </button>
          </div>
          <CompaniesTable />
        </div>

        {/* Quick analyse -----will be impletemented later */}
        {/* <div>
          <div className="mb-3.5">
            <div className="font-serif text-[16px] font-normal text-dl-text">Quick Analyse</div>
            <div className="font-mono text-[11px] text-dl-text3 mt-0.5">Run a query against any company</div>
          </div>
          <div className="flex gap-2.5 items-start">
            <textarea
              rows={2}
              placeholder="e.g. What are the key revenue risks for Tesla in 2024?"
              className="flex-1 bg-dl-surface border border-dl-border rounded-lg text-dl-text text-[13px] px-3.5 py-2.5 outline-none resize-none placeholder:text-dl-text3 focus:border-dl-amber focus:shadow-[0_0_0_3px_rgba(232,160,32,0.08)] transition-all"
            />
            <button
              onClick={() => router.push('/dashboard/analyse')}
              className="flex items-center gap-2 px-4 h-11 text-[13px] font-medium text-dl-bg bg-dl-amber border border-dl-amber rounded-lg hover:bg-[#f0b030] transition-all shrink-0"
            >
              Run
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div> */}
      </div>
    </>
  )
}
