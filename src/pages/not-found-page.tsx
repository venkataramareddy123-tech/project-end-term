import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="shell py-16">
      <div className="panel hero-mesh space-y-6 p-10 text-center">
        <div className="eyebrow mx-auto">404</div>
        <h1 className="text-6xl leading-none">This page wandered off the map.</h1>
        <p className="mx-auto max-w-2xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
          The route you opened does not exist, or it may have been moved while the city was changing around it.
        </p>
        <div className="flex justify-center gap-3">
          <Link to="/">
            <Button>Go home</Button>
          </Link>
          <Link to="/discover">
            <Button variant="outline">Explore events</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
