function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

/** Fixed local editorial assets use Next.js optimization and load on scroll. */
export function articleFigure(name: string, alt: string, caption: string) {
  if (!/^[a-z0-9-]+$/.test(name)) throw new RangeError('Invalid article image name')
  const query = new URLSearchParams({ url: `/articles/${name}.png`, w: '1200', q: '75' })
  return `<figure><img src="/_next/image?${escapeHtml(query.toString())}" alt="${escapeHtml(alt)}" width="800" height="450" loading="lazy" decoding="async" /><figcaption>${escapeHtml(caption)}</figcaption></figure>`
}
