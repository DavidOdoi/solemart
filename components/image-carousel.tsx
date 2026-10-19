'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

type CarouselItem = { title: string; href: string; image: string; imageAlt: string; ribbon: string }

export function ImageCarousel({ id, title, eyebrow, browseLabel, browseHref, itemLabel, items }: {
  id: string
  title: string
  eyebrow: string
  browseLabel: string
  browseHref?: string
  itemLabel: string
  items: CarouselItem[]
}) {
  const columns = Math.min(Math.max(items.length, 1), 4)
  const track = useRef<HTMLUListElement>(null)
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)

  function updateControls() {
    const element = track.current
    if (!element) return
    setCanGoBack(element.scrollLeft > 2)
    setCanGoForward(element.scrollLeft + element.clientWidth < element.scrollWidth - 2)
  }

  useEffect(() => {
    const element = track.current
    if (!element) return
    const observer = new ResizeObserver(updateControls)
    observer.observe(element)
    updateControls()
    return () => observer.disconnect()
  }, [])

  function move(direction: number) {
    const element = track.current
    const card = element?.firstElementChild
    if (!element || !card) return
    const gap = parseFloat(getComputedStyle(element).columnGap) || 0
    element.scrollBy({
      left: direction * (card.getBoundingClientRect().width + gap),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    })
  }

  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="image-carousel bg-white py-14 text-[#161616] sm:py-20">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-10">
        <div className="text-center">
          <p className="mb-3 text-xs font-bold tracking-[0.2em] text-[#c65325]">{eyebrow}</p>
          <h2 id={`${id}-heading`} className="text-2xl font-black uppercase tracking-tight sm:text-3xl">{title}</h2>
        </div>
        <div className="mb-5 mt-7 flex items-center justify-between gap-4">
          {browseHref ? <Link href={browseHref} className="text-base font-semibold underline-offset-4 hover:underline sm:text-lg">{browseLabel}</Link> : <p className="text-base font-semibold sm:text-lg">{browseLabel}</p>}
          <div className="flex shrink-0 gap-2">
            <button type="button" aria-label={`Previous ${itemLabel.toLowerCase()}`} aria-controls={`${id}-track`} disabled={!canGoBack} onClick={() => move(-1)} className="image-carousel__control"><ArrowLeft aria-hidden="true" className="size-5" /></button>
            <button type="button" aria-label={`Next ${itemLabel.toLowerCase()}`} aria-controls={`${id}-track`} disabled={!canGoForward} onClick={() => move(1)} className="image-carousel__control"><ArrowRight aria-hidden="true" className="size-5" /></button>
          </div>
        </div>
        <ul id={`${id}-track`} ref={track} tabIndex={0} aria-label={itemLabel} className="image-carousel__track" style={{ "--carousel-columns": columns, "--carousel-gaps": `${(columns - 1) * 24}px` } as CSSProperties} onScroll={updateControls}
          onKeyDown={(event) => {
            if (event.target === event.currentTarget && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
              event.preventDefault()
              move(event.key === 'ArrowLeft' ? -1 : 1)
            }
          }}>
          {items.map((item) => (
            <li key={item.href} className="image-carousel__item">
              <Link href={item.href} className="image-carousel__link group">
                <div className="relative aspect-square overflow-hidden bg-[#eeece6]">
                  <Image src={item.image} alt={item.imageAlt} fill sizes={columns === 3 ? "(max-width: 900px) 300px, (max-width: 1600px) 33vw, 500px" : "(max-width: 1199px) 300px, (max-width: 1600px) 25vw, 365px"} className="image-carousel__image object-cover" />
                  <span aria-hidden="true" className="image-carousel__ribbon">{item.ribbon}</span>
                </div>
                <h3 className="mt-4 flex items-start justify-between gap-3 text-lg font-semibold leading-snug sm:text-xl">
                  <span>{item.title}</span><ArrowRight aria-hidden="true" className="mt-1 size-5 shrink-0" />
                </h3>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
