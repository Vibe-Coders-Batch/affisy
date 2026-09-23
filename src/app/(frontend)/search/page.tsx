import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { getPublicPosts } from '@/utilities/getPublicPosts'
import { PostGridSkeleton } from '@/components/Editorial/Loading'
import React, { Suspense } from 'react'
import { Search } from '@/search/Component'
import PageClient from './page.client'
import { CardPostData } from '@/components/Card'

type Args = {
  searchParams: Promise<{
    q: string
  }>
}
export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const { q: query } = await searchParamsPromise

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose max-w-none text-center">
          <h1 className="font-editorial mb-8 text-5xl">Find your next useful read.</h1>

          <div className="max-w-[50rem] mx-auto">
            <Search initialQuery={query || ''} />
          </div>
        </div>
      </div>

      <Suspense
        key={query || ''}
        fallback={
          <div className="container">
            <PostGridSkeleton />
          </div>
        }
      >
        <SearchResults query={query || ''} />
      </Suspense>
    </div>
  )
}

async function SearchResults({ query }: { query: string }) {
  const posts = await getPublicPosts('', 1, 12, query.trim())
  return (
    <>
      {posts.totalDocs > 0 ? (
        <CollectionArchive posts={posts.docs as CardPostData[]} />
      ) : (
        <div className="container">No results found.</div>
      )}
    </>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Search the journal | ShoppeCove`,
    robots: { index: false, follow: true },
  }
}
