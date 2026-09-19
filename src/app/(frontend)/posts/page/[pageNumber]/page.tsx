import { notFound, permanentRedirect } from 'next/navigation'

export default async function Page({ params }: { params: Promise<{ pageNumber: string }> }) {
  const { pageNumber } = await params
  if (!/^\d+$/.test(pageNumber) || Number(pageNumber) < 1) notFound()
  permanentRedirect(Number(pageNumber) === 1 ? '/posts' : `/posts?page=${Number(pageNumber)}`)
}
