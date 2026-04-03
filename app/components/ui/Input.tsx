'use client'

import { InputHTMLAttributes, forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/app/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:   string
  hint?:    string
  error?:   string
  showToggle?: boolean  // for password fields
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, showToggle, className, type, ...props }, ref) => {
    const [show, setShow] = useState(false)
    const inputType = showToggle ? (show ? 'text' : 'password') : type

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="font-mono text-[10px] tracking-[1.2px] uppercase text-dl-text3">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={cn(
              'w-full bg-dl-surface2 border border-dl-border rounded-lg text-dl-text text-[13px] px-3.5 py-2.5 outline-none transition-all duration-150',
              'placeholder:text-dl-text3',
              'focus:border-dl-amber focus:shadow-[0_0_0_3px_rgba(232,160,32,0.08)]',
              error && 'border-dl-red',
              showToggle && 'pr-10',
              className
            )}
            {...props}
          />
          {showToggle && (
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dl-text3 hover:text-dl-amber transition-colors"
            >
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          )}
        </div>
        {hint  && !error && <p className="font-mono text-[10px] text-dl-text3">{hint}</p>}
        {error &&           <p className="font-mono text-[10px] text-dl-red">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
