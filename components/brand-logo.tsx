import Image from 'next/image'

export function BrandLogo({ className = '', inverted = false, priority = false }: { className?: string; inverted?: boolean; priority?: boolean }) {
  return (
    <span className={`relative block max-w-full overflow-hidden ${className}`} style={{ aspectRatio: '2061 / 302' }}>
      {/* Clip the PNG's transparent canvas padding without resampling the artwork. */}
      <Image
        src="/brand/solemart-logo.png" alt="SOLEMART" width={2172} height={724}
        priority={priority} sizes="(min-width: 1280px) 300px, (min-width: 640px) 260px, 210px"
        className={`absolute h-auto max-w-none ${inverted ? 'invert' : ''}`}
        style={{ width: '105.386%', left: '-2.814%', top: '-64.239%' }}
      />
    </span>
  )
}
