export function publicMediaFileURL(filename?: string | null, prefix?: string | null) {
  const base = process.env.R2_PUBLIC_URL?.replace(/\/$/, '')
  if (!base || !filename) return undefined
  const parts = [...(prefix ? prefix.split('/') : []), ...filename.split('/')]
  if (parts.some((part) => !part || part === '.' || part === '..')) return undefined
  return `${base}/${parts.map((part) => encodeURIComponent(part)).join('/')}`
}
