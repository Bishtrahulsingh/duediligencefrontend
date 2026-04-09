'use client'

import { useEffect, useState } from 'react'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_MAIL
const EMAIL_KEY   = 'dl_user_email'

export function useAdmin() {
  const [email,   setEmail]   = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  // ready = localStorage has been read. Until true, don't make any access decisions.
  const [ready,   setReady]   = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(EMAIL_KEY)
    setEmail(stored)
    setIsAdmin(stored === ADMIN_EMAIL)
    setReady(true)
  }, [])

  return { email, isAdmin, ready }
}

export function persistEmail(email: string) {
  localStorage.setItem(EMAIL_KEY, email)
}

export function clearEmail() {
  localStorage.removeItem(EMAIL_KEY)
}