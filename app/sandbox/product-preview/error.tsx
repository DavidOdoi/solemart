'use client'

export default function ProductPreviewError({ reset }: { reset: () => void }) {
  return <main id="top" className="mx-auto max-w-3xl px-5 py-16">
    <h1 className="text-3xl font-black">Product preview is temporarily unavailable</h1>
    <p className="mt-5 text-lg leading-8 text-[#68675f]">Check that WordPress and the Shoe fields are available, then try again.</p>
    <button type="button" onClick={reset} className="mt-6 rounded-lg bg-[#161616] px-6 py-3 text-base font-bold text-white">Try again</button>
  </main>
}
