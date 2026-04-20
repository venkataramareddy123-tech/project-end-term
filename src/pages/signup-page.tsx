import { AuthForm } from '@/components/forms/auth-form'

export default function SignupPage() {
  return (
    <div className="shell py-8 sm:py-10">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hero-mesh panel flex flex-col justify-between p-8 sm:p-10">
          <div className="space-y-4">
            <div className="eyebrow">Create account</div>
            <h1 className="text-5xl leading-none sm:text-6xl">Build a better social rhythm for your city life.</h1>
            <p className="max-w-xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
              Join CityPulse to follow communities, save event ideas, RSVP, and curate a personal event dashboard.
            </p>
          </div>
          <div className="space-y-3 rounded-[28px] bg-white/70 p-6">
            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">What you get</div>
            <div className="space-y-2 text-sm text-[color:var(--muted)]">
              <p>Discovery filters synced with a map-first event feed.</p>
              <p>Persistent saved events and RSVP history.</p>
              <p>Organizer-lite tools for creating and editing your own events.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <AuthForm mode="signup" />
        </div>
      </div>
    </div>
  )
}
