'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, Lock, Clock } from 'lucide-react'
import AuthLayout from '@/app/components/auth/AuthLayout'
import { Button }  from '@/app/components/ui/Button'
import { Input }   from '@/app/components/ui/Input'
import { createClient } from '@/app/lib/supabase'

const features = [
  {
    icon: <Check size={14} strokeWidth={2.5} />,
    name: 'Free to start',
    desc: 'No credit card · unlimited queries',
  },
  {
    icon: <Lock size={14} strokeWidth={2} />,
    name: 'Your data stays yours',
    desc: 'Isolated per user · JWT secured',
  },
  {
    icon: <Clock size={14} strokeWidth={2} />,
    name: 'Analysis in seconds',
    desc: 'HyDE + hybrid RRF + reranker pipeline',
  },
]

function getStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: 'Enter a password', color: 'text-dl-text3' }
  let s = 0
  if (pw.length >= 8)        s++
  if (/[A-Z]/.test(pw))      s++
  if (/[0-9]/.test(pw))      s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', 'text-dl-red', 'text-dl-amber', 'text-dl-amber', 'text-dl-green']
  return { score: s, label: labels[s] || 'Weak', color: colors[s] || 'text-dl-red' }
}

function StrengthBar({ score }: { score: number }) {
  const barClass = (idx: number) => {
    if (idx >= score) return 'bg-dl-surface3'
    if (score <= 1)   return 'pw-bar-weak'
    if (score <= 3)   return 'pw-bar-medium'
    return 'pw-bar-strong'
  }
  return (
    <div className="flex gap-1">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`flex-1 h-0.75 rounded-full transition-all duration-300 ${barClass(i)}`}
        />
      ))}
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

export default function SignupPage() {
  const base_url = process.env.NEXT_PUBLIC_BACKEND_URL
  const router = useRouter()
  const [email,    setEmail]    = useState('')

  async function handleGoogleLogin() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const strength = getStrength(password)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (strength.score < 2) {
      setError('Please choose a stronger password')
      return
    }
    setLoading(true)
    try {
      // POST /auth/register  →  FastAPI creates user via Supabase
      const res = await fetch(base_url+'/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.detail ?? 'Registration failed')
        return
      }
      router.push('/login?registered=1')
    } catch {
      setError('Network error — is the API running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      leftTitle={
        <>Start your<br />first <em className="italic text-dl-amber">analysis</em><br />today</>
      }
      leftSubtitle="Join analysts who use Diligence to cut through SEC filings in minutes, not hours. Free to start."
      features={features}
    >
      {/* Header */}
      <div className="mb-7 animate-fade-up opacity-0">
        <h1 className="font-serif font-light text-[28px] tracking-tight text-dl-text mb-1.5">
          Create account
        </h1>
        <p className="text-[13px] text-dl-text2 font-light">
          Already have one?{' '}
          <Link href="/login" className="text-dl-amber hover:underline">
            Sign in →
          </Link>
        </p>
      </div>

      {/* Google */}
      <div className="animate-fade-up delay-1 opacity-0 mb-5">
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex items-center justify-center gap-2.5 w-full py-2.5 px-4 text-[13px] text-dl-text2 bg-dl-surface2 border border-dl-border rounded-lg hover:border-dl-border2 hover:text-dl-text transition-all">
          <GoogleIcon />
          Continue with Google
        </button>
      </div>

      {/* Divider */}
      <div className="animate-fade-up delay-1 opacity-0 flex items-center gap-3 mb-5 font-mono text-[10px] text-dl-text3 tracking-[1px] uppercase">
        <div className="flex-1 h-px bg-dl-border" />
        or
        <div className="flex-1 h-px bg-dl-border" />
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="animate-fade-up delay-2 opacity-0 flex flex-col gap-4"
      >
        <Input
          label="Email"
          type="email"
          placeholder="analyst@fund.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password + strength */}
        <div className="flex flex-col gap-1.5">
          <Input
            label="Password"
            showToggle
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <StrengthBar score={strength.score} />
          <span className={`font-mono text-[9px] tracking-[0.5px] ${strength.color}`}>
            {strength.label}
          </span>
        </div>

        <Input
          label="Confirm password"
          showToggle
          placeholder="••••••••"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={confirm && confirm !== password ? 'Passwords do not match' : undefined}
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
          className="mt-1 py-2.5"
        >
          {loading ? 'Creating account…' : 'Create account →'}
        </Button>
      </form>

      <p className="animate-fade-up delay-3 opacity-0 mt-5 text-center font-mono text-[10px] text-dl-text3 leading-relaxed">
        By signing up you agree to our{' '}
        <span className="text-dl-amber cursor-pointer hover:underline">Terms of Service</span>
        {' '}and{' '}
        <span className="text-dl-amber cursor-pointer hover:underline">Privacy Policy</span>
      </p>
    </AuthLayout>
  )
}