import { createHash, randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { isDeepStrictEqual } from 'node:util'
import sharp from 'sharp'
import type { Media, Post } from '@/payload-types'

const assets = [
  {
    id: '6ab74ff452a2b9ec8e2b7067',
    slug: 'small-woodworking-shop-setup',
    filename: 'small-woodworking-shop-editorial.webp',
    alt: 'Compact wooden workbench with a pegboard, hand tools and materials for a small woodworking project',
    caption:
      'AI-generated editorial illustration of a generic home workshop. It does not show an Ultimate Small Shop setup or a product test.',
  },
  {
    id: '6ab74ff552a2b9ec8e2b709b',
    slug: 'brain-training-for-dogs-review',
    filename: 'brain-training-for-dogs-editorial.webp',
    alt: 'Relaxed brown-and-white dog beside a treat puzzle on a sage-colored mat in a living room',
    caption:
      'AI-generated editorial illustration of a generic dog-training scene. It does not depict a Brain Training for Dogs lesson or a tested result.',
  },
  {
    id: '6ab755e5d981daf8dddeebec',
    slug: 'pianoforall-adult-beginners-guide',
    filename: 'pianoforall-practice-editorial.webp',
    alt: 'Digital piano and bench beside a small table with a practice notebook and a houseplant',
    caption:
      'AI-generated editorial illustration of a generic piano-practice space. It does not show Pianoforall course materials or a product test.',
  },
  {
    id: '6ab755e5d981daf8dddeec1d',
    slug: '4-foot-farm-blueprint-guide',
    filename: '4-foot-farm-garden-editorial.webp',
    alt: 'Small patio garden with terracotta containers, a wooden planter, vegetables, herbs and a watering can',
    caption:
      'AI-generated editorial illustration of a generic container garden. It is not a garden grown from 4 Foot Farm Blueprint or evidence of its results.',
  },
]

const normalize = (value: unknown): unknown =>
  JSON.parse(
    JSON.stringify(value, (key, item) =>
      // Match the other maintenance scripts: old Lexical blocks gain editor-only IDs on read.
      key === 'fields' && item?.blockType ? { ...item, id: undefined } : item,
    ),
  )
const same = (left: unknown, right: unknown) => isDeepStrictEqual(normalize(left), normalize(right))
const stablePost = (post: Post) => ({ ...post, updatedAt: undefined })
const relationshipID = (value: Post['heroImage']) =>
  typeof value === 'object' && value ? value.id : value
const snapshot = (posts: Post[]) => [...posts].sort((a, b) => a.id.localeCompare(b.id))
const digest = (value: string | Buffer) => createHash('sha256').update(value).digest('hex')
const completionPath = '.local-backups/researched-images-complete.json'

async function main() {
  const args = process.argv.slice(2)
  if (args.some((arg) => arg !== '--apply')) {
    throw new Error('Usage: node --import tsx scripts/add-researched-images.ts [--apply].')
  }
  const apply = args.includes('--apply')
  const files = await Promise.all(
    assets.map(async (asset) => {
      const filePath = path.resolve('public/images', asset.filename)
      try {
        const buffer = await readFile(filePath)
        const metadata = await sharp(buffer).metadata()
        if (metadata.format !== 'webp' || !metadata.width || !metadata.height) {
          throw new Error(`Expected a valid WebP image: ${asset.filename}`)
        }
        return {
          ...asset,
          filePath,
          width: metadata.width,
          height: metadata.height,
          hash: digest(buffer),
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT' && !apply) {
          return { ...asset, filePath, width: null, height: null, hash: null }
        }
        throw error
      }
    }),
  )
  console.log(
    JSON.stringify(
      {
        mode: apply ? 'apply published article images' : 'offline preview; CMS not contacted',
        assets: files,
      },
      null,
      2,
    ),
  )
  if (!apply) return

  await import('dotenv/config')
  if (
    ![
      'R2_ACCESS_KEY_ID',
      'R2_BUCKET',
      'R2_ENDPOINT',
      'R2_PUBLIC_URL',
      'R2_SECRET_ACCESS_KEY',
    ].every((name) => process.env[name])
  ) {
    throw new Error('Complete R2 configuration is required; refusing a local-only upload.')
  }
  const secret = process.env.CRON_SECRET
  if (!secret) throw new Error('The production job credential is missing.')
  const publicBase = new URL(process.env.R2_PUBLIC_URL!)
  if (
    publicBase.protocol !== 'https:' ||
    publicBase.username ||
    publicBase.password ||
    publicBase.search ||
    publicBase.hash
  ) {
    throw new Error(
      'R2_PUBLIC_URL must be a public HTTPS base URL without credentials or query parameters.',
    )
  }
  const queue = `researched-images-${randomUUID()}`
  const endpoint = new URL('https://blogs.shoppercove.com/api/payload-jobs/run')
  endpoint.searchParams.set('queue', queue)
  endpoint.searchParams.set('limit', '1')
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
      throw new Error('Production publishing tasks are not configured.')
    return result
  }
  // Check authorization against an empty unique queue before uploading or changing live content.
  await runProduction()
  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('@payload-config'),
  ])
  const payload = await getPayload({ config })
  let backup: string | undefined
  let stage = 'preflight'
  const uploaded: string[] = []
  const updated: string[] = []
  const refreshed: string[] = []
  const jobs: string[] = []
  const readPosts = async (draft: boolean) => {
    const result = await payload.find({
      collection: 'posts',
      draft,
      overrideAccess: draft,
      depth: 0,
      pagination: false,
      limit: 1000,
      ...(draft ? {} : { where: { _status: { equals: 'published' as const } } }),
    })
    if (result.totalDocs > result.docs.length)
      throw new Error('Post snapshot was truncated; refusing an incomplete comparison.')
    return result.docs
  }
  const readPair = async (id: string) =>
    Promise.all([
      payload.findByID({ collection: 'posts', id, draft: true, depth: 0, overrideAccess: true }),
      payload.findByID({ collection: 'posts', id, draft: false, depth: 0, overrideAccess: false }),
    ])
  const assertPublished = (latest: Post, live: Post, asset: (typeof assets)[number]) => {
    if (
      latest.id !== asset.id ||
      latest.slug !== asset.slug ||
      latest._status !== 'published' ||
      live._status !== 'published' ||
      !same(latest, live)
    ) {
      throw new Error(
        `Expected the same published/latest article; preserve any newer draft: ${asset.slug}`,
      )
    }
  }
  const verifyMedia = async (media: Media, asset: (typeof files)[number]) => {
    if (
      media.filename !== asset.filename ||
      media.alt !== asset.alt ||
      media.mimeType !== 'image/webp' ||
      media.width !== asset.width ||
      media.height !== asset.height ||
      !media.url
    ) {
      throw new Error(
        `Existing/uploaded media does not match the expected file, dimensions and alt text: ${asset.filename}`,
      )
    }
    const url = new URL(media.url)
    const basePath = `${publicBase.pathname.replace(/\/$/, '')}/`
    if (
      url.origin !== publicBase.origin ||
      !url.pathname.startsWith(basePath) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      throw new Error(`Media URL does not use the configured public R2 location: ${asset.filename}`)
    }
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'error',
      signal: AbortSignal.timeout(30000),
    })
    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) {
      throw new Error(
        `Image URL is not reachable as an image: ${asset.filename} (HTTP ${response.status}).`,
      )
    }
  }
  try {
    const [latestBefore, publicBefore, mediaBefore] = await Promise.all([
      readPosts(true),
      readPosts(false),
      payload.find({
        collection: 'media',
        where: { filename: { in: assets.map(({ filename }) => filename) } },
        depth: 0,
        pagination: false,
        limit: assets.length + 1,
        overrideAccess: true,
      }),
    ])
    if (mediaBefore.totalDocs > mediaBefore.docs.length)
      throw new Error('Media lookup was truncated.')
    const targets = files.map((asset) => {
      const latest = latestBefore.find(({ id }) => id === asset.id)
      const live = publicBefore.find(({ id }) => id === asset.id)
      if (!latest || !live) throw new Error(`Required published post is missing: ${asset.slug}`)
      assertPublished(latest, live, asset)
      const matches = mediaBefore.docs.filter(({ filename }) => filename === asset.filename)
      if (matches.length > 1) throw new Error(`Ambiguous media filename: ${asset.filename}`)
      const media = matches[0]
      for (const existing of [relationshipID(live.heroImage), relationshipID(live.meta?.image)]) {
        if (existing && existing !== media?.id)
          throw new Error(`Preserving a different existing hero/SEO image: ${asset.slug}`)
      }
      if (live.imageCaption && live.imageCaption !== asset.caption)
        throw new Error(`Preserving a different existing image caption: ${asset.slug}`)
      return { asset, post: live, media }
    })
    // Validate reusable media for the whole batch before making any changes.
    for (const { asset, media } of targets) if (media) await verifyMedia(media, asset)
    await mkdir('.local-backups', { recursive: true, mode: 0o700 })
    backup = `.local-backups/researched-images-before-${Date.now()}.json`
    await writeFile(
      backup,
      JSON.stringify(
        {
          queue,
          assets: files,
          latest: latestBefore,
          published: publicBefore,
          media: mediaBefore.docs,
        },
        null,
        2,
      ),
      { mode: 0o600, flag: 'wx' },
    )
    console.log(`Backup: ${backup}`)
    for (const target of targets) {
      if (!target.media) {
        stage = `upload ${target.asset.filename}`
        // Recheck the filename after preflight to avoid a duplicate from another upload.
        const found = await payload.find({
          collection: 'media',
          where: { filename: { equals: target.asset.filename } },
          depth: 0,
          limit: 1,
          overrideAccess: true,
        })
        if (found.totalDocs)
          throw new Error(`Media appeared concurrently: ${target.asset.filename}`)
        target.media = await payload.create({
          collection: 'media',
          overrideAccess: true,
          context: { disableRevalidate: true },
          filePath: target.asset.filePath,
          data: { alt: target.asset.alt },
        })
        uploaded.push(target.media.id)
        await verifyMedia(target.media, target.asset)
      }
    }
    const expected: Post[] = targets.map(({ asset, post, media }) => ({
      ...post,
      heroImage: media.id,
      meta: { ...post.meta, image: media.id },
      imageCaption: asset.caption,
    }))
    const fingerprint = digest(
      JSON.stringify(
        normalize({
          files: files.map(({ filename, hash }) => ({ filename, hash })),
          posts: expected.map(stablePost),
        }),
      ),
    )
    let completedFingerprint: string | undefined
    try {
      completedFingerprint = (
        JSON.parse(await readFile(completionPath, 'utf8')) as { fingerprint?: string }
      ).fingerprint
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT')
        throw new Error('Cannot read the previous completion receipt; inspect it before retrying.')
    }
    const alreadyComplete =
      completedFingerprint === fingerprint &&
      targets.every(({ post }, index) => same(stablePost(post), stablePost(expected[index])))
    for (const [index, { asset, post }] of targets.entries()) {
      stage = `assign ${asset.slug}`
      const [latest, live] = await readPair(post.id)
      assertPublished(latest, live, asset)
      if (!same(live, post)) throw new Error(`Concurrent article edit: ${asset.slug}`)
      if (!same(stablePost(live), stablePost(expected[index]))) {
        const result = await payload.update({
          collection: 'posts',
          draft: false,
          depth: 0,
          overrideAccess: true,
          overrideLock: false,
          context: { disableRevalidate: true },
          limit: 1,
          where: {
            and: [
              { id: { equals: post.id } },
              { _status: { equals: 'published' } },
              { updatedAt: { equals: post.updatedAt } },
            ],
          },
          data: {
            heroImage: expected[index].heroImage,
            meta: expected[index].meta,
            imageCaption: asset.caption,
          },
        })
        if (result.errors.length || result.docs.length !== 1 || result.docs[0].id !== post.id)
          throw new Error(`Guarded image update failed: ${asset.slug}`)
        updated.push(asset.slug)
      }
      const [savedLatest, savedLive] = await readPair(post.id)
      assertPublished(savedLatest, savedLive, asset)
      if (!same(stablePost(savedLive), stablePost(expected[index])))
        throw new Error(`Fields beyond the intended images/caption changed: ${asset.slug}`)
      expected[index] = savedLive
      if (alreadyComplete) continue
      stage = `refresh production caches for ${asset.slug}`
      // A unique, single-job queue keeps each refresh close to the last draft/concurrency check.
      const job = await payload.jobs.queue({
        task: 'schedulePublish',
        queue,
        overrideAccess: true,
        input: { type: 'publish', doc: { relationTo: 'posts', value: post.id } },
      })
      jobs.push(String(job.id))
      const [beforeJobLatest, beforeJobLive] = await readPair(post.id)
      assertPublished(beforeJobLatest, beforeJobLive, asset)
      if (!same(beforeJobLive, savedLive))
        throw new Error(`Article changed before cache refresh: ${asset.slug}`)
      await runProduction()
      const status = await payload.find({
        collection: 'payload-jobs',
        where: { id: { equals: job.id } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      if (!payload.config.jobs.deleteJobOnComplete && status.docs.length !== 1)
        throw new Error(`Production refresh job is missing: ${asset.slug}`)
      if (status.docs.some((item) => !item.completedAt || item.hasError || item.processing))
        throw new Error(`Production refresh job did not finish successfully: ${asset.slug}`)
      const [afterJobLatest, afterJobLive] = await readPair(post.id)
      assertPublished(afterJobLatest, afterJobLive, asset)
      if (!same(stablePost(afterJobLive), stablePost(expected[index])))
        throw new Error(`Unexpected article change during production refresh: ${asset.slug}`)
      expected[index] = afterJobLive
      refreshed.push(asset.slug)
    }
    stage = 'final verification'
    const [latestAfter, publicAfter] = await Promise.all([readPosts(true), readPosts(false)])
    const unrelated = (posts: Post[]) =>
      snapshot(posts.filter((post) => !assets.some(({ id }) => id === post.id)))
    if (
      !same(unrelated(latestAfter), unrelated(latestBefore)) ||
      !same(unrelated(publicAfter), unrelated(publicBefore))
    )
      throw new Error(
        'Unrelated posts changed during this run; inspect the backup before continuing.',
      )
    for (const [index, { asset, media }] of targets.entries()) {
      const latest = latestAfter.find(({ id }) => id === asset.id)
      const live = publicAfter.find(({ id }) => id === asset.id)
      if (!latest || !live)
        throw new Error(`Article disappeared during verification: ${asset.slug}`)
      assertPublished(latest, live, asset)
      if (!same(live, expected[index]))
        throw new Error(`Final article verification failed: ${asset.slug}`)
      const verifiedMedia = await payload.findByID({
        collection: 'media',
        id: media.id,
        depth: 0,
        overrideAccess: true,
      })
      await verifyMedia(verifiedMedia, asset)
    }
    const receipt = `${completionPath}.${randomUUID()}.tmp`
    await writeFile(
      receipt,
      JSON.stringify(
        {
          fingerprint,
          completedAt: new Date().toISOString(),
          queue,
          jobs,
          posts: expected.map(({ id, slug }) => ({ id, slug })),
        },
        null,
        2,
      ),
      { mode: 0o600, flag: 'wx' },
    )
    await rename(receipt, completionPath)
    console.log(
      JSON.stringify(
        {
          updated,
          refreshed,
          uploadedMediaIDs: uploaded,
          alreadyComplete,
          unrelatedPostsUnchanged: true,
          backup,
        },
        null,
        2,
      ),
    )
  } catch (error) {
    // Cancel only unfinished jobs in this run's unique queue; never remove media or restore over edits.
    try {
      await payload.jobs.cancel({
        queue,
        overrideAccess: true,
        where: { queue: { equals: queue } },
      })
    } catch {
      console.error(
        `Could not cancel unfinished jobs in queue ${queue}; inspect it before retrying.`,
      )
    }
    console.error(
      JSON.stringify(
        {
          failedDuring: stage,
          backup,
          queue,
          uploadedMediaIDs: uploaded,
          updated,
          refreshed,
          jobIDs: jobs,
          note: 'Changes may be partial. Inspect the backup and queue; no content rollback or media deletion was attempted.',
        },
        null,
        2,
      ),
    )
    throw error
  } finally {
    await payload.destroy()
  }
}

try {
  await main()
  process.exit(0)
} catch (error) {
  let message = error instanceof Error ? error.message : 'Image update failed.'
  for (const name of [
    'CRON_SECRET',
    'DATABASE_URL',
    'PAYLOAD_SECRET',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
  ]) {
    const value = process.env[name]
    if (value) message = message.replaceAll(value, '[redacted]')
  }
  console.error(message)
  process.exit(1)
}
