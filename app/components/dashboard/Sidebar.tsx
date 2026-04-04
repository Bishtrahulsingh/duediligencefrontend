'use client'

import { Button } from '../ui/Button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FileText, LayoutGrid, Search, Building2,
  FolderOpen, Activity, Code2,
} from 'lucide-react'
import { cn } from '@/app/lib/utils'

const navItems = [
  { section: 'Overview', items: [
    { label: 'Dashboard', href: '/dashboard',          icon: LayoutGrid ,badge:'' },
    { label: 'Analyse',   href: '/dashboard/analyse',  icon: Search,    badge: 'AI' },
  ]},
  { section: 'Management', items: [
    { label: 'Companies', href: '/dashboard/companies', icon: Building2,  badge: '4' },
    { label: 'Documents', href: '/dashboard/documents', icon: FolderOpen, badge: '11' },
  ]},
  { section: 'System', items: [
    { label: 'Pipeline',  href: '/dashboard/pipeline',  icon: Activity,   dot: true },
    { label: 'API Docs',  href: '#',                    icon: Code2 , badge:''},
  ]},
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="md:flex flex-col md:w-55 shrink-0 h-fit md:h-screen sticky top-0 bg-dl-surface border-r border-dl-border z-10">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-dl-border flex justify-between md:block ">
        <Link href="/" className="flex items-center gap-3 no-underline w-fit">
          <div className="flex items-center justify-center w-8 h-8 bg-dl-amber rounded-lg">
            <FileText size={16} strokeWidth={2.5} className="text-dl-bg" />
          </div>
          <div>
            <div className="font-serif text-[16px] font-normal text-dl-text tracking-tight">
              Diligence
            </div>
            <div className="font-mono text-[8px] tracking-[1.5px] uppercase text-dl-amber leading-none">
              Analyst v1.0
            </div>
          </div>
        </Link>
        <Link  href={'/dashboard/companies'}>
        <Button className='bg-dl-amber text-black block md:hidden '>
          request filings
        </Button>
        </Link>
      </div>

      {/* Nav */}
      <nav className="hidden flex-1 px-3 py-4 md:flex flex-col gap-0.5">
        {navItems.map(({ section, items }) => (
          <div key={section} className="mb-2">
            <div className="font-mono text-[9px] tracking-[1.5px] uppercase text-dl-text3 px-2 py-2 mt-2">
              {section}
            </div>
            {items.map(({ label, href, icon: Icon, badge, dot }) => {
              const active = pathname === href
              return (
                <Link
                  key={label}
                  href={href}
                  className={cn(
                    'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all duration-150 no-underline mb-0.5',
                    active
                      ? 'bg-[rgba(232,160,32,0.10)] text-dl-amber border border-[rgba(232,160,32,0.2)]'
                      : 'text-dl-text2 border border-transparent hover:bg-dl-surface2 hover:text-dl-text'
                  )}
                >
                  <Icon size={15} strokeWidth={2} />
                  <span className="flex-1">{label}</span>
                  {badge && (
                    <span className={cn(
                      'font-mono text-[10px] px-1.5 py-0.5 rounded-full',
                      active
                        ? 'bg-[rgba(232,160,32,0.15)] text-dl-amber'
                        : 'bg-dl-surface3 text-dl-text3'
                    )}>
                      {badge}
                    </span>
                  )}
                  {dot && (
                    <span className="w-1.5 h-1.5 rounded-full bg-dl-green shadow-[0_0_4px_#48c47a]" />
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="hidden md:block px-3 py-4 border-t border-dl-border">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-dl-surface2 cursor-pointer hover:bg-dl-surface3 transition-colors">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-linear-to-br from-[#a06510] to-dl-amber font-mono text-[11px] text-dl-bg font-medium shrink-0">
            RA
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-medium text-dl-text truncate">Rahul A.</div>
            <div className="font-mono text-[10px] text-dl-text3">analyst</div>
          </div>
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-dl-text3 shrink-0">
            <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
          </svg>
        </div>
      </div>
    </aside>
  )
}
