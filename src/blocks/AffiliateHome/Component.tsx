import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CookingPot,
  Heart,
  Leaf,
  Lightbulb,
  Monitor,
  PawPrint,
  Search,
  ShieldCheck,
  Sprout,
  Wrench,
} from 'lucide-react'
import Link from 'next/link'
import { getPublicPosts } from '@/utilities/getPublicPosts'
import { getPublicJournal, type PublicJournalPost } from '@/utilities/getPublicJournal'
import { getPostTopics, selectTopicPosts } from '@/utilities/journalTopics'
import { isStarterHomeImage, isStarterHomeTitle, journalHome } from '@/content/journal-home'
import { Media } from '@/components/Media'
import { PostCard } from '@/components/Editorial/PostCard'
import type { AffiliateHomeBlock as Props } from '@/payload-types'

const topicIcons = {
  'food-kitchen': CookingPot,
  'home-garden': Sprout,
  'diy-projects': Wrench,
  'learning-hobbies': BookOpen,
  'digital-tools': Monitor,
  pets: PawPrint,
  'health-wellness': Heart,
  'personal-growth': Lightbulb,
}

function postImage(post: PublicJournalPost) {
  const image = post.heroImage || post.meta?.image
  return image && typeof image === 'object' ? image : undefined
}

export async function AffiliateHomeBlock(props: Props) {
  const featuredID =
    typeof props.featuredPost === 'object' ? props.featuredPost?.id : props.featuredPost
  const [journal, selected] = await Promise.all([
    getPublicJournal(),
    featuredID ? getPublicPosts('', 1, 1, '', featuredID) : Promise.resolve(null),
  ])
  const featured = selected?.docs[0] || journal.posts[0]
  const starter = isStarterHomeTitle(props.heroTitle)
  const title = starter ? journalHome.heroTitle : props.heroTitle
  const description = starter ? journalHome.heroDescription : props.heroDescription
  const customHero =
    props.heroImage &&
    typeof props.heroImage === 'object' &&
    !(starter && isStarterHomeImage(props.heroImage.filename))
      ? props.heroImage
      : undefined
  const morePosts = selectTopicPosts(
    journal.posts,
    props.latestLimit || 6,
    featured ? [featured.id] : [],
  )
  const heroStories: PublicJournalPost[] = []
  for (const [slug, illustratedPost] of [
    ['home-garden', '4-foot-farm-blueprint-guide'],
    ['learning-hobbies', 'pianoforall-adult-beginners-guide'],
    ['diy-projects', 'small-woodworking-shop-setup'],
    ['pets', 'brain-training-for-dogs-review'],
  ]) {
    const candidates = journal.posts.filter((post) =>
      getPostTopics(post).some((topic) => topic.slug === slug),
    )
    const post =
      candidates.find((post) => post.slug === illustratedPost && postImage(post)) ||
      candidates.find((post) => postImage(post)) ||
      candidates[0]
    if (post && !heroStories.some(({ id }) => id === post.id)) heroStories.push(post)
  }
  heroStories.push(
    ...selectTopicPosts(
      journal.posts,
      4 - heroStories.length,
      heroStories.map(({ id }) => id),
    ),
  )

  return (
    <div className="shoppecove-home">
      <div className="container">
        <div className="flex flex-wrap justify-between gap-2 border-b border-[#deded3] py-4 text-[10px] uppercase tracking-[0.16em] text-[#626b60]">
          <span>The ShoppeCove journal</span>
          <span>Many interests. Considered choices.</span>
        </div>
        <section className="grid items-center gap-10 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:py-16">
          <div>
            <p className="eyebrow flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-[#b7704f]" /> Everyday ideas. A closer look.
            </p>
            <h1 className="font-editorial mt-6 whitespace-pre-line text-5xl leading-[1.06] tracking-[-0.045em] sm:text-6xl lg:text-[72px]">
              {title}
            </h1>
            <p className="mt-6 max-w-md text-base leading-8 text-[#626b60]">{description}</p>
            <div className="mt-7 flex flex-wrap items-center gap-6">
              <Link href={starter ? '/posts' : props.heroCTA.url} className="cove-button">
                {starter ? 'Explore the journal' : props.heroCTA.label}
                <ArrowUpRight className="size-4" />
              </Link>
              {journal.topics.length > 0 && (
                <Link href="#topics" className="inline-flex items-center gap-2 text-sm">
                  Find your topic <ArrowRight className="size-4" />
                </Link>
              )}
            </div>
            {journal.posts.length > 0 && (
              <p className="mt-8 text-xs text-[#626b60]">
                {journal.posts.length} articles{' '}
                <span className="px-3" aria-hidden="true">
                  /
                </span>
                {journal.topics.length} topics{' '}
                <span className="px-3" aria-hidden="true">
                  /
                </span>{' '}
                Plenty to discover
              </p>
            )}
          </div>
          {customHero ? (
            <div className="relative aspect-[1.18] overflow-hidden rounded-t-[45%] rounded-b-sm bg-[#e9eadd]">
              <Media
                fill
                priority
                resource={customHero}
                imgClassName="object-cover"
                size="(max-width: 1024px) 100vw, 55vw"
              />
            </div>
          ) : heroStories.length > 0 ? (
            <div
              aria-label="Discover stories across the journal"
              className="bg-[#eeefe5] p-4 sm:p-6"
            >
              <p className="eyebrow mb-4">A place for your next interest</p>
              <div className="grid grid-cols-2 gap-4">
                {heroStories.map((post, index) => {
                  const topic = getPostTopics(post)[0]
                  const image = postImage(post)
                  const Icon = topicIcons[topic?.slug as keyof typeof topicIcons] || BookOpen
                  return (
                    <Link
                      key={post.id}
                      href={`/posts/${post.slug}`}
                      className="group min-w-0 bg-[#faf9f5]"
                    >
                      <div className="relative aspect-[1.35] overflow-hidden bg-[#e1e6d7]">
                        {image ? (
                          <Media
                            fill
                            priority={index === 0}
                            resource={image}
                            imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
                            size="(max-width: 640px) 45vw, (max-width: 1024px) 40vw, 25vw"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Icon className="size-14 text-[#7a866a]" strokeWidth={1} />
                          </div>
                        )}
                      </div>
                      <div className="p-3 sm:p-4">
                        <p className="eyebrow flex items-center justify-between gap-2">
                          {topic?.title || 'From the journal'}{' '}
                          <ArrowUpRight className="size-3 shrink-0" />
                        </p>
                        <p className="font-editorial mt-2 line-clamp-2 text-lg leading-snug tracking-tight sm:text-xl">
                          {post.title}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
              <p className="mt-3 text-right text-[10px] leading-5 text-[#626b60]">
                {heroStories.every((post) =>
                  [
                    '4-foot-farm-blueprint-guide',
                    'pianoforall-adult-beginners-guide',
                    'small-woodworking-shop-setup',
                    'brain-training-for-dogs-review',
                  ].includes(post.slug),
                )
                  ? 'AI-generated editorial illustrations'
                  : 'Story artwork from the journal'}
              </p>
            </div>
          ) : (
            <div className="flex aspect-[1.18] flex-col justify-center bg-[#eeefe5] p-10">
              <BookOpen className="mb-6 size-12 text-[#7a866a]" strokeWidth={1} />
              <p className="font-editorial text-4xl">Your next useful read starts here.</p>
              <p className="mt-4 text-sm leading-7 text-[#626b60]">
                Practical ideas and a little research for everyday decisions.
              </p>
            </div>
          )}
        </section>
        <div className="grid gap-5 border-y border-[#deded3] py-6 sm:grid-cols-3">
          {[
            {
              icon: BookOpen,
              title: 'Put curiosity into practice',
              text: 'Planning guides, comparisons, and useful next steps.',
            },
            {
              icon: Search,
              title: 'Look beyond the headline',
              text: 'Features, trade-offs, and claims worth checking.',
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
        {journal.topics.length > 0 && (
          <section id="topics" className="scroll-mt-24 border-b border-[#deded3] py-12 sm:py-14">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Follow what interests you</p>
                <h2 className="font-editorial mt-2 text-4xl tracking-tight">
                  A journal with room to explore.
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-7 text-[#626b60]">
                From a new skill to your next project, find a useful place to begin.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {journal.topics.map((topic) => {
                const Icon = topicIcons[topic.slug as keyof typeof topicIcons] || BookOpen
                return (
                  <Link
                    key={topic.slug}
                    href={`/posts?topic=${topic.slug}`}
                    className="group flex flex-col border border-[#deded3] p-6 transition hover:bg-[#eeefe5]"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <Icon className="size-7 text-[#7a866a]" strokeWidth={1.3} />
                      <span className="text-[10px] uppercase tracking-wider text-[#626b60]">
                        {topic.count} {topic.count === 1 ? 'article' : 'articles'}
                      </span>
                    </div>
                    <h3 className="font-editorial text-2xl leading-tight tracking-tight">
                      {topic.title}
                    </h3>
                    <p className="mb-5 mt-3 text-xs leading-6 text-[#626b60]">
                      {topic.description}
                    </p>
                    <span className="mt-auto inline-flex items-center justify-between text-xs font-medium">
                      Explore this topic <ArrowUpRight className="size-4" />
                    </span>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
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
                    Good questions.
                    <br />
                    More informed choices.
                  </h3>
                  <p className="mt-5 text-sm leading-7 text-[#626b60]">
                    Whether you’re planning a project, exploring a course, or comparing a product, a
                    little research goes a long way. We look at what’s offered, what’s uncertain,
                    and what to check before you commit.
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
              Our first stories are on their way. Explore our approach to researched reviews and
              practical guides.
            </p>
          )}
        </section>
        {morePosts.length > 0 && (
          <section className="border-t border-[#deded3] py-14">
            <p className="eyebrow">A different direction for every interest</p>
            <h2 className="font-editorial mb-7 mt-2 text-4xl tracking-tight">More to discover</h2>
            <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {morePosts.map((post) => (
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
