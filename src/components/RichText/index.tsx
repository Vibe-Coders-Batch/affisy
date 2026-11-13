import { MediaBlock } from '@/blocks/MediaBlock/Component'
import {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedLinkNode,
  type DefaultTypedEditorState,
} from '@payloadcms/richtext-lexical'
import {
  JSXConvertersFunction,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react'

import { CodeBlock, CodeBlockProps } from '@/blocks/Code/Component'

import type {
  BannerBlock as BannerBlockProps,
  CallToActionBlock as CTABlockProps,
  MediaBlock as MediaBlockProps,
} from '@/payload-types'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { cn } from '@/utilities/ui'
import { createElement, type ReactNode } from 'react'
import { headingID, nodeText } from '@/utilities/article'
import { anchorAttributes } from '@/utilities/linkAttributes'

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<CTABlockProps | MediaBlockProps | BannerBlockProps | CodeBlockProps>

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { value, relationTo } = linkNode.fields.doc!
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }
  const slug = value.slug
  return relationTo === 'posts' ? `/posts/${slug}` : `/${slug}`
}

const renderLink = ({
  node,
  nodesToJSX,
}: {
  node: {
    type: string
    children: SerializedLinkNode['children']
    fields: { linkType?: string | null; url?: string | null; newTab?: boolean | null }
  }
  nodesToJSX: (args: { nodes: SerializedLinkNode['children'] }) => ReactNode
}) => {
  const children = nodesToJSX({ nodes: node.children })
  let href = node.fields.url || ''
  if (node.fields.linkType === 'internal') {
    try {
      href = internalDocToHref({ linkNode: node as SerializedLinkNode })
    } catch {
      return children
    }
  }
  const attributes = anchorAttributes(href, Boolean(node.fields.newTab))
  if (!attributes) return children
  return createElement('a', attributes, children)
}

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  // Override the default link converters. Node views must not replace these:
  // affiliate hops were reaching the page as plain text when the anchor was dropped.
  link: renderLink,
  autolink: renderLink,
  blocks: {
    banner: ({ node }) => <BannerBlock className="col-start-2 mb-4" {...node.fields} />,
    mediaBlock: ({ node }) => (
      <MediaBlock
        className="col-start-1 col-span-3"
        imgClassName="m-0"
        {...node.fields}
        captionClassName="mx-auto max-w-[48rem]"
        enableGutter={false}
        disableInnerContainer={true}
      />
    ),
    code: ({ node }) => <CodeBlock className="col-start-2" {...node.fields} />,
    cta: ({ node }) => <CallToActionBlock {...node.fields} />,
  },
})

type Props = {
  data: DefaultTypedEditorState
  articleHeadings?: boolean
  headingIDs?: string[]
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const {
    className,
    articleHeadings = false,
    headingIDs,
    enableProse = true,
    enableGutter = true,
    ...rest
  } = props
  const used = new Map<string, number>()
  let headingIndex = 0
  const converters: JSXConvertersFunction<NodeTypes> = (args) => ({
    ...jsxConverters(args),
    ...(articleHeadings
      ? {
          heading: ({ node, nodesToJSX }) => {
            if (!['h2', 'h3'].includes(node.tag))
              return createElement(node.tag, {}, nodesToJSX({ nodes: node.children }))
            const base = headingID(nodeText(node))
            const count = (used.get(base) || 0) + 1
            used.set(base, count)
            return createElement(
              node.tag,
              { id: headingIDs?.[headingIndex++] || (count === 1 ? base : `${base}-${count}`) },
              nodesToJSX({ nodes: node.children }),
            )
          },
        }
      : {}),
  })
  return (
    <ConvertRichText
      converters={converters}
      className={cn(
        'payload-richtext',
        {
          container: enableGutter,
          'max-w-none': !enableGutter,
          'mx-auto prose md:prose-md': enableProse,
          'dark:prose-invert': enableProse && !articleHeadings,
        },
        className,
      )}
      {...rest}
    />
  )
}
