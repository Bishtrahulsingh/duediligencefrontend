import Link from 'next/link'

export function CTA() {
  return (
    <section className="relative px-5 md:px-14 py-[90px] flex flex-col items-center text-center gap-7 overflow-hidden">
      <div className="cta-orb absolute inset-0 pointer-events-none" />
      <h2 className="relative font-serif font-light text-[clamp(32px,5vw,56px)] leading-[1.1] tracking-[-1.5px] text-dl-text max-w-[600px]">
        Ready to run your first{' '}
        <em className="italic text-dl-amber">analysis?</em>
      </h2>
      <p className="relative text-[14px] text-dl-text2 font-light">
        Free to start. No credit card required.
      </p>
      <div className="relative flex items-center gap-3">
        <Link
          href="/signup"
          className="flex items-center gap-2 px-7 py-3.5 text-[14px] font-medium text-dl-bg bg-dl-amber border border-dl-amber rounded-[10px] transition-all hover:bg-[#f0b030]"
        >
          Create free account
        </Link>
        <Link
          href="/login"
          className="px-7 py-3.5 text-[14px] text-dl-text2 border border-dl-border2 rounded-[10px] transition-all hover:bg-dl-surface2 hover:text-dl-text"
        >
          Signin
        </Link>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-dl-border px-14 py-6 flex items-center justify-between">
      <div className="font-mono text-[10px] text-dl-text3 tracking-[0.5px]">
        © 2026 Diligence Analyst · Built with FastAPI, Qdrant, Groq
      </div>
      <div className="flex items-center gap-5">
        {['Privacy', 'Terms', 'API Docs', 'GitHub'].map((link) => (
          <button
            key={link}
            className="font-mono text-[10px] text-dl-text3 hover:text-dl-amber transition-colors"
          >
            {link}
          </button>
        ))}
      </div>
    </footer>
  )
}
