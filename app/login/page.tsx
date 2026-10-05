import { DemoLogin } from '@/components/demo-login'

export const metadata = { title: 'Log in | Travel Buddy' }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  return <div className="nearby-app"><DemoLogin next={next} /></div>
}
