import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { publicNav } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'

function NavItem({ to, children }: { to: string; children: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-black/5',
          isActive && 'bg-[color:var(--teal-soft)] text-[color:var(--teal)]',
        )
      }
    >
      {children}
    </NavLink>
  )
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout, appMode } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-[rgba(245,239,231,0.85)] backdrop-blur-xl">
      <div className="shell flex h-20 items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[color:var(--teal)] text-sm font-bold text-white">
              CP
            </div>
            <div>
              <div className="font-display text-xl font-semibold">CityPulse</div>
              <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">{appMode}</div>
            </div>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {publicNav.map((item) => (
              <NavItem key={item.href} to={item.href}>
                {item.label}
              </NavItem>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              <Link
                to="/app/settings"
                className="flex items-center gap-3 rounded-full border border-[color:var(--border)] bg-white/70 px-3 py-2"
              >
                <img src={user.avatarUrl} alt={user.fullName} className="size-9 rounded-full object-cover" />
                <div className="text-left">
                  <div className="text-sm font-semibold">{user.fullName}</div>
                  <div className="text-xs text-[color:var(--muted)]">{user.city}</div>
                </div>
              </Link>
              <Button variant="outline" onClick={() => void logout()}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button>Get started</Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-full border border-[color:var(--border)] bg-white/70 lg:hidden"
          onClick={() => setMenuOpen((current) => !current)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {menuOpen ? (
        <div className="border-t border-black/5 bg-white/80 lg:hidden">
          <div className="shell flex flex-col gap-3 py-4">
            {publicNav.map((item) => (
              <NavItem key={item.href} to={item.href}>
                {item.label}
              </NavItem>
            ))}
            {user ? (
              <>
                <NavItem to="/app/settings">Settings</NavItem>
                <Button variant="outline" onClick={() => void logout()}>
                  Log out
                </Button>
              </>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup" className="flex-1">
                  <Button className="w-full">Get started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  )
}
