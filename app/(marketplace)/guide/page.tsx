import { LocalGuideDemo } from '@/components/marketplace/LocalGuideDemo'

export default async function GuidePage({
  searchParams,
}: {
  searchParams: Promise<{ zone?: string }>
}) {
  return <LocalGuideDemo initialZone={(await searchParams).zone} />
}
