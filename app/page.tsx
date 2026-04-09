'use client'

import Nav          from '@/app/components/home/Nav'
import Hero         from '@/app/components/home/Hero'
import Ticker       from '@/app/components/home/Ticker'
import Features     from '@/app/components/home/Features'
import Preview      from '@/app/components/home/Preview'
import PipelineStrip from '@/app/components/home/PipelineStrip'
import { CTA, Footer } from '@/app/components/home/CtaFooter'
import { useEffect } from 'react'

export default function HomePage() {

  useEffect(()=>{
    async function c(){
      const res = await fetch('https://diligence-analyst.onrender.com')
      console.log(await res.json())
      console.log("hey this is called")
    }
    c()
  },[])
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
