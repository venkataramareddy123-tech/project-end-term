import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow: string
  title: string
  description: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-4 md:flex-row md:items-end md:justify-between', className)}>
      <div className="space-y-3">
        <div className="eyebrow">{eyebrow}</div>
        <div className="space-y-2">
          <h2 className="max-w-2xl text-4xl sm:text-5xl">{title}</h2>
          <p className="max-w-2xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">{description}</p>
        </div>
      </div>
      {action}
    </div>
  )
}
