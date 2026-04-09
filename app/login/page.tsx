'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Activity, Shield, FileText } from 'lucide-react'
import AuthLayout from '@/app/components/auth/AuthLayout'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'

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
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(base_url + '/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
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

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="animate-fade-up delay-1 opacity-0 flex flex-col gap-4"
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

      <p className="animate-fade-up delay-2 opacity-0 mt-5 text-center font-mono text-[10px] text-dl-text3">
        Protected by secure auth ·{' '}
        <span className="text-dl-amber cursor-pointer hover:underline">Privacy Policy</span>
      </p>
    </AuthLayout>
  )
}