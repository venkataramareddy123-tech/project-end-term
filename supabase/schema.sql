create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key,
  email text not null unique,
  full_name text not null,
  username text not null unique,
  bio text default '',
  avatar_url text,
  city text default 'Bengaluru',
  role text default 'member' check (role in ('member', 'organizer')),
  interests text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists public.communities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  long_description text default '',
  city text default 'Bengaluru',
  vibe text default '',
  tags text[] default '{}',
  cover_image text,
  avatar_image text,
  featured boolean default false,
  organizer_ids uuid[] default '{}',
  event_ids uuid[] default '{}',
  member_count integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null,
  description text not null,
  category text not null,
  tags text[] default '{}',
  start_at timestamptz not null,
  end_at timestamptz not null,
  venue text not null,
  address text not null,
  city text default 'Bengaluru',
  latitude double precision not null,
  longitude double precision not null,
  cover_image text,
  gallery text[] default '{}',
  price_label text default 'Free',
  capacity integer default 100,
  status text default 'published' check (status in ('published', 'draft')),
  community_id uuid references public.communities(id) on delete set null,
  created_by uuid references public.profiles(id) on delete cascade,
  attendees integer default 0,
  trending_score integer default 60,
  featured boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.community_memberships (
  user_id uuid references public.profiles(id) on delete cascade,
  community_id uuid references public.communities(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, community_id)
);

create table if not exists public.saved_events (
  user_id uuid references public.profiles(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, event_id)
);

create table if not exists public.rsvps (
  user_id uuid references public.profiles(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  status text not null check (status in ('going', 'interested', 'not_going')),
  created_at timestamptz default now(),
  primary key (user_id, event_id)
);

create index if not exists events_start_at_idx on public.events(start_at);
create index if not exists events_status_idx on public.events(status);
create index if not exists events_city_idx on public.events(city);
create index if not exists communities_slug_idx on public.communities(slug);

create or replace function public.sync_event_attendees()
returns trigger
language plpgsql
as $$
begin
  update public.events
  set attendees = (
    select count(*)::integer
    from public.rsvps
    where event_id = coalesce(new.event_id, old.event_id)
      and status = 'going'
  )
  where id = coalesce(new.event_id, old.event_id);

  return coalesce(new, old);
end;
$$;

create or replace function public.sync_community_member_count()
returns trigger
language plpgsql
as $$
begin
  update public.communities
  set member_count = (
    select count(*)::integer
    from public.community_memberships
    where community_id = coalesce(new.community_id, old.community_id)
  )
  where id = coalesce(new.community_id, old.community_id);

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_sync_event_attendees on public.rsvps;
create trigger trg_sync_event_attendees
after insert or update or delete on public.rsvps
for each row execute function public.sync_event_attendees();

drop trigger if exists trg_sync_community_member_count on public.community_memberships;
create trigger trg_sync_community_member_count
after insert or update or delete on public.community_memberships
for each row execute function public.sync_community_member_count();

alter table public.profiles enable row level security;
alter table public.communities enable row level security;
alter table public.events enable row level security;
alter table public.community_memberships enable row level security;
alter table public.saved_events enable row level security;
alter table public.rsvps enable row level security;

drop policy if exists "profiles are publicly readable" on public.profiles;
create policy "profiles are publicly readable"
  on public.profiles for select
  using (true);

drop policy if exists "users manage own profile" on public.profiles;
create policy "users manage own profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "communities are publicly readable" on public.communities;
create policy "communities are publicly readable"
  on public.communities for select
  using (true);

drop policy if exists "organizers manage communities" on public.communities;
create policy "organizers manage communities"
  on public.communities for all
  using (auth.uid() = any(organizer_ids))
  with check (auth.uid() = any(organizer_ids));

drop policy if exists "published events are readable" on public.events;
create policy "published events are readable"
  on public.events for select
  using (status = 'published' or auth.uid() = created_by);

drop policy if exists "creators manage events" on public.events;
create policy "creators manage events"
  on public.events for all
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

drop policy if exists "users read own memberships" on public.community_memberships;
create policy "users read own memberships"
  on public.community_memberships for select
  using (auth.uid() = user_id);

drop policy if exists "users manage own memberships" on public.community_memberships;
create policy "users manage own memberships"
  on public.community_memberships for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "users read own saved events" on public.saved_events;
create policy "users read own saved events"
  on public.saved_events for select
  using (auth.uid() = user_id);

drop policy if exists "users manage own saved events" on public.saved_events;
create policy "users manage own saved events"
  on public.saved_events for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "users read own rsvps" on public.rsvps;
create policy "users read own rsvps"
  on public.rsvps for select
  using (auth.uid() = user_id);

drop policy if exists "users manage own rsvps" on public.rsvps;
create policy "users manage own rsvps"
  on public.rsvps for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values
  ('event-images', 'event-images', true),
  ('community-covers', 'community-covers', true),
  ('avatars', 'avatars', true)
on conflict (id) do nothing;
