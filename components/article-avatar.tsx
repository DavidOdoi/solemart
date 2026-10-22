'use client'

import Image from 'next/image'
import { useState } from 'react'

export function ArticleAvatar({ name, src }: { name: string; src?: string }) {
  const [failedSrc, setFailedSrc] = useState<string>()
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase()
  return (
    <span aria-hidden="true" className="relative flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#efe4d9] text-xl font-bold text-[#70482f]">
      {initials}
      {src && failedSrc !== src && <Image src={src} alt="" fill sizes="72px" unoptimized onError={() => setFailedSrc(src)} className="object-cover" />}
    </span>
  )
}
