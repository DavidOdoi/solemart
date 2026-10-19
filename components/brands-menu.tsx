'use client'

import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { brands } from '@/data/brands'

export function BrandsMenu({ mobile = false }: { mobile?: boolean }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const openedByHover = useRef(false)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [open])

  function closeAfterNavigation() {
    setOpen(false)
    // The enclosing mobile navigation lives in the shared server-rendered header.
    root.current?.closest('details')?.removeAttribute('open')
  }

  return (
    <div ref={root} className={mobile ? 'brands-menu brands-menu--mobile' : 'brands-menu relative'}
      onPointerEnter={(event) => { if (!mobile && event.pointerType === 'mouse' && !open) { openedByHover.current = true; setOpen(true) } }}
      onPointerLeave={(event) => { if (!mobile && event.pointerType === 'mouse' && !root.current?.contains(document.activeElement)) setOpen(false) }}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false) }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault()
          setOpen(false)
          trigger.current?.focus()
        }
      }}>
      <button ref={trigger} type="button" aria-expanded={open} aria-controls={panelId}
        className={`${mobile ? 'text-sm font-semibold text-[#4f4e49]' : 'category-nav-link text-sm font-bold text-[#242424]'} inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap hover:text-[#e86d35]`}
        onClick={(event) => {
          if (event.detail > 0 && openedByHover.current) setOpen(true)
          else setOpen((value) => !value)
          openedByHover.current = false
        }}>
        Brands <ChevronDown aria-hidden="true" className={`size-3.5 transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`} />
      </button>
      <div id={panelId} hidden={!open} className="brands-menu__panel">
        <div className="rounded-xl border border-[#e8e7e2] bg-white p-4 text-[#242424] shadow-xl sm:p-5">
          <p className="mb-3 border-b border-[#e8e7e2] pb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#68675f]">Explore popular shoe brands</p>
          <ul className="brands-menu__list">
            {brands.map((brand) => <li key={brand.slug}><Link href={`/brands/${brand.slug}`} onClick={closeAfterNavigation} className="block rounded-md px-2 py-2 text-sm font-semibold transition-colors hover:bg-[#f7f5f0] hover:text-[#c65325] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#c65325]">{brand.name}</Link></li>)}
          </ul>
          <Link href="/brands" onClick={closeAfterNavigation} className="mt-3 block border-t border-[#e8e7e2] pt-3 text-sm font-bold text-[#c65325] hover:underline">View all brands →</Link>
        </div>
      </div>
    </div>
  )
}
