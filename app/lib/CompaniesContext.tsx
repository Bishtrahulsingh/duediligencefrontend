'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { companies as companiesApi, Company } from '@/app/lib/api'

interface CompaniesContextValue {
  companies: Company[]
  loading: boolean
  error: string
  refresh: () => Promise<void>
}

const CompaniesContext = createContext<CompaniesContextValue>({
  companies: [],
  loading: false,
  error: '',
  refresh: async () => {},
})

export function CompaniesProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await companiesApi.list()
      setCompanies(Array.isArray(data) ? data : [])
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message)
      else setError('Failed to load companies')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <CompaniesContext.Provider value={{ companies, loading, error, refresh }}>
      {children}
    </CompaniesContext.Provider>
  )
}

export function useCompanies() {
  return useContext(CompaniesContext)
}
