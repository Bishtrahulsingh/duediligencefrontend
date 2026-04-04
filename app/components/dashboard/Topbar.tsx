'use client'

import { ReactNode } from 'react'
import { Button } from '@/app/components/ui/Button'

interface TopbarProps {
  title:       string
  actionLabel: string
  actionIcon?: ReactNode
  onAction?:   () => void
}

export default function Topbar({ title, actionLabel, actionIcon, onAction }: TopbarProps) {
  return (
    <div className="hidden md:flex items-center gap-4 px-7 py-3.5 border-b border-dl-border bg-dl-surface sticky top-0 z-10">
      <h1 className="font-serif text-[18px] font-normal text-dl-text flex-1 tracking-tight">
        {title}
      </h1>

      <Button variant="primary" onClick={onAction} className="gap-1.5">
        {actionIcon ?? (
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        )}
        {actionLabel}
      </Button>
    </div>
  )
}
