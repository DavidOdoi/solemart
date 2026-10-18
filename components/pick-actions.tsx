'use client'

import { useEffect, useState } from 'react'
import { Bookmark, Link2 } from 'lucide-react'

const storageKey = 'solemart:saved-picks'

export function PickActions({ slug }: { slug: string }) {
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    try {
      const savedSlugs: string[] = JSON.parse(window.localStorage.getItem(storageKey) || '[]')
      setSaved(savedSlugs.includes(slug))
    } catch {
      setSaved(false)
    }
  }, [slug])

  function toggleSaved() {
    try {
      const savedSlugs: string[] = JSON.parse(window.localStorage.getItem(storageKey) || '[]')
      const next = saved ? savedSlugs.filter((savedSlug) => savedSlug !== slug) : [...new Set([...savedSlugs, slug])]
      window.localStorage.setItem(storageKey, JSON.stringify(next))
      setSaved(!saved)
    } catch {
      setSaved(!saved)
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/reviews/${slug}`)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={toggleSaved} aria-pressed={saved} aria-label={saved ? 'Remove saved shoe' : 'Save shoe'} title={saved ? 'Remove saved shoe' : 'Save shoe'} className="flex size-10 items-center justify-center rounded-full bg-[#f3f2ee] text-[#373630] transition hover:bg-[#e8e6df] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e86d35]">
        <Bookmark aria-hidden="true" className={`size-5 ${saved ? 'fill-current' : ''}`} />
      </button>
      <button type="button" onClick={copyLink} aria-label={copied ? 'Review link copied' : 'Copy review link'} title={copied ? 'Copied' : 'Copy review link'} className="flex size-10 items-center justify-center rounded-full bg-[#f3f2ee] text-[#373630] transition hover:bg-[#e8e6df] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e86d35]">
        <Link2 aria-hidden="true" className="size-5" />
      </button>
      <span className="sr-only" aria-live="polite">{copied ? 'Review link copied.' : saved ? 'Shoe saved.' : ''}</span>
    </div>
  )
}
