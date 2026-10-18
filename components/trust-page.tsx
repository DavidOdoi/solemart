import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Breadcrumbs } from '@/components/affiliate-site'

export type TrustPageSection = {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
}

export function TrustPage({ title, intro, sections, contactEmail }: {
  title: string
  intro: string
  sections: TrustPageSection[]
  contactEmail?: string
}) {
  return (
    <main id="top" className="mx-auto max-w-7xl px-5 py-10 sm:py-14 lg:px-8">
      <Breadcrumbs items={[{ label: title }]} />
      <article className="mx-auto max-w-3xl">
        <header className="border-b border-[#e5e4df] pb-8 sm:pb-10">
          <p className="text-xs font-bold tracking-[0.18em] text-[#c65325]">SOLEMART · TRUST & TRANSPARENCY</p>
          <h1 className="mt-3 font-sans text-4xl font-black leading-tight tracking-[-0.04em] sm:text-6xl">{title}</h1>
          <p className="mt-5 font-serif text-lg leading-8 text-[#4f4e49] sm:text-xl">{intro}</p>
          {contactEmail && <a href={`mailto:${contactEmail}`} className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#161616] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#e86d35]">Email {contactEmail}<ArrowRight aria-hidden="true" className="size-4" /></a>}
        </header>
        <div className="divide-y divide-[#e5e4df]">
          {sections.map((section, index) => <section key={section.heading} aria-labelledby={`trust-section-${index + 1}`} className="py-8 sm:py-9">
            <h2 id={`trust-section-${index + 1}`} className="font-sans text-2xl font-black tracking-tight sm:text-3xl">{section.heading}</h2>
            {section.paragraphs?.map((paragraph) => <p key={paragraph} className="mt-4 font-serif text-base leading-8 text-[#4f4e49] sm:text-lg">{paragraph}</p>)}
            {section.bullets && <ul className="mt-4 list-disc space-y-2 pl-5 font-serif text-base leading-8 text-[#4f4e49] sm:text-lg">{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
          </section>)}
        </div>
        {!contactEmail && <p className="border-t border-[#e5e4df] pt-5 text-sm text-[#68675f]">Have a question? <Link href="/contact" className="font-semibold underline underline-offset-4 hover:text-[#c65325]">Contact the SOLEMART team</Link>.</p>}
      </article>
    </main>
  )
}
