import { ReactNode } from 'react'
import Link from 'next/link'
import { FileText } from 'lucide-react'

interface AuthFeature {
  icon: ReactNode
  name: string
  desc: string
}

interface AuthLayoutProps {
  leftTitle:    ReactNode
  leftSubtitle: string
  features:     AuthFeature[]
  children:     ReactNode
}

export default function AuthLayout({
  leftTitle, leftSubtitle, features, children,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex justify-between">
      {/* ── LEFT PANEL ── */}
      <div className="hidden relative lg:flex lg:w-[40vw] flex-col bg-dl-surface border-r border-dl-border px-14 py-10 overflow-hidden">
        {/* Grid bg */}
        <div
          className="absolute inset-0 opacity-30 grid-mask-auth pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#222630 1px, transparent 1px), linear-gradient(90deg, #222630 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Orb */}
        <div className="auth-left-orb absolute w-125 h-0.5125 -bottom-24 -left-24 pointer-events-none" />

        {/* Brand */}
        <Link href="/" className="relative z-10 flex items-center gap-3 mb-auto no-underline w-fit">
          <div className="flex items-center justify-center w-9 h-9 bg-dl-amber rounded-[9px]">
            <FileText size={20} strokeWidth={2.5} className="text-dl-bg" />
          </div>
          <div>
            <div className="font-serif text-[18px] font-normal text-dl-text">Diligence</div>
            <div className="font-mono text-[8px] tracking-[1.5px] uppercase text-dl-amber leading-none">
              Analyst v1.0
            </div>
          </div>
        </Link>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-10">
          <h2 className="font-serif font-light text-[40px] leading-[1.15] tracking-[-1.2px] text-dl-text mb-4">
            {leftTitle}
          </h2>
          <p className="text-[14px] text-dl-text2 leading-[1.7] font-light max-w-85 mb-9">
            {leftSubtitle}
          </p>
          <div className="flex flex-col gap-3">
            {features.map(({ icon, name, desc }) => (
              <div
                key={name}
                className="flex items-start gap-3 px-3.5 py-3 bg-[rgba(17,19,24,0.7)] border border-dl-border rounded-[9px] backdrop-blur-sm transition-colors hover:border-[rgba(232,160,32,0.25)]"
              >
                <div className="flex items-center justify-center w-7 h-7 bg-[rgba(232,160,32,0.10)] border border-[rgba(232,160,32,0.2)] rounded-[7px] text-dl-amber shrink-0">
                  {icon}
                </div>
                <div>
                  <div className="text-[12px] font-medium text-dl-text">{name}</div>
                  <div className="font-mono text-[10px] text-dl-text3 mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 font-mono text-[10px] text-dl-text3">
          © 2026 Diligence Analyst
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex items-center justify-center w-full px-8 lg:px-14 lg:w-[60vw] py-10 bg-dl-bg">
        <div className="w-full max-w-95">
          {children}
        </div>
      </div>
    </div>
  )
}
