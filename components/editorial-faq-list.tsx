import { ArrowDown } from 'lucide-react'
import { EditorialRichText } from '@/components/editorial-rich-text'
import { sanitizeCmsArticleHtml } from '@/lib/cms-rich-text'

export type EditorialFaq = { id?: string; question: string; answer: string; answerHtml?: string }

/** Shared by buying guides and comparisons so their FAQ appearance stays identical. */
export function EditorialFaqList({ faqs, articleAnswers = false }: { faqs: EditorialFaq[]; articleAnswers?: boolean }) {
  const answerClass = 'ml-14 mt-4 font-serif text-[17px] leading-8 text-[#4f4e49] sm:text-[19px]'
  return <div className="mt-4 border-t border-[#d9d8d2]">{faqs.map(({ id, question, answer, answerHtml }) => <details key={id || question} id={id} className="group scroll-mt-48 border-b border-[#d9d8d2] py-4 sm:py-5"><summary className="flex cursor-pointer list-none items-center gap-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e86d35] [&::-webkit-details-marker]:hidden"><span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#898880] text-[#161616]"><ArrowDown aria-hidden="true" className="size-5 transition-transform duration-200 group-open:rotate-180" /></span><span className="text-base font-black leading-snug sm:text-lg">{question}</span></summary>{articleAnswers && answerHtml ? <div className={`wordpress-content cms-rich-text ${answerClass}`} dangerouslySetInnerHTML={{ __html: sanitizeCmsArticleHtml(answerHtml) }} /> : <EditorialRichText value={answerHtml || answer} className={answerClass} />}</details>)}</div>
}
