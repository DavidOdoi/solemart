'use client'

import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { brandGroups } from '@/data/brands'

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
    <div ref={root} className={mobile ? 'brands-menu brands-menu--mobile' : `brands-menu${open ? ' brands-menu--open' : ''}`}
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
        className={`${mobile ? 'text-base font-semibold text-[#4f4e49]' : 'category-nav-link text-base font-bold text-[#242424] xl:text-lg'} inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap hover:text-[#e86d35]`}
        onClick={(event) => {
          if (event.detail > 0 && openedByHover.current) setOpen(true)
          else setOpen((value) => !value)
          openedByHover.current = false
        }}>
        Brands <ChevronDown aria-hidden="true" className={`size-3.5 transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`} />
      </button>
      <div id={panelId} hidden={!open} className="brands-menu__panel">
        <div className="brands-menu__inner">
          {brandGroups.map((group) => (
            <section key={group.title} aria-label={group.title}>
              <h2 className="brands-menu__heading">{group.title}</h2>
              <ul className="brands-menu__list">
                {group.brands.map((brand) => <li key={brand.slug}><Link href={`/brands/${brand.slug}`} onClick={closeAfterNavigation} className="brands-menu__link">{brand.name}</Link></li>)}
              </ul>
            </section>
          ))}
          <section aria-label="Discover">
            <h2 className="brands-menu__heading">Discover</h2>
            <ul className="brands-menu__list">
              {[
                { label: 'Explore All Brands', href: '/brands' },
                { label: 'Running Shoes', href: '/running-shoes' },
                { label: 'Walking Shoes', href: '/walking-shoes' },
                { label: 'Everyday Sneakers', href: '/sneakers' },
                { label: 'Shoe Buying Guides', href: '/#guides' },
              ].map((item) => <li key={item.href}><Link href={item.href} onClick={closeAfterNavigation} className="brands-menu__link">{item.label}</Link></li>)}
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
