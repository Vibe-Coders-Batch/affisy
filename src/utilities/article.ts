import type { Post } from '@/payload-types'

type TextNode = { type?: string; text?: string; tag?: string; children?: TextNode[] }
export function nodeText(node: TextNode): string {
  return node.text || node.children?.map(nodeText).join(' ') || ''
}
export function headingID(text: string) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-') || 'section'
  )
}
export function articleDetails(content: Post['content']) {
  const used = new Map<string, number>()
  const headings = (content.root.children as TextNode[]).flatMap((node) => {
    if (node.type !== 'heading' || !['h2', 'h3'].includes(node.tag || '')) return []
    const text = nodeText(node)
    const base = headingID(text)
    const count = (used.get(base) || 0) + 1
    used.set(base, count)
    return [{ text, id: count === 1 ? base : `${base}-${count}`, tag: node.tag }]
  })
  const words = nodeText(content.root as TextNode)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
  return { headings, readingMinutes: Math.max(1, Math.ceil(words / 220)) }
}

export const jsonLD = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c')
