'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export function ReadingProgress() {
  const pathname = usePathname()
  const track = useRef<HTMLDivElement>(null)
  const fill = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let frame = 0

    function update() {
      frame = 0
      if (!track.current || !fill.current) return
      const distance = document.documentElement.scrollHeight - window.innerHeight
      const progress = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0
      fill.current.style.transform = `scaleX(${progress})`
      track.current.style.opacity = progress > 0 ? '1' : '0'
      track.current.setAttribute('aria-valuenow', String(Math.round(progress * 100)))
    }

    function scheduleUpdate() {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    if (track.current && fill.current) {
      track.current.style.opacity = '0'
      track.current.setAttribute('aria-valuenow', '0')
      fill.current.style.transform = 'scaleX(0)'
    }
    scheduleUpdate()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    window.addEventListener('pageshow', scheduleUpdate)
    const observer = new ResizeObserver(scheduleUpdate)
    observer.observe(document.body)
    observer.observe(document.documentElement)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      window.removeEventListener('pageshow', scheduleUpdate)
      observer.disconnect()
    }
  }, [pathname])

  return (
    <div ref={track} role="progressbar" aria-label="Reading progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}
      className="pointer-events-none absolute inset-x-0 -bottom-px z-50 h-1 opacity-0">
      <span ref={fill} className="block h-full origin-left bg-[#e86d35]" style={{ transform: 'scaleX(0)' }} />
    </div>
  )
}
