import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import RichText from '@/components/RichText'
import { anchorAttributes, classifyHref } from '@/utilities/linkAttributes'

vi.mock('@/blocks/Code/Component', () => ({ CodeBlock: () => null }))

const text = (value: string) => ({
  type: 'text',
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text: value,
  version: 1,
})

const link = (url: string, label: string, newTab = false) => ({
  type: 'link',
  version: 3,
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  fields: { linkType: 'custom', url, newTab },
  children: [text(label)],
})

const state = (children: unknown[]): DefaultTypedEditorState =>
  ({
    root: {
      type: 'root',
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }) as DefaultTypedEditorState

const paragraph = (children: unknown[]) => ({
  type: 'paragraph',
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  children,
})

describe('Lexical body links', () => {
  it('renders affiliate hops as sponsored links and leaves internal links alone', () => {
    const html = renderToStaticMarkup(
      createElement(RichText, {
        data: state([
          paragraph([
            text('Read '),
            link('/posts/prodentim-review', 'the ProDentim review'),
            text(' or '),
            link(
              'https://hop.clickbank.net/?affiliate=pointerr&vendor=LOSTREC',
              'See The Lost SuperFoods formats and current price',
              true,
            ),
            text('.'),
          ]),
          paragraph([link('https://pmc.ncbi.nlm.nih.gov/articles/PMC9809225/', 'BMJ Open', true)]),
        ]),
        enableGutter: false,
      }),
    )
    const root = document.createElement('div')
    root.innerHTML = html
    const anchors = [...root.querySelectorAll('a')]
    expect(anchors.map((anchor) => anchor.textContent)).toEqual([
      'the ProDentim review',
      'See The Lost SuperFoods formats and current price',
      'BMJ Open',
    ])
    expect(anchors[0].getAttribute('href')).toBe('/posts/prodentim-review')
    expect(anchors[0].getAttribute('rel')).toBeNull()
    expect(anchors[0].getAttribute('target')).toBeNull()
    expect(anchors[1].getAttribute('rel')).toBe('sponsored nofollow noopener')
    expect(anchors[1].getAttribute('target')).toBe('_blank')
    expect(anchors[1].getAttribute('href')).toContain('hop.clickbank.net')
    expect(anchors[2].getAttribute('rel')).toBe('noopener noreferrer')
    expect(anchors[2].getAttribute('target')).toBe('_blank')
    expect(html).not.toContain('unknown node')
  })

  it('classifies offer links separately from the journal', () => {
    expect(classifyHref('/posts/example')).toBe('internal')
    expect(classifyHref('https://blogs.shoppercove.com/about')).toBe('internal')
    expect(classifyHref('https://5c1abeu6xrjqzx6bje76681mqp.hop.clickbank.net/?x=1')).toBe(
      'affiliate',
    )
    expect(classifyHref('https://hop.clickbank.net/?affiliate=pointerr&vendor=LOSTREC')).toBe(
      'affiliate',
    )
    expect(classifyHref('javascript:alert(1)')).toBe('unsafe')
    expect(anchorAttributes('javascript:alert(1)')).toBeNull()
  })
})
