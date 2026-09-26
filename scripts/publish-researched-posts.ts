import { mkdir, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { isDeepStrictEqual } from 'node:util'
import { researchedArticles } from '@/content/researched-posts'
import type { Post } from '@/payload-types'

const ids: Record<string, string> = {
  'small-woodworking-shop-setup': '6ab74ff452a2b9ec8e2b7067',
  'brain-training-for-dogs-review': '6ab74ff552a2b9ec8e2b709b',
  'pianoforall-adult-beginners-guide': '6ab755e5d981daf8dddeebec',
  '4-foot-farm-blueprint-guide': '6ab755e5d981daf8dddeec1d',
}
const args = process.argv.slice(2)
if (args.some((arg) => arg !== '--apply'))
  throw new Error('Use --apply to publish the four reviewed posts.')
const apply = args.includes('--apply')
console.log(
  JSON.stringify(
    { mode: apply ? 'publish through production jobs' : 'offline preview', posts: ids },
    null,
    2,
  ),
)

if (apply) {
  await import('dotenv/config')
  const secret = process.env.CRON_SECRET
  if (!secret) throw new Error('Configured production job credential is missing.')
  const queue = `publish-researched-${randomUUID()}`
  const endpoint = new URL('https://blogs.shoppercove.com/api/payload-jobs/run')
  endpoint.searchParams.set('queue', queue)
  endpoint.searchParams.set('limit', '4')
  endpoint.searchParams.set('disableScheduling', 'true')
  const runProduction = async () => {
    const response = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${secret}` },
      redirect: 'error',
      signal: AbortSignal.timeout(60000),
    })
    if (!response.ok) throw new Error(`Production job endpoint returned HTTP ${response.status}.`)
    const result = await response.json()
    if (result.message === 'No jobs to run.')
      throw new Error('Production has no publishing task configured.')
    return result
  }
  // This unique queue is still empty: validate the existing job credential first.
  await runProduction()
  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('@payload-config'),
  ])
  const payload = await getPayload({ config })
  const normalize = (value: unknown) =>
    JSON.parse(
      JSON.stringify(value, (key, item) =>
        key === 'fields' && item?.blockType ? { ...item, id: undefined } : item,
      ),
    )
  const publicPosts = async () =>
    (
      await payload.find({
        collection: 'posts',
        draft: false,
        overrideAccess: false,
        depth: 0,
        pagination: false,
        limit: 1000,
        where: { _status: { equals: 'published' } },
      })
    ).docs
  const contentSnapshot = (post: Post) =>
    normalize({
      ...post,
      _status: undefined,
      publishedAt: undefined,
      updatedAt: undefined,
    })
  try {
    const before = await publicPosts()
    const targets: Post[] = []
    for (const article of researchedArticles) {
      const post = await payload.findByID({
        collection: 'posts',
        id: ids[article.slug],
        draft: true,
        overrideAccess: true,
        depth: 0,
      })
      if (
        post.slug !== article.slug ||
        post.review?.affiliateURL !== article.review.affiliateURL ||
        !post.content?.root?.children.length ||
        !post.meta?.title ||
        !post.meta?.description
      ) {
        throw new Error(`Publication preflight failed: ${article.slug}`)
      }
      if (post._status !== 'draft' && post._status !== 'published')
        throw new Error(`Unexpected status: ${article.slug}`)
      targets.push(post)
    }
    const pending = targets.filter((post) => post._status === 'draft')
    await mkdir('.local-backups', { recursive: true, mode: 0o700 })
    const backup = `.local-backups/researched-publish-before-${Date.now()}.json`
    await writeFile(backup, JSON.stringify({ queue, posts: targets, published: before }, null, 2), {
      mode: 0o600,
      flag: 'wx',
    })
    console.log(`Backup: ${backup}`)
    // These are the CMS's existing publish jobs, run immediately in a separate queue.
    // Executing in production lets its normal hooks refresh listings and the sitemap.
    for (const post of pending) {
      const current = await payload.findByID({
        collection: 'posts',
        id: post.id,
        draft: true,
        overrideAccess: true,
        depth: 0,
      })
      if (!isDeepStrictEqual(normalize(current), normalize(post)))
        throw new Error(`Draft changed: ${post.slug}`)
      const job = await payload.jobs.queue({
        task: 'schedulePublish',
        queue,
        overrideAccess: true,
        input: { type: 'publish', doc: { relationTo: 'posts', value: post.id } },
      })
      console.log(JSON.stringify({ queued: post.slug, jobID: job.id, queue }))
    }
    if (pending.length) console.log(JSON.stringify({ production: await runProduction() }))
    const after = await publicPosts()
    for (const post of targets) {
      const published = after.find((item) => item.id === post.id)
      if (
        !published ||
        published._status !== 'published' ||
        !published.publishedAt ||
        !isDeepStrictEqual(contentSnapshot(published), contentSnapshot(post))
      ) {
        throw new Error(
          `Publication verification failed: ${post.slug}; inspect ${backup} and queue ${queue}.`,
        )
      }
      console.log(`Published and verified: https://blogs.shoppercove.com/posts/${post.slug}`)
    }
    for (const post of before.filter((item) => !targets.some((target) => target.id === item.id))) {
      if (
        !isDeepStrictEqual(normalize(post), normalize(after.find((item) => item.id === post.id)))
      ) {
        throw new Error(`An unrelated public article changed during this run: ${post.slug}`)
      }
    }
    console.log('All four published; article content and unrelated public posts preserved.')
  } finally {
    await payload.destroy()
  }
}
process.exit(0)
