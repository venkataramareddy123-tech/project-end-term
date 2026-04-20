import { AuthForm } from '@/components/forms/auth-form'

export default function LoginPage() {
  return (
    <div className="shell py-8 sm:py-10">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hero-mesh panel flex flex-col justify-between p-8 sm:p-10">
          <div className="space-y-4">
            <div className="eyebrow">Log in</div>
            <h1 className="text-5xl leading-none sm:text-6xl">Pick up exactly where your city calendar left off.</h1>
            <p className="max-w-xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
              Open your saved events, itinerary, and organizer tools in one polished dashboard.
            </p>
          </div>
          <div className="space-y-3 rounded-[28px] bg-white/70 p-6">
            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">Included</div>
            <div className="space-y-2 text-sm text-[color:var(--muted)]">
              <p>Save interesting events before they disappear into stories and feeds.</p>
              <p>RSVP and keep a live itinerary for the week.</p>
              <p>Create and manage your own community events.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <AuthForm mode="login" />
        </div>
      </div>
    </div>
  )
}
