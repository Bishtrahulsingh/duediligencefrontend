'use client'

import Link from 'next/link'
import { FileText } from 'lucide-react'

export default function Nav() {
  return (
    <nav className="nav-backdrop sticky top-0 z-50 border-b border-dl-border">
      <div className="flex items-center px-14 py-5">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="flex items-center justify-center w-9 h-9 bg-dl-amber rounded-[9px]">
            <FileText size={18} strokeWidth={2.5} className="text-dl-bg" />
          </div>
          <div>
            <div className="font-serif text-[17px] font-normal text-dl-text tracking-tight">
              Diligence
            </div>
            <div className="font-mono text-[8px] tracking-[1.5px] uppercase text-dl-amber leading-none">
              Analyst
            </div>
          </div>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1.5 ml-auto">
          {['Features', 'Pipeline', 'Docs'].map((item) => (
            <button
              key={item}
              className="px-3.5 py-1.5 text-[13px] text-dl-text2 rounded-lg transition-colors hover:text-dl-text hover:bg-dl-surface2 font-sans"
            >
              {item}
            </button>
          ))}
          <Link
            href="/login"
            className="ml-2 px-4 py-2 text-[13px] text-dl-text2 border border-dl-border rounded-lg transition-all hover:bg-dl-surface2 hover:text-dl-text"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 text-[13px] font-medium text-dl-bg bg-dl-amber border border-dl-amber rounded-lg transition-all hover:bg-[#f0b030]"
          >
            Get started →
          </Link>
        </div>
      </div>
    </nav>
  )
}
