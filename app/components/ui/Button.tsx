'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/app/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline'
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'outline', fullWidth, className, children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-sans rounded-lg border transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed'

    const variants = {
      primary: 'bg-dl-amber border-dl-amber text-dl-bg font-medium hover:bg-[#f0b030] hover:border-[#f0b030]',
      ghost:   'bg-transparent border-dl-border text-dl-text2 hover:bg-dl-surface2 hover:text-dl-text hover:border-dl-border2',
      outline: 'bg-transparent border-dl-border text-dl-text2 hover:bg-dl-surface2 hover:text-dl-text hover:border-dl-border2',
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], fullWidth && 'w-full', className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
