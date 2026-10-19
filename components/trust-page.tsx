import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Breadcrumbs } from '@/components/affiliate-site'

export type TrustPageSection = {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
  links?: { label: string; href: string }[]
}

export function TrustPage({ title, intro, sections, contactEmail, updatedAt }: {
  title: string
  intro: string
  sections: TrustPageSection[]
  contactEmail?: string
  updatedAt?: string
}) {
  return (
    <main id="top" className="mx-auto max-w-7xl bg-[#fafaf8] px-5 py-10 text-[#161616] sm:py-14 lg:px-8">
      <Breadcrumbs items={[{ label: title }]} />
      <article className="mx-auto max-w-3xl">
        <header className="border-b border-[#e5e4df] pb-8 sm:pb-10">
          <p className="text-xs font-bold tracking-[0.18em] text-[#a74520]">SOLEMART · TRUST & TRANSPARENCY</p>
          <h1 className="mt-3 font-sans text-4xl font-black leading-tight tracking-[-0.04em] sm:text-6xl">{title}</h1>
          <p className="mt-5 font-serif text-lg leading-8 text-[#4f4e49] sm:text-xl">{intro}</p>
          {updatedAt && <p className="mt-5 text-sm text-[#68675f]">Last updated: <time dateTime={updatedAt}>{new Date(`${updatedAt}T12:00:00Z`).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'Africa/Nairobi' })}</time></p>}
          {contactEmail && <a href={`mailto:${contactEmail}`} className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#161616] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#e86d35]">Email {contactEmail}<ArrowRight aria-hidden="true" className="size-4" /></a>}
        </header>
        {sections.length >= 6 && <nav aria-label="On this policy page" className="mt-8 rounded-xl border border-[#e5e4df] bg-white p-5 sm:p-6">
          <h2 className="text-lg font-bold">On this page</h2>
          <ol className="mt-4 grid list-decimal gap-x-8 gap-y-3 pl-5 text-base sm:grid-cols-2">
            {sections.map((section, index) => <li key={section.heading}><a href={`#trust-section-${index + 1}`} className="text-[#4f4e49] underline decoration-[#c9c7bf] underline-offset-4 hover:text-[#c65325]">{section.heading}</a></li>)}
          </ol>
        </nav>}
        <div className="divide-y divide-[#e5e4df]">
          {sections.map((section, index) => <section key={section.heading} aria-labelledby={`trust-section-${index + 1}`} className="py-8 sm:py-9">
            <h2 id={`trust-section-${index + 1}`} className="scroll-mt-40 font-sans text-2xl font-black tracking-tight sm:text-3xl">{section.heading}</h2>
            {section.paragraphs?.map((paragraph) => <p key={paragraph} className="mt-4 font-serif text-base leading-8 text-[#4f4e49] sm:text-lg">{paragraph}</p>)}
            {section.bullets && <ul className="mt-4 list-disc space-y-2 pl-5 font-serif text-base leading-8 text-[#4f4e49] sm:text-lg">{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
            {section.links && <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-base font-semibold text-[#a74520]">{section.links.map((link) => <li key={link.href}><Link href={link.href} className="underline underline-offset-4 hover:text-[#161616]">{link.label}</Link></li>)}</ul>}
          </section>)}
        </div>
        {!contactEmail && <p className="border-t border-[#e5e4df] pt-5 text-sm text-[#68675f]">Have a question? <Link href="/contact" className="font-semibold underline underline-offset-4 hover:text-[#c65325]">Contact the SOLEMART team</Link>.</p>}
      </article>
    </main>
  )
}
