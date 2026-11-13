import { site } from '@/utilities/site'

export type LinkKind = 'internal' | 'affiliate' | 'external' | 'unsafe'

const AFFILIATE_HOST =
  /(?:^|\.)(?:hop\.clickbank\.net|clickbank\.(?:net|com)|shareasale\.com|anrdoezrs\.net|dpbolvw\.net|tkqlhce\.com|jdoqocy\.com|kqzyfj\.com|awin1\.com|flexlinks\.com|impact\.com|pntra\.com|pntrs\.com|partnerize\.com)$/i

export function classifyHref(href: string): LinkKind {
  const value = href.trim()
  if (!value) return 'unsafe'
  if (value.startsWith('#') || value.startsWith('mailto:') || value.startsWith('tel:'))
    return 'internal'
  if (value.startsWith('/') && !value.startsWith('//')) return 'internal'
  if (value.startsWith('./') || value.startsWith('../')) return 'internal'

  let url: URL
  try {
    url = new URL(value)
  } catch {
    return 'unsafe'
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return 'unsafe'

  const host = url.hostname.replace(/\.$/, '').toLowerCase()
  let siteHost = ''
  try {
    siteHost = new URL(site.url).hostname.toLowerCase()
  } catch {
    siteHost = ''
  }
  if (host === siteHost || host === `www.${siteHost}`) return 'internal'

  if (AFFILIATE_HOST.test(host) || url.searchParams.has('affiliate')) return 'affiliate'
  return 'external'
}

export function anchorAttributes(
  href: string,
  newTab = false,
): { href: string; rel?: string; target?: '_blank' } | null {
  const kind = classifyHref(href)
  if (kind === 'unsafe') return null
  if (kind === 'affiliate') {
    return { href, rel: 'sponsored nofollow noopener', target: '_blank' }
  }
  if (kind === 'internal') {
    return newTab ? { href, rel: 'noopener', target: '_blank' } : { href }
  }
  return newTab ? { href, rel: 'noopener noreferrer', target: '_blank' } : { href }
}
