'use client'

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'

const storageKey = 'solemart:product-directory-design-saved'

export function DirectoryPreviewSave({ slug, name }: { slug: string; name: string }) {
  const [saved, setSaved] = useState(false)
  useEffect(() => { try { const values = JSON.parse(localStorage.getItem(storageKey) || '[]'); setSaved(Array.isArray(values) && values.includes(slug)) } catch { /* Storage is optional. */ } }, [slug])
  function toggle() {
    const next = !saved
    setSaved(next)
    try {
      const values = JSON.parse(localStorage.getItem(storageKey) || '[]')
      const previous = Array.isArray(values) ? values.filter(value => typeof value === 'string') : []
      localStorage.setItem(storageKey, JSON.stringify(next ? [...new Set([...previous, slug])] : previous.filter(value => value !== slug)))
    } catch { /* Keep the local interaction usable when storage is unavailable. */ }
  }
  return <button type="button" aria-label={`${saved ? 'Unsave' : 'Save'} ${name}`} aria-pressed={saved} onClick={toggle} className="absolute bottom-3 right-3 flex size-11 items-center justify-center rounded-full bg-white/75 text-[#161616] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-[#c65325]"><Heart aria-hidden="true" className={`size-6 ${saved ? 'fill-current' : ''}`} /></button>
}
