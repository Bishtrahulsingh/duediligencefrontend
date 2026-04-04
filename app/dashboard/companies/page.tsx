'use client'

import { useState, FormEvent } from 'react'
import Topbar from '@/app/components/dashboard/Topbar'
import CompaniesTable, { DEMO_COMPANIES } from '@/app/components/dashboard/CompaniesTable'
import { Input } from '@/app/components/ui/Input'
import { Button } from '@/app/components/ui/Button'

const SECTORS = ['Technology', 'Healthcare', 'Automotive', 'Finance', 'Media', 'Audio', 'Other']

export default function CompaniesPage() {
  const base_url = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''
  const [name,     setName]     = useState('')
  const [ticker,   setTicker]   = useState('')
  const [sector,   setSector]   = useState('Technology')
  const [desc,     setDesc]     = useState('')
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${base_url}/api/v1/company`, {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, ticker: ticker.toUpperCase(), sector }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.detail ?? 'Failed to create company')
        return
      }
      setSuccess(true)
      setName(''); setTicker(''); setDesc('')
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Network error — is the API running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Topbar title="Companies" actionLabel="request filings" onAction={() => {}} />

      <div className="p-7 lg:grid lg:grid-cols-[1fr_360px] gap-6 flex flex-wrap ">
        {/* Table */}
        <div>
          <div className="mb-4">
            <div className="font-serif text-[16px] font-normal text-dl-text">All Companies</div>
            <div className="font-mono text-[11px] text-dl-text3 mt-0.5">Manage tracked entities</div>
          </div>
          <CompaniesTable companies={DEMO_COMPANIES} clickable={false} />
        </div>

        {/* Form */}
        <div className='w-full'>
          <div className="mb-4">
            <div className="font-serif text-[16px] font-normal text-dl-text">Request filings of companies</div>
          </div>

          <div className="bg-dl-surface border border-dl-border rounded-xl p-5">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Company Name"
                placeholder="e.g. OpenAI, Inc."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <div className="grid grid-cols-1 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] tracking-[1.2px] uppercase text-dl-text3">
                    Sector
                  </label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full bg-dl-surface2 border border-dl-border rounded-lg text-dl-text2 font-mono text-[12px] px-3 py-2.5 outline-none focus:border-dl-amber cursor-pointer"
                  >
                    {SECTORS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] tracking-[1.2px] uppercase text-dl-text3">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief description of the company…"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-dl-surface2 border border-dl-border rounded-lg text-dl-text text-[13px] px-3.5 py-2.5 outline-none resize-none placeholder:text-dl-text3 focus:border-dl-amber focus:shadow-[0_0_0_3px_rgba(232,160,32,0.08)] transition-all"
                />
              </div>

              {error && (
                <p className="font-mono text-[11px] text-dl-red bg-[rgba(224,85,85,0.08)] border border-[rgba(224,85,85,0.2)] rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              {success && (
                <p className="font-mono text-[11px] text-dl-green bg-[rgba(72,196,122,0.08)] border border-[rgba(72,196,122,0.2)] rounded-lg px-3 py-2">
                  ✓ Company created successfully
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <Button variant="ghost" type="button" className="flex-1" onClick={() => { setName(''); setTicker(''); setDesc('') }}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={loading} className="flex-[2]">
                  {loading ? 'Creating…' : 'Send Request →'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
