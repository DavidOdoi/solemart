'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react'
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'

const MutedVideo = lazy(() => import('@/components/muted-video'))

const slides = [
  { label: 'The Shoe Edit', title: 'Find Your Next', accent: 'Favourite.', description: 'Good shoes make a difference. Find your fit with independent reviews, practical guides, and picks worth a closer look.', image: 'photo-1542291026-7eec264c27ff', cta: 'Find your shoes', href: '/#needs', video: undefined },
  { label: 'Video Highlight / 01', title: 'Make Your', accent: 'Next Move.', description: 'A little inspiration for your next pair. Explore running shoes and compare the details that matter to you.', image: 'photo-1552674605-db6ffd4facb5', cta: 'Explore running shoes', href: '/running-shoes', video: 'Pz8aTLfuTiU' },
  { label: 'Video Highlight / 02', title: 'Everyday Starts', accent: 'With A Pair.', description: 'From your morning walk to your weekend plans, discover everyday shoes and practical advice for finding your fit.', image: 'photo-1525966222134-fcfa99b8ae77', cta: 'Explore everyday shoes', href: '/sneakers', video: 'xywUPoyNyE8' },
]

export default function HeroSlider() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(true)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [visible, setVisible] = useState(true)
  const [inView, setInView] = useState(true)
  const [posterReady, setPosterReady] = useState(false)
  const [visitedSlides, setVisitedSlides] = useState([0])
  const hero = useRef<HTMLDivElement>(null)
  const touchStart = useRef<number | null>(null)
  const videoPlaying = !paused && visible && inView && posterReady
  const playing = videoPlaying && !hovered && !focused

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    const update = () => setPaused(preference.matches || Boolean(connection?.saveData))
    const visibility = () => setVisible(!document.hidden)
    update()
    visibility()
    preference.addEventListener('change', update)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      preference.removeEventListener('change', update)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [])

  useEffect(() => {
    if (!hero.current || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio >= 0.15), { threshold: [0, 0.15] })
    observer.observe(hero.current)
    return () => observer.disconnect()
  }, [])

  const selectSlide = useCallback((index: number) => {
    setActive(index)
    setVisitedSlides(indices => indices.includes(index) ? indices : [...indices, index])
  }, [])

  useEffect(() => {
    if (!playing) return
    const timer = window.setTimeout(() => selectSlide((active + 1) % slides.length), 12000)
    return () => window.clearTimeout(timer)
  }, [active, playing, selectSlide])

  function move(direction: number) {
    selectSlide((active + direction + slides.length) % slides.length)
  }

  return (
    <section className="px-3 pt-3 sm:px-5" aria-label="Shoe highlights" aria-roledescription="carousel">
      <div ref={hero} className="home-hero hero-slider relative overflow-hidden rounded-[1.75rem] bg-[#080808] text-white"
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }}
        onKeyDown={(event) => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1) } }}
        onTouchStart={(event) => { touchStart.current = event.touches[0].clientX }}
        onTouchEnd={(event) => { if (touchStart.current !== null) { const distance = touchStart.current - event.changedTouches[0].clientX; if (Math.abs(distance) > 60) move(distance > 0 ? 1 : -1) } touchStart.current = null }}>
        <div className="hero-slider__track" style={{ transform: `translateX(-${active * 100}%)` }}>
          {slides.map((slide, index) => (
            <div key={slide.label} className="hero-slider__slide" role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${slides.length}: ${slide.label}`} aria-hidden={index !== active} inert={index !== active}>
              {visitedSlides.includes(index) && <Image
                src={`https://images.unsplash.com/${slide.image}?auto=format&fit=crop&w=1920&q=80`}
                alt="" aria-hidden="true" fill sizes="100vw" className="hero-slider__poster"
                loading={index === 0 || index === active ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                onLoad={index === 0 ? () => setPosterReady(true) : undefined}
                onError={index === 0 ? () => setPosterReady(true) : undefined}
              />}
              {slide.video && index === active && <Suspense fallback={null}><MutedVideo id={slide.video} playing={videoPlaying} /></Suspense>}
              <div className="hero-slider__shade" aria-hidden="true" />
              <div className="hero-slider__copy relative z-10 mx-auto flex w-full max-w-[1380px] flex-col items-start justify-center px-6 pb-32 pt-14 sm:px-10 lg:px-16">
                <p className="rounded-full border border-white/25 bg-black/20 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] backdrop-blur-sm sm:text-xs">{slide.label} / Made For Your Next Move</p>
                {index === 0 ? <h1 className="hero-slider__title">{slide.title} <span>{slide.accent}</span></h1> : <h2 className="hero-slider__title">{slide.title} <span>{slide.accent}</span></h2>}
                <p className="mt-6 max-w-lg text-base leading-7 text-white/85 sm:text-lg sm:leading-8">{slide.description}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href={slide.href} className="hero-slider__cta inline-flex min-h-14 items-center gap-3 rounded-full bg-white px-6 text-sm font-bold text-[#111]">{slide.cta}<ArrowRight aria-hidden="true" className="size-4" /></Link>
                  <Link href="/best-shoes/best-shoes-for-standing-all-day" className="hero-slider__cta inline-flex min-h-14 items-center rounded-full border border-white/50 bg-black/20 px-6 text-sm font-bold backdrop-blur-sm">Explore buying guides</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-6 z-20 flex items-center justify-between gap-4 px-6 sm:bottom-8 sm:px-10 lg:px-16">
          <div className="flex items-center gap-2" aria-label="Choose a highlight">
            {slides.map((slide, index) => <button key={slide.label} type="button" className="hero-slider__dot" aria-label={`Show highlight ${index + 1}: ${slide.label}`} aria-current={index === active ? 'true' : undefined} onClick={() => selectSlide(index)}><span /></button>)}
            <span className="ml-2 text-xs font-semibold tabular-nums text-white/75" aria-hidden="true">0{active + 1} / 0{slides.length}</span>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button type="button" className="hero-slider__control" aria-label={paused ? 'Play slideshow and muted video' : 'Pause slideshow and video'} aria-pressed={paused} onClick={() => setPaused((value) => !value)}>{paused ? <Play aria-hidden="true" className="size-5" /> : <Pause aria-hidden="true" className="size-5" />}</button>
            <button type="button" className="hero-slider__control" aria-label="Previous highlight" onClick={() => move(-1)}><ArrowLeft aria-hidden="true" className="size-5" /></button>
            <button type="button" className="hero-slider__control" aria-label="Next highlight" onClick={() => move(1)}><ArrowRight aria-hidden="true" className="size-5" /></button>
          </div>
        </div>
        <p className="sr-only" aria-live={playing ? 'off' : 'polite'} aria-atomic="true">Highlight {active + 1} of {slides.length}: {slides[active].title} {slides[active].accent}</p>
      </div>
    </section>
  )
}
