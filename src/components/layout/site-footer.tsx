import { Link } from 'react-router-dom'

export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 py-10">
      <div className="shell flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <div className="font-display text-2xl">CityPulse</div>
          <p className="max-w-md text-sm leading-6 text-[color:var(--muted)]">
            A community-based event discovery platform for people who want their city to feel curated, connected,
            and alive again.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-semibold text-[color:var(--muted)]">
          <Link to="/discover">Discover</Link>
          <Link to="/communities">Communities</Link>
          <Link to="/app/dashboard">Dashboard</Link>
          <Link to="/signup">Join CityPulse</Link>
        </div>
      </div>
    </footer>
  )
}
