import type { ArticlePart } from '@/lib/editorial-article'
import { EditorialFaqList } from '@/components/editorial-faq-list'
import { EditorialRichText } from '@/components/editorial-rich-text'

const bodyType = 'font-serif text-[17px] leading-8 text-[#4f4e49] sm:text-[19px]'

export function EditorialArticleBody({ parts }: { parts: ArticlePart[] }) {
  return <div className="space-y-12">{parts.map((part, index) => {
    if (part.kind === 'html') return <div key={index} className={`wordpress-content comparison-article ${bodyType}`} dangerouslySetInnerHTML={{ __html: part.html }} />
    if (part.kind === 'quick-answer') return <section key={part.heading.id} aria-labelledby={part.heading.id} className="editorial-quick-answer scroll-mt-48 rounded-2xl border border-[#e5e0d5] border-t-4 border-t-[#e86d35] bg-[#f6f3ec] p-5 sm:p-7">
      <h3 id={part.heading.id} className="scroll-mt-48 font-sans text-2xl font-black tracking-tight sm:text-3xl">{part.heading.label}</h3>
      <div className={`wordpress-content mt-4 ${bodyType}`} dangerouslySetInnerHTML={{ __html: part.html }} />
    </section>
    return <section key={part.heading.id} id={part.heading.id} className="scroll-mt-48" aria-label={part.heading.label}>
      <h2 className="font-sans text-4xl font-black leading-tight tracking-tight sm:text-5xl">{part.heading.label}</h2>
      {part.introductionHtml && <EditorialRichText value={part.introductionHtml} className={`mt-4 ${bodyType}`} />}
      <EditorialFaqList faqs={part.faqs} articleAnswers />
    </section>
  })}</div>
}
