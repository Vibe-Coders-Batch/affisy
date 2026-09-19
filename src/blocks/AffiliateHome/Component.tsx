import configPromise from '@payload-config'
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CookingPot,
  Leaf,
  Search,
  ShieldCheck,
  BedDouble,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { getPayload } from 'payload'
import { Media } from '@/components/Media'
import { PostCard } from '@/components/Editorial/PostCard'
import type { AffiliateHomeBlock as Props } from '@/payload-types'

export async function AffiliateHomeBlock(props: Props) {
  const payload = await getPayload({ config: configPromise })
  const { docs: posts } = await payload.find({
    collection: 'posts',
    depth: 1,
    draft: false,
    limit: props.latestLimit || 6,
    overrideAccess: false,
    sort: '-publishedAt',
    where: { _status: { equals: 'published' } },
  })
  // Only use a featured relationship if it is still publicly published.
  const featuredID =
    typeof props.featuredPost === 'object' ? props.featuredPost?.id : props.featuredPost
  const featured =
    (featuredID
      ? (
          await payload.find({
            collection: 'posts',
            limit: 1,
            depth: 1,
            overrideAccess: false,
            where: { and: [{ id: { equals: featuredID } }, { _status: { equals: 'published' } }] },
          })
        ).docs[0]
      : undefined) || posts[0]
  const legacy = props.heroTitle === 'Learn Affiliate Marketing. Build Your Freedom.'
  const title = legacy ? 'Good finds.\nBetter everyday living.' : props.heroTitle
  const description = legacy
    ? 'Thoughtful buying guides and a closer look at the things you bring home. Find what fits your life, before you buy.'
    : props.heroDescription
  return (
    <div className="shoppecove-home">
      <div className="container">
        <div className="flex flex-wrap justify-between gap-2 border-b border-[#deded3] py-4 text-[10px] uppercase tracking-[0.16em] text-[#626b60]">
          <span>The ShoppeCove journal</span>
          <span>Considered choices. Everyday discoveries.</span>
        </div>
        <section className="grid items-center gap-10 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-16">
          <div>
            <p className="eyebrow flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-[#b7704f]" /> A more thoughtful way to shop
            </p>
            <h1 className="font-editorial mt-6 whitespace-pre-line text-5xl leading-[1.06] tracking-[-0.045em] sm:text-6xl lg:text-[72px]">
              {title}
            </h1>
            <p className="mt-6 max-w-md text-base leading-8 text-[#626b60]">{description}</p>
            <Link href={legacy ? '/posts' : props.heroCTA.url} className="cove-button mt-7">
              {legacy ? 'Explore the journal' : props.heroCTA.label}
              <ArrowUpRight className="size-4" />
            </Link>
            <p className="mt-7 text-xs text-[#626b60]">
              Home & kitchen <span className="px-2">/</span> Sleep & comfort{' '}
              <span className="px-2">/</span> Everyday know-how
            </p>
          </div>
          <figure className="relative">
            <div className="relative aspect-[1.18] overflow-hidden rounded-t-[45%] rounded-b-sm bg-[#e9eadd]">
              {!legacy && props.heroImage && typeof props.heroImage === 'object' ? (
                <Media fill priority resource={props.heroImage} imgClassName="object-cover" />
              ) : (
                <Image
                  src="/images/kitchen-editorial.webp"
                  alt="An illustrative kitchen scene with a chef’s knife, tomatoes, and an oak cutting board"
                  fill
                  preload
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover"
                />
              )}
            </div>
            <div className="absolute bottom-10 -left-3 max-w-[250px] bg-[#faf9f5] p-5 shadow-sm sm:-left-6">
              <p className="eyebrow">Start with the essentials</p>
              <p className="font-editorial mt-2 text-2xl leading-tight">
                Small details.
                <br />
                Better decisions.
              </p>
              <Link
                href="/posts?category=kitchen"
                className="mt-3 inline-flex items-center gap-3 text-xs font-medium"
              >
                Explore kitchen guides <ArrowRight className="size-4" />
              </Link>
            </div>
            {(legacy || !props.heroImage) && (
              <figcaption className="mt-2 text-right text-[10px] text-[#73796e]">
                AI-generated editorial illustration
              </figcaption>
            )}
          </figure>
        </section>
        <div className="grid gap-5 border-y border-[#deded3] py-6 sm:grid-cols-3">
          {[
            {
              icon: Search,
              title: 'Look beyond the headline',
              text: 'Features, trade-offs, and questions to ask.',
            },
            {
              icon: BookOpen,
              title: 'Find your next useful read',
              text: 'Practical advice before you buy.',
            },
            {
              icon: ShieldCheck,
              title: 'Know how we earn',
              text: 'Clear disclosure of affiliate relationships.',
            },
          ].map(({ icon: Icon, title, text }) => (
            <div className="flex items-start gap-3" key={title}>
              <Icon className="mt-1 size-5 shrink-0 text-[#7d896a]" strokeWidth={1.5} />
              <div>
                <h2 className="text-sm font-medium">{title}</h2>
                <p className="mt-1 text-xs leading-5 text-[#626b60]">{text}</p>
              </div>
            </div>
          ))}
        </div>
        <section className="py-14">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Settle in. Have a read.</p>
              <h2 className="font-editorial mt-2 text-4xl tracking-tight">From the journal</h2>
            </div>
            <Link href="/posts" className="inline-flex items-center gap-2 text-sm">
              All stories <ArrowUpRight className="size-4" />
            </Link>
          </div>
          {featured ? (
            <div className="grid gap-8 lg:grid-cols-[1.65fr_1fr]">
              <PostCard featured post={featured} />
              <aside className="flex flex-col justify-between bg-[#e9eddf] p-7 sm:p-9">
                <div>
                  <p className="eyebrow">The ShoppeCove way</p>
                  <Leaf className="my-7 size-9 text-[#7a866a]" strokeWidth={1} />
                  <h3 className="font-editorial text-4xl leading-[1.15] tracking-tight">
                    Less impulse.
                    <br />
                    More intention.
                  </h3>
                  <p className="mt-5 text-sm leading-7 text-[#626b60]">
                    The right purchase starts with the right questions. Our guides help you think
                    through what matters, what to compare, and what to check with the seller.
                  </p>
                </div>
                <Link
                  href="/editorial-policy"
                  className="mt-8 flex items-center justify-between border-t border-[#cdd3bf] pt-5 text-sm"
                >
                  Get to know our approach <ArrowUpRight className="size-4" />
                </Link>
              </aside>
            </div>
          ) : (
            <p className="py-10 text-[#626b60]">
              Our first buying guides are on their way. Explore our approach to thoughtful shopping
              below.
            </p>
          )}
        </section>
        <section className="border-y border-[#deded3] py-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_3fr]">
            <div>
              <p className="eyebrow">Follow your curiosity</p>
              <h2 className="font-editorial mt-2 text-3xl">A good place to start.</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: 'Kitchen & home',
                  text: 'For the spaces you use every day.',
                  href: '/posts?category=kitchen',
                  icon: CookingPot,
                },
                {
                  title: 'Sleep & comfort',
                  text: 'Find your own kind of comfortable.',
                  href: '/posts?category=sleep-comfort',
                  icon: BedDouble,
                },
                {
                  title: 'Buying guides',
                  text: 'A little homework before checkout.',
                  href: '/posts?category=buying-guides',
                  icon: BookOpen,
                },
              ].map(({ title, text, href, icon: Icon }) => (
                <Link
                  key={title}
                  href={href}
                  className="group flex items-center gap-4 border border-[#deded3] p-5 transition hover:bg-[#eeefe5]"
                >
                  <Icon className="size-7 shrink-0 text-[#7a866a]" strokeWidth={1.3} />
                  <div>
                    <h3 className="font-editorial text-xl">{title}</h3>
                    <p className="mt-1 text-xs text-[#626b60]">{text}</p>
                  </div>
                  <ArrowUpRight className="ml-auto size-4 shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </section>
        {posts.length > 1 && (
          <section className="py-14">
            <p className="eyebrow">Something worth knowing</p>
            <h2 className="font-editorial mb-7 mt-2 text-4xl tracking-tight">More useful reads</h2>
            <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {posts
                .filter((p) => p.id !== featured?.id)
                .slice(0, 3)
                .map((post) => (
                  <PostCard post={post} key={post.id} />
                ))}
            </div>
          </section>
        )}
        <section className="mb-12 mt-5 flex flex-col items-start justify-between gap-6 bg-[#233d32] p-8 text-[#faf9f5] sm:flex-row sm:items-center sm:p-12">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#c9d2ba]">
              A note on transparency
            </p>
            <h2 className="font-editorial mt-3 text-3xl">Your trust comes first.</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[#d9dfd1]">
              Some links may earn us a commission. We explain commercial relationships so you can
              make your own informed choice.
            </p>
          </div>
          <Link
            href="/affiliate-disclosure"
            className="inline-flex shrink-0 items-center gap-3 border-b border-[#899984] pb-2 text-sm"
          >
            How affiliate links work <ArrowUpRight className="size-4" />
          </Link>
        </section>
      </div>
    </div>
  )
}
