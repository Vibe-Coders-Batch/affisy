export const site = {
  name: 'ShoppeCove',
  description:
    'Practical guides, thoughtful product research, and useful ideas for your home, hobbies, pets, wellbeing, and digital life.',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://blogs.shoppercove.com').replace(/\/$/, ''),
}

export function siteURL(path = '/') {
  return new URL(path, `${site.url}/`).toString()
}

export function mediaURL(url?: string | null) {
  return url ? new URL(url, `${site.url}/`).toString() : undefined
}
