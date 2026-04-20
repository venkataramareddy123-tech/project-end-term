import { Button } from '@/components/ui/button'

export function ErrorState({
  title = 'Something slipped off the route',
  description = 'Try again in a moment or head back to discovery.',
  actionLabel,
  onAction,
}: {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="panel mx-auto flex max-w-2xl flex-col items-start gap-4 p-8">
      <div className="eyebrow">Error state</div>
      <div className="space-y-2">
        <h2 className="text-3xl">{title}</h2>
        <p className="text-sm leading-6 text-[color:var(--muted)]">{description}</p>
      </div>
      {actionLabel && onAction ? <Button onClick={onAction}>{actionLabel}</Button> : null}
    </div>
  )
}
