import Nav          from '@/app/components/home/Nav'
import Hero         from '@/app/components/home/Hero'
import Ticker       from '@/app/components/home/Ticker'
import Features     from '@/app/components/home/Features'
import Preview      from '@/app/components/home/Preview'
import PipelineStrip from '@/app/components/home/PipelineStrip'
import { CTA, Footer } from '@/app/components/home/CtaFooter'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-dl-bg">
      <Nav />
      <Hero />
      <Ticker />
      <Features /> 
      <Preview />
      <PipelineStrip />
      <CTA />
      <Footer />
    </div> 
  )
}
