import { SharedNavigation } from '@/components/marketplace/SharedNavigation'

export default function NearbyLayout({ children }: { children: React.ReactNode }) {
  return <div className="shared-nearby-shell">
    <div className="marketplace shared-site-header"><SharedNavigation placement="header" /></div>
    {children}
    <div className="marketplace"><SharedNavigation placement="mobile" /></div>
  </div>
}
