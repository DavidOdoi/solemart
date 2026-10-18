import type { Metadata } from 'next'
import { TrustPage } from '@/components/trust-page'

export const metadata: Metadata = {
  title: { absolute: 'Privacy Policy | SOLEMART' },
  description: 'Learn what information SOLEMART processes when you browse, save picks, search, or contact us.',
}

export default function PrivacyPolicyPage() {
  return <TrustPage
    title="Privacy Policy"
    intro="This policy describes the information involved when you use SOLEMART and the choices available to you. Third-party services linked from this site have their own privacy practices."
    sections={[
      { heading: 'Information you provide', paragraphs: ['If you email us, we receive the information and message you choose to send. We use it to respond and handle the matter you contacted us about. Email providers may process and retain messages as part of their services.'] },
      { heading: 'Information processed when you browse', paragraphs: ['Our hosting and security services may process routine technical information needed to deliver and protect the site, such as request, device, and network details. Searching sends your search terms in the page URL so the site can show matching guides; please do not include sensitive information in a shoe search.'] },
      { heading: 'Analytics', paragraphs: ['In production, this site uses Vercel Web Analytics to understand site usage. Analytics may include page routes, referrers, timestamps, browser and device details, and approximate location. Vercel describes its analytics as aggregated and says it does not use third-party cookies or identifiers for tracking visitors across sites. See Vercel’s privacy information for details.'] },
      { heading: 'Saved picks and copied links', paragraphs: ['If you save a shoe, its page identifier is stored in your browser’s local storage so it can remain saved on that device. This feature does not send your saved list to SOLEMART. If you choose to copy a review link, the site writes that link to your clipboard after your action.'] },
      { heading: 'Affiliate and other third-party sites', paragraphs: ['Our pages may link to Amazon and other retailers. When you follow a link, that site may collect information, use cookies or similar technologies, and process your purchase under its own privacy policy. SOLEMART does not control those third-party practices.'] },
      { heading: 'Retention, choices, and questions', paragraphs: ['We keep correspondence for as long as needed to respond and for ordinary recordkeeping. You can remove saved picks through the site’s save controls or clear this site’s local storage in your browser settings. You may also contact us with questions or requests about information you have sent us; applicable rights depend on where you live.'] },
      { heading: 'Policy updates', paragraphs: ['We may update this policy when site features or practices change. The current version will be published on this page.'] },
    ]}
  />
}
