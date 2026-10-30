'use client'

export default function DirectoryPreviewError({ reset }: { reset: () => void }) {
  return <main id="top" className="mx-auto max-w-3xl px-5 py-16"><h1 className="text-3xl font-black">The product directory could not load</h1><p className="mt-5 text-lg leading-8 text-[#68675f]">The WordPress connection or Shoe records are unavailable. No example products or guessed specifications have been substituted.</p><button onClick={reset} className="mt-6 rounded-lg bg-[#161616] px-6 py-3 font-bold text-white">Try again</button></main>
}
