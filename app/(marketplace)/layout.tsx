import { AppShell } from '@/components/marketplace/AppShell'

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="marketplace">
      <AppShell>{children}</AppShell>
    </div>
  )
}
