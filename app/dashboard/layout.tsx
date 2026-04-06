import { ReactNode } from 'react'
import Sidebar from '@/app/components/dashboard/Sidebar'
import { CompaniesProvider } from '@/app/lib/CompaniesContext'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <CompaniesProvider>
      <div className="block z-10 md:flex bg-dl-bg min-h-screen">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-y-auto min-h-screen">
          {children}
        </main>
      </div>
    </CompaniesProvider>
  )
}
