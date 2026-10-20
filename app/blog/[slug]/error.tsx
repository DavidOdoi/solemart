'use client'

import Link from 'next/link'

export default function BlogError({ reset }: { reset: () => void }) {
  return (
    <main id="top" className="mx-auto min-h-[50vh] max-w-3xl bg-[#fafaf8] px-5 py-16 text-[#161616]">
      <h1 className="font-serif text-4xl">This article is temporarily unavailable</h1>
      <p className="mt-5 text-lg leading-8 text-[#68675f]">We couldn’t load this article right now. Please try again shortly.</p>
      <div className="mt-7 flex flex-wrap items-center gap-5">
        <button type="button" onClick={reset} className="rounded-full bg-[#161616] px-6 py-3 font-semibold text-white">Try again</button>
        <Link href="/blog" className="font-semibold underline underline-offset-4">Back to shoe advice</Link>
      </div>
    </main>
  )
}
