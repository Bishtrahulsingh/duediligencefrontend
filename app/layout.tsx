import type { Metadata } from 'next'
import { DM_Mono, DM_Sans, Fraunces } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['200', '300', '400', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Diligence Analyst — AI-Powered Due Diligence',
  description:
    'Upload SEC filings. Ask anything. Get analyst-grade answers grounded strictly in the documents — no hallucinations, no guesswork.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmMono.variable} ${dmSans.variable}`}>
      <body className="font-sans bg-dl-bg text-dl-text antialiased">
        {children}
      </body>
    </html>
  )
}
