import NearbyExperience from '@/components/nearby-experience'

export const metadata = { title: 'Nearby buddies | Travel Buddy' }

export default async function NearbyPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const initialTab =
    tab === 'profile' || tab === 'packages' || tab === 'messages'
      ? tab
      : 'explore'
  return (
    <div className="nearby-app">
      <NearbyExperience initialTab={initialTab} />
    </div>
  )
}
