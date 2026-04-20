import { CalendarDays, Heart, LayoutDashboard, PlusCircle, Settings, ShieldCheck, Users } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'

const links = [
  { href: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/saved', label: 'Saved', icon: Heart },
  { href: '/app/itinerary', label: 'Itinerary', icon: CalendarDays },
  { href: '/app/events/new', label: 'Create', icon: PlusCircle },
  { href: '/app/communities/new', label: 'Community', icon: Users },
  { href: '/app/manage', label: 'Manage', icon: ShieldCheck },
  { href: '/app/settings', label: 'Settings', icon: Settings },
]

export function DashboardShell() {
  const { user } = useAuth()

  return (
    <div className="shell py-10">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="panel h-fit p-5">
          <div className="flex items-center gap-3 border-b border-black/5 pb-5">
            <img src={user?.avatarUrl} alt={user?.fullName} className="size-14 rounded-2xl object-cover" />
            <div>
              <div className="font-semibold">{user?.fullName}</div>
              <div className="text-sm text-[color:var(--muted)]">{user?.city}</div>
            </div>
          </div>

          <nav className="mt-5 space-y-2">
            {links.map((link) => {
              const Icon = link.icon
              return (
                <NavLink
                  key={link.href}
                  to={link.href}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-[color:var(--muted)] transition hover:bg-black/5',
                      isActive && 'bg-[color:var(--teal)] text-white',
                    )
                  }
                >
                  <Icon className="size-4" />
                  {link.label}
                </NavLink>
              )
            })}
          </nav>
        </aside>

        <div className="space-y-6">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
