'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { Lock, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import AuthLayout from '@/app/components/auth/AuthLayout'
import { Button }  from '@/app/components/ui/Button'
import { Input }   from '@/app/components/ui/Input'

const features = [
  {
    icon: <Lock size={14} strokeWidth={2} />,
    name: 'Secure reset link',
    desc: 'One-time · expires in 15 min',
  },
  {
    icon: <Mail size={14} strokeWidth={2} />,
    name: 'Check your inbox',
    desc: 'Powered by Supabase Auth',
  },
]

function SuccessState({
  email,
  onResend,
}: {
  email: string
  onResend: () => void
}) {
  const [resent, setResent] = useState(false)

  function handleResend() {
    setResent(true)
    onResend()
    setTimeout(() => setResent(false), 3000)
  }

  return (
    <div className="animate-fade-in text-center">
      {/* Icon */}
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[rgba(72,196,122,0.12)] border border-[rgba(72,196,122,0.3)] mx-auto mb-5">
        <CheckCircle size={24} className="text-dl-green" />
      </div>

      <h2 className="font-serif font-light text-[28px] tracking-tight text-dl-text mb-3">
        Check your inbox
      </h2>
      <p className="text-[13px] text-dl-text2 font-light leading-relaxed mb-8 max-w-[300px] mx-auto">
        We&apos;ve sent a password reset link to{' '}
        <strong className="text-dl-amber font-medium">{email}</strong>. It expires in 15 minutes.
      </p>

      <div className="flex flex-col gap-2.5">
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 w-full py-2.5 text-[13px] font-medium text-dl-bg bg-dl-amber border border-dl-amber rounded-lg hover:bg-[#f0b030] transition-all"
        >
          Back to sign in
        </Link>
        <button
          onClick={handleResend}
          disabled={resent}
          className="w-full py-2.5 text-[13px] text-dl-text2 bg-dl-surface2 border border-dl-border rounded-lg hover:border-dl-border2 hover:text-dl-text transition-all disabled:opacity-60"
        >
          {resent ? '✓ Sent!' : 'Resend email'}
        </button>
      </div>

      <p className="mt-6 font-mono text-[10px] text-dl-text3">
        Didn&apos;t get it? Check your spam folder.
      </p>
    </div>
  )
}

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Supabase handles password reset emails automatically
      // In production: call your FastAPI endpoint or Supabase directly
      await new Promise((r) => setTimeout(r, 1000)) // simulate request
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      leftTitle={
        <>Reset your<br /><em className="italic text-dl-amber">password</em></>
      }
      leftSubtitle="We'll send a secure reset link to your email address. It expires in 15 minutes."
      features={features}
    >
      {sent ? (
        <SuccessState email={email} onResend={() => setSent(false)} />
      ) : (
        <>
          {/* Header */}
          <div className="mb-7 animate-fade-up opacity-0">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-[12px] text-dl-text3 hover:text-dl-amber transition-colors mb-5 font-mono"
            >
              <ArrowLeft size={13} />
              Back to sign in
            </Link>
            <h1 className="font-serif font-light text-[28px] tracking-tight text-dl-text mb-1.5">
              Forgot password?
            </h1>
            <p className="text-[13px] text-dl-text2 font-light">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="animate-fade-up delay-1 opacity-0 flex flex-col gap-4"
          >
            <Input
              label="Email address"
              type="email"
              placeholder="analyst@fund.com"
              hint="The email address associated with your account"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {error && (
              <p className="font-mono text-[11px] text-dl-red bg-[rgba(224,85,85,0.08)] border border-[rgba(224,85,85,0.2)] rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button
              variant="primary"
              fullWidth
              type="submit"
              disabled={loading}
              className="py-2.5"
            >
              {loading ? 'Sending…' : 'Send reset link →'}
            </Button>
          </form>

          <p className="animate-fade-up delay-2 opacity-0 mt-6 text-center font-mono text-[10px] text-dl-text3">
            Remember it?{' '}
            <Link href="/login" className="text-dl-amber hover:underline">
              Sign in instead
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  )
}
