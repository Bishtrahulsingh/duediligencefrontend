// In login/page.tsx and signup/page.tsx
'use client'
import { createClient } from '@/app/lib/supabase'
import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Activity, Shield, FileText } from 'lucide-react'
import AuthLayout from '@/app/components/auth/AuthLayout'
import { Button }  from '@/app/components/ui/Button'
import { Input }   from '@/app/components/ui/Input'




function GoogleButton() {
  async function handleGoogleSignIn() {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) console.error(error)
  }

  return (
    <button
      onClick={handleGoogleSignIn}
      className="flex items-center justify-center gap-2.5 w-full py-2.5 px-4 text-[13px] text-dl-text2 bg-dl-surface2 border border-dl-border rounded-lg hover:border-dl-border2 hover:text-dl-text transition-all"
    >
      <GoogleIcon />
      Continue with Google
    </button>
  )
}

const features = [
  {
    icon: <Activity size={14} strokeWidth={2} />,
    name: 'Live analysis stream',
    desc: 'SSE · real-time · zero latency feel',
  },
  {
    icon: <Shield size={14} strokeWidth={2} />,
    name: 'Hallucination-free answers',
    desc: 'Judge LLM · faithfulness scored',
  },
  {
    icon: <FileText size={14} strokeWidth={2} />,
    name: 'SEC filing access',
    desc: 'EDGAR · 10-K · 10-Q · direct URL',
  },
]

export default function LoginPage() {
  const base_url = process.env.NEXT_PUBLIC_BACKEND_URL
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(base_url+'/auth/login', {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.detail ?? 'Login failed')
        return
      }
      router.push('/dashboard')
    } catch {
      setError('Network error — is the API running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      leftTitle={
        <>Welcome<br />back,<br /><em className="italic text-dl-amber">analyst</em></>
      }
      leftSubtitle="Your companies, documents, and analyses are waiting. Sign in to continue your due diligence workflow."
      features={features}
    >
      {/* Header */}
      <div className="mb-7 animate-fade-up opacity-0">
        <h1 className="font-serif font-light text-[28px] tracking-tight text-dl-text mb-1.5">
          Sign in
        </h1>
        <p className="text-[13px] text-dl-text2 font-light">
          No account?{' '}
          <Link href="/signup" className="text-dl-amber hover:underline">
            Create one free →
          </Link>
        </p>
      </div>

      {/* Google */}
      <div className="animate-fade-up delay-1 opacity-0 mb-5">
        <GoogleButton/>
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
        <div>
          <Input
            label="Password"
            showToggle
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="flex justify-end mt-1.5">
            <Link
              href="/forgot-password"
              className="font-mono text-[10px] text-dl-text3 hover:text-dl-amber transition-colors tracking-[0.5px]"
            >
              Forgot password?
            </Link>
          </div>
        </div>

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
          {loading ? 'Signing in…' : 'Sign in →'}
        </Button>
      </form>

      <p className="animate-fade-up delay-3 opacity-0 mt-5 text-center font-mono text-[10px] text-dl-text3">
        Protected by Supabase Auth ·{' '}
        <span className="text-dl-amber cursor-pointer hover:underline">Privacy Policy</span>
      </p>
    </AuthLayout>
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
