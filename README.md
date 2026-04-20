# CityPulse

CityPulse is a production-style React application for community-based event discovery. It is designed for city locals who currently miss great hyperlocal events because discovery is fragmented across Instagram pages, WhatsApp groups, venue posts, and flyers.

## Problem Statement

### Who is the user?
- City locals who want a better way to discover meaningful events nearby
- Community organizers who need a polished way to publish and manage local events

### What problem does the app solve?
- Local events are hard to discover in one place
- Good community-hosted events are often shared too late or in closed circles
- Users have no clean workflow for saving, RSVPing to, and tracking event plans

### Why does this matter?
- People miss events they would have genuinely attended
- Community organizers struggle to reach the right audience
- City discovery feels random instead of intentional

## Core Features

- Authentication with protected routes
- Public landing page with premium editorial UI
- Map-first event discovery experience
- Advanced filtering with URL-synced filters
- Event detail pages with RSVP and save actions
- Community directory and community detail pages
- Personal dashboard with saved events and itinerary
- Organizer-lite event CRUD: create, edit, delete, manage
- Persistent user data via Supabase or demo local storage fallback

## React Concepts Demonstrated

- Functional components
- Props and component composition
- `useState`
- `useEffect`
- Conditional rendering
- Lists and keys
- Lifting state up
- Controlled components
- React Router
- Context API
- `useMemo`
- `useCallback`
- `useRef`
- `React.lazy` and `Suspense`
- Performance-aware filtering and route splitting

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- TanStack Query
- Supabase
- Mapbox GL
- Framer Motion
- Lucide React

## Project Structure

```text
src/
  components/
  context/
  data/
  hooks/
  lib/
  pages/
  routes/
  services/
  types/
supabase/
  schema.sql
```

## Demo Mode and Backend Mode

CityPulse works in two modes:

- `Supabase mode`: used when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured
- `Demo mode`: automatically enabled when Supabase env variables are missing; uses seeded local storage data so the app is fully explorable without backend setup

Demo credentials:

- Email: `ava@citypulse.app`
- Password: `citypulse123`

## Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` values into a local `.env` file and update them:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_MAPBOX_TOKEN=your-mapbox-token
```

If you skip the Supabase variables, the app runs in demo mode.

### 3. Run the app

```bash
npm run dev
```

### 4. Production build

```bash
npm run build
```

### 5. Lint

```bash
npm run lint
```

## Supabase Setup

- Run the SQL in [supabase/schema.sql](/D:/end-project-1/supabase/schema.sql)
- Create the storage buckets:
  - `event-images`
  - `community-covers`
  - `avatars`
- Set your Vite env variables
- Start the app

## Key Product Screens

- Landing page
- Discover page
- Event detail page
- Communities page
- Community detail page
- Login / Signup
- Dashboard
- Saved events
- Itinerary
- Create / Edit event
- Manage events
- Profile settings

## Submission Notes

### GitHub repo checklist

- Clear README
- Proper folder structure
- Clean code organization
- Real routing, auth flow, CRUD, and persistent data

### Demo video checklist

In 3 to 5 minutes, explain:

- The real-world problem
- Who the users are
- Major features
- React concepts used
- Why Supabase and the chosen architecture were used
- How the discovery flow, protected routes, and CRUD work

### Deployment

Recommended:

- Vercel
- Netlify

## Verification

The implementation has been verified with:

- `npm run lint`
- `npm run build`

## Notes

- The large `event-map` production chunk comes from interactive map support. Routes are lazy-loaded, but map-heavy UI still adds bundle weight on discovery/detail screens.
- The app uses a premium editorial city-guide visual direction instead of a generic dashboard clone.
