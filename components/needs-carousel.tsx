'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Category } from '@/data/categories'

type CategoryPreview = Pick<Category, 'title' | 'slug' | 'image' | 'imageAlt'>

const ribbonLabels: Record<string, string> = {
  'walking-shoes': 'SHOP WALKING',
  'running-shoes': 'SHOP RUNNING',
  'work-boots': 'SHOP WORK',
  sneakers: 'SHOP SNEAKERS',
  'shoes-for-standing-all-day': 'ALL-DAY COMFORT',
  'shoes-for-plantar-fasciitis': 'FIND YOUR SUPPORT',
}

export function NeedsCarousel({ categories }: { categories: CategoryPreview[] }) {
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
    <section id="needs" aria-labelledby="needs-heading" className="bg-white py-14 text-[#161616] sm:py-20">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-10">
        <div className="text-center">
          <p className="mb-3 text-xs font-bold tracking-[0.2em] text-[#c65325]">SHOP BY NEED</p>
          <h2 id="needs-heading" className="text-2xl font-black uppercase tracking-tight sm:text-3xl">Styles Just For You</h2>
        </div>
        <div className="mb-5 mt-7 flex items-center justify-between gap-4">
          <Link href="#shoe-finder-heading" className="text-base font-semibold underline-offset-4 hover:underline sm:text-lg">Explore shoe categories</Link>
          <div className="flex shrink-0 gap-2">
            <button type="button" aria-label="Previous shoe categories" aria-controls="needs-track" disabled={!canGoBack} onClick={() => move(-1)} className="needs-carousel__control"><ArrowLeft aria-hidden="true" className="size-5" /></button>
            <button type="button" aria-label="Next shoe categories" aria-controls="needs-track" disabled={!canGoForward} onClick={() => move(1)} className="needs-carousel__control"><ArrowRight aria-hidden="true" className="size-5" /></button>
          </div>
        </div>
        <ul id="needs-track" ref={track} tabIndex={0} aria-label="Shoe categories" className="needs-carousel__track" onScroll={updateControls}
          onKeyDown={(event) => {
            if (event.target === event.currentTarget && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
              event.preventDefault()
              move(event.key === 'ArrowLeft' ? -1 : 1)
            }
          }}>
          {categories.map((category) => (
            <li key={category.slug} className="needs-carousel__item">
              <Link href={`/${category.slug}`} className="needs-carousel__link group">
                <div className="relative aspect-square overflow-hidden bg-[#eeece6]">
                  <Image src={category.image} alt={category.imageAlt} fill sizes="(max-width: 1199px) 300px, (max-width: 1600px) 25vw, 365px" className="needs-carousel__image object-cover" />
                  <span aria-hidden="true" className="needs-carousel__ribbon">{ribbonLabels[category.slug] || 'FIND YOUR PAIR'}</span>
                </div>
                <h3 className="mt-4 flex items-start justify-between gap-3 text-lg font-semibold leading-snug sm:text-xl">
                  <span>Shop {category.title}</span><ArrowRight aria-hidden="true" className="mt-1 size-5 shrink-0" />
                </h3>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
