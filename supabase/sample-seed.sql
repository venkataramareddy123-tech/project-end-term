do $$
declare
  organizer_id uuid;
  street_id uuid;
  runner_id uuid;
  table_id uuid;
begin
  select id into organizer_id
  from public.profiles
  order by created_at asc
  limit 1;

  if organizer_id is null then
    raise exception 'Create at least one user in the app before running sample-seed.sql';
  end if;

  update public.profiles
  set role = 'organizer'
  where id = organizer_id;

  insert into public.communities (
    slug, name, description, long_description, city, vibe, tags, cover_image, avatar_image,
    featured, organizer_ids, event_ids, member_count
  ) values (
    'street-stories-club',
    'Street Stories Club',
    'Pop-up walks, film nights, and neighborhood storytelling sessions.',
    'Street Stories Club turns overlooked corners of the city into cultural evenings. Expect small-format screenings, guided walks, creative meetups, and intimate conversations with local makers.',
    'Bengaluru',
    'Cultural, walkable, and beautifully local',
    array['Arts', 'Walks', 'Indiranagar'],
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=300&q=80',
    true,
    array[organizer_id],
    array[]::uuid[],
    0
  )
  on conflict (slug) do update set organizer_ids = excluded.organizer_ids
  returning id into street_id;

  insert into public.communities (
    slug, name, description, long_description, city, vibe, tags, cover_image, avatar_image,
    featured, organizer_ids, event_ids, member_count
  ) values (
    'monsoon-runners',
    'Monsoon Runners',
    'Sunrise runs, mobility sessions, and post-run coffee rituals.',
    'Monsoon Runners makes movement feel communal. The group hosts sunrise circuits, mindful cooldowns, and low-pressure fitness gatherings across the city.',
    'Bengaluru',
    'Wellness with a social afterglow',
    array['Wellness', 'Running', 'Cubbon Park'],
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=300&q=80',
    true,
    array[organizer_id],
    array[]::uuid[],
    0
  )
  on conflict (slug) do update set organizer_ids = excluded.organizer_ids
  returning id into runner_id;

  insert into public.communities (
    slug, name, description, long_description, city, vibe, tags, cover_image, avatar_image,
    featured, organizer_ids, event_ids, member_count
  ) values (
    'long-table-society',
    'Long Table Society',
    'Intimate chef pop-ups, supper clubs, and tasting sessions.',
    'Long Table Society champions slow evenings built around food and conversation. Every gathering is designed to feel warm, editorial, and highly shareable without losing intimacy.',
    'Bengaluru',
    'Food-led nights with thoughtful curation',
    array['Food', 'Dining', 'Lavelle Road'],
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=300&q=80',
    false,
    array[organizer_id],
    array[]::uuid[],
    0
  )
  on conflict (slug) do update set organizer_ids = excluded.organizer_ids
  returning id into table_id;

  insert into public.community_memberships (user_id, community_id)
  values
    (organizer_id, street_id),
    (organizer_id, runner_id),
    (organizer_id, table_id)
  on conflict do nothing;

  insert into public.events (
    slug, title, summary, description, category, tags, start_at, end_at, venue, address, city,
    latitude, longitude, cover_image, gallery, price_label, capacity, status, community_id,
    created_by, attendees, trending_score, featured
  ) values
    (
      'indiranagar-night-market',
      'Indiranagar Night Market',
      'An open-air evening of local makers, analog photo booths, and street-food carts.',
      'Wander through a carefully curated night market where independent labels, ceramic artists, vinyl selectors, and neighborhood food stalls take over a lush courtyard.',
      'Arts',
      array['Makers', 'Shopping', 'Free'],
      '2026-04-24T12:30:00.000Z',
      '2026-04-24T17:30:00.000Z',
      'Courtyard 17',
      '100 Feet Road, Indiranagar',
      'Bengaluru',
      12.9719,
      77.6408,
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
      array[
        'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80'
      ],
      'Free',
      400,
      'published',
      street_id,
      organizer_id,
      0,
      98,
      true
    ),
    (
      'cubbon-park-sunrise-run-club',
      'Cubbon Park Sunrise Run Club',
      'A low-pressure 5K with mobility, coffee, and a photographer catching the good moments.',
      'Expect a guided warm-up, an easy-paced run, and a coffee reset under the trees.',
      'Wellness',
      array['5K', 'Coffee', 'Free'],
      '2026-04-26T00:30:00.000Z',
      '2026-04-26T03:00:00.000Z',
      'Bandstand Loop',
      'Cubbon Park West Gate',
      'Bengaluru',
      12.9763,
      77.5929,
      'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80',
      array['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80'],
      'Free',
      120,
      'published',
      runner_id,
      organizer_id,
      0,
      87,
      true
    ),
    (
      'designers-supper-club',
      'Designers'' Supper Club',
      'A long-table dinner for people building in culture, fashion, food, and digital craft.',
      'Part dinner, part salon. Guests move through a chef-curated menu, short table prompts, and a closing lightning conversation.',
      'Food',
      array['Dinner', 'Networking', 'Premium'],
      '2026-04-30T13:00:00.000Z',
      '2026-04-30T16:30:00.000Z',
      'The Glasshouse Atelier',
      'Lavelle Road',
      'Bengaluru',
      12.9712,
      77.5957,
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80',
      array['https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80'],
      'Rs 1800',
      70,
      'published',
      table_id,
      organizer_id,
      0,
      92,
      true
    )
  on conflict (slug) do nothing;
end $$;
