export function PostGridSkeleton() {
  return (
    <div role="status" aria-label="Loading articles" className="py-6">
      <span className="sr-only">Loading articles…</span>
      <div
        aria-hidden="true"
        className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 motion-safe:animate-pulse"
      >
        {[0, 1, 2].map((item) => (
          <div key={item}>
            <div className="aspect-[1.6] bg-[#e9eadd]" />
            <div className="mt-6 h-3 w-24 bg-[#e9eadd]" />
            <div className="mt-4 h-7 w-5/6 bg-[#e9eadd]" />
            <div className="mt-3 h-4 w-full bg-[#e9eadd]" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function PageLoading() {
  return (
    <div className="container py-12 sm:py-16" role="status" aria-label="Loading page">
      <p className="eyebrow">Loading your next read…</p>
      <div aria-hidden="true" className="mt-6 max-w-3xl motion-safe:animate-pulse">
        <div className="h-12 w-4/5 bg-[#e9eadd]" />
        <div className="mt-6 h-5 w-3/5 bg-[#e9eadd]" />
        <div className="mt-10 aspect-[2] bg-[#e9eadd]" />
      </div>
    </div>
  )
}
