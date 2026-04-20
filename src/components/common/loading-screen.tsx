import { Spinner } from '@/components/ui/spinner'

export function LoadingScreen({
  title = 'Loading CityPulse',
  description = 'Curating the best corners of the city for you.',
}: {
  title?: string
  description?: string
}) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="eyebrow">Please wait</div>
      <Spinner className="size-7" />
      <div className="space-y-1">
        <h2 className="text-3xl">{title}</h2>
        <p className="max-w-md text-sm text-[color:var(--muted)]">{description}</p>
      </div>
    </div>
  )
}
