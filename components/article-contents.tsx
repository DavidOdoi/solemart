import { ChevronDown } from 'lucide-react'
import type { ArticleHeading } from '@/lib/article-details'

export function ArticleContents({ headings }: { headings: ArticleHeading[] }) {
  if (!headings.length) return null
  return (
    <details id="article-contents" open className="group mb-8 rounded-xl border border-[#e5e4df] bg-[#faf9f6] p-5 sm:p-6">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold text-[#161616] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e86d35] [&::-webkit-details-marker]:hidden">
        On this page
        <ChevronDown aria-hidden="true" className="size-5 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
      </summary>
      <nav aria-label="Table of contents" className="mt-4 max-h-80 overflow-y-auto pr-2">
        <ul className="space-y-3">
          {headings.map(heading => <li key={heading.id} className={heading.level === 3 ? 'pl-5' : ''}>
            <a href={`#${heading.id}`} className={`block break-words text-base leading-6 underline decoration-[#d1ccc2] underline-offset-4 hover:text-[#c65325] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e86d35] ${heading.level === 2 ? 'font-semibold text-[#242424]' : 'text-[#68675f]'}`}>{heading.label}</a>
          </li>)}
        </ul>
      </nav>
    </details>
  )
}
