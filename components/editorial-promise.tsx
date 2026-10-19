'use client'

import Link from 'next/link'
import { ArrowRight, Plus } from 'lucide-react'
import { useRef } from 'react'

const promises = [
  {
    title: 'Independent Picks',
    summary: 'Your needs set the direction.',
    detail: 'We explain the thinking behind our recommendations and disclose affiliate links, so you can understand what informs each pick.',
    href: '/editorial-policy',
    link: 'Our editorial standards',
  },
  {
    title: 'Clear Advice',
    summary: 'Less noise. More useful detail.',
    detail: 'Explore practical guides that make fit, intended use, and the differences between shoes easier to understand.',
    href: '/#guides',
    link: 'Explore the guides',
  },
  {
    title: 'Confident Choices',
    summary: 'Know what to check before you buy.',
    detail: 'Compare your options, then check the retailer for current prices, sizing, and availability before choosing your next pair.',
    href: '/deals',
    link: 'Check retailer prices',
  },
]

function PromiseCard({ item, index }: { item: typeof promises[number]; index: number }) {
  const details = useRef<HTMLDetailsElement>(null)
  const suppressFocusReveal = useRef(false)

  return (
    <li className="editorial-promise__card"
      onPointerEnter={(event) => { if (event.pointerType === 'mouse' && details.current) details.current.open = true }}
      onPointerLeave={(event) => { if (event.pointerType === 'mouse' && details.current && !event.currentTarget.contains(document.activeElement)) details.current.open = false }}
      onFocusCapture={(event) => { if (!suppressFocusReveal.current && event.target.matches(':focus-visible') && details.current) details.current.open = true }}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget) && details.current) details.current.open = false }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && details.current?.open) {
          event.preventDefault()
          details.current.open = false
          suppressFocusReveal.current = true
          details.current.querySelector('summary')?.focus()
          suppressFocusReveal.current = false
        }
      }}>
      <div className="editorial-promise__number-row" aria-hidden="true">
        <span className="editorial-promise__number">{String(index + 1).padStart(2, '0')}</span>
        <span className="editorial-promise__accent" />
      </div>
      <details ref={details} className="editorial-promise__details">
        <summary className="editorial-promise__summary">
          <div className="editorial-promise__title-row">
            <h3>{item.title}</h3>
            <span className="editorial-promise__toggle"><Plus aria-hidden="true" size={18} /></span>
          </div>
          <p className="editorial-promise__short">{item.summary}</p>
        </summary>
        <div className="editorial-promise__detail">
          <p>{item.detail}</p>
          <Link href={item.href}>{item.link}<ArrowRight aria-hidden="true" size={16} /></Link>
        </div>
      </details>
    </li>
  )
}

export function EditorialPromise() {
  return (
    <section aria-labelledby="editorial-promise-heading" className="editorial-promise">
      <div className="editorial-promise__inner">
        <h2 id="editorial-promise-heading" className="editorial-promise__eyebrow">The SOLEMART Promise</h2>
        <ol className="editorial-promise__grid">
          {promises.map((item, index) => <PromiseCard key={item.title} item={item} index={index} />)}
        </ol>
      </div>
    </section>
  )
}
