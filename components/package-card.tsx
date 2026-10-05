'use client'

import { Clock, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { packagePhotos } from '@/lib/map-data'
import type { DemoPackage } from '@/lib/poc-store'

export function PackageCard({
  item,
  buddy,
  action,
  onAction,
  compact = false,
}: {
  item: DemoPackage
  buddy?: string
  action?: string
  onAction?: () => void
  compact?: boolean
}) {
  return (
    <Card className={compact ? 'package-card compact-package' : 'package-card'}>
      <img
        src={packagePhotos[item.category ?? 'Explore'] ?? packagePhotos.Explore}
        alt=""
        loading="lazy"
        onError={(event) => { event.currentTarget.style.display = 'none' }}
      />
      <CardHeader>
        <CardDescription>
          {item.category ?? 'Explore'}
          {buddy ? ` with ${buddy.split(' ')[0]}` : ''}
        </CardDescription>
        <CardTitle>{item.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{item.summary}</p>
        {item.duration && (
          <div className="package-duration">
            <Clock size={13} /> {item.duration}
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-between gap-3">
        <span className="package-price">
          ${item.price.toFixed(2)} <small>USD / person</small>
        </span>
        {onAction && (
          <Button size="sm" onClick={onAction}>
            <Send data-icon="inline-start" />
            {action ?? 'Send package'}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
