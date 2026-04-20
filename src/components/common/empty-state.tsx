import { Button } from '@/components/ui/button'

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="panel flex flex-col gap-4 p-8">
      <div className="eyebrow">Nothing here yet</div>
      <div className="space-y-2">
        <h3 className="text-2xl">{title}</h3>
        <p className="max-w-xl text-sm leading-6 text-[color:var(--muted)]">{description}</p>
      </div>
      {actionLabel && onAction ? (
        <div>
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      ) : null}
    </div>
  )
}
