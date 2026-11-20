const buyingReminder = 'Check the exact version, size, seller and return terms.'

/** Short links and direct product URLs do not establish an Amazon search. */
export function guideCtaNote(destinations: string[]) {
  const searches = destinations.length > 0 && destinations.every(destination => {
    try {
      const url = new URL(destination)
      return /^https?:$/.test(url.protocol)
        && /^(?:[^.]+\.)*amazon\.(?:com|co\.uk)$/i.test(url.hostname)
        && /^\/s\/?$/.test(url.pathname)
        && Boolean((url.searchParams.get('k') || url.searchParams.get('field-keywords') || '').trim())
    } catch { return false }
  })
  return searches ? `Search Amazon listings for this model. ${buyingReminder}` : buyingReminder
}
