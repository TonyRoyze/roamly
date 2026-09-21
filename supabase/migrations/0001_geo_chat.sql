create extension if not exists postgis with schema extensions;
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  handle text unique not null,
  avatar_url text,
  bio text,
  interests text[] not null default '{}',
  is_online boolean not null default false,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  place text not null,
  country text,
  start_date date not null,
  end_date date not null,
  destination extensions.geography(point, 4326),
  created_at timestamptz not null default now(),
  constraint trips_dates_valid check (end_date >= start_date)
);

create table public.locations (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  point extensions.geography(point, 4326) not null,
  accuracy real,
  heading real,
  speed real,
  updated_at timestamptz not null default now()
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (conversation_id, profile_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null constraint messages_content_length check (char_length(content) between 1 and 4000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index locations_point_gix on public.locations using gist (point);
create index trips_destination_gix on public.trips using gist (destination);
create index trips_profile_id_idx on public.trips (profile_id);
create index conversation_participants_profile_id_idx on public.conversation_participants (profile_id);
create index messages_conversation_created_idx on public.messages (conversation_id, created_at);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  generated_username text;
begin
  generated_username := coalesce(
    nullif(regexp_replace(lower(new.raw_user_meta_data ->> 'username'), '[^a-z0-9_]', '', 'g'), ''),
    'user_' || substr(new.id::text, 1, 8)
  );

  insert into public.profiles (id, username, display_name, handle)
  values (
    new.id,
    generated_username,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'Traveler'),
    '@' || generated_username
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_conversation_participant(
  target_conversation_id uuid,
  target_profile_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversation_participants
    where conversation_id = target_conversation_id
      and profile_id = target_profile_id
  );
$$;

revoke all on function public.is_conversation_participant(uuid, uuid) from public;
grant execute on function public.is_conversation_participant(uuid, uuid) to authenticated;

create or replace function public.nearby_travelers(
  lat double precision,
  lng double precision,
  radius_meters double precision default 25000
)
returns table (
  id uuid,
  username text,
  display_name text,
  handle text,
  avatar_url text,
  bio text,
  interests text[],
  is_online boolean,
  last_seen_at timestamptz,
  distance_meters double precision,
  location_updated_at timestamptz
)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select
    p.id,
    p.username,
    p.display_name,
    p.handle,
    p.avatar_url,
    p.bio,
    p.interests,
    p.is_online,
    p.last_seen_at,
    st_distance(
      l.point,
      st_setsrid(st_makepoint(lng, lat), 4326)::extensions.geography
    ) as distance_meters,
    l.updated_at as location_updated_at
  from public.profiles as p
  join public.locations as l on l.profile_id = p.id
  where auth.uid() is not null
    and p.id <> auth.uid()
    and l.updated_at > now() - interval '5 minutes'
    and st_dwithin(
      l.point,
      st_setsrid(st_makepoint(lng, lat), 4326)::extensions.geography,
      least(greatest(radius_meters, 100), 50000)
    )
  order by distance_meters asc;
$$;

revoke all on function public.nearby_travelers(double precision, double precision, double precision) from public;
grant execute on function public.nearby_travelers(double precision, double precision, double precision) to authenticated;

create or replace function public.start_direct_conversation(other_profile_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_profile_id uuid := auth.uid();
  conversation_id uuid;
begin
  if current_profile_id is null then
    raise exception 'Authentication required';
  end if;

  if other_profile_id = current_profile_id then
    raise exception 'You cannot start a conversation with yourself';
  end if;

  if not exists (select 1 from public.profiles where id = other_profile_id) then
    raise exception 'Traveler not found';
  end if;

  select mine.conversation_id
    into conversation_id
  from public.conversation_participants as mine
  join public.conversation_participants as theirs
    on theirs.conversation_id = mine.conversation_id
    and theirs.profile_id = other_profile_id
  where mine.profile_id = current_profile_id
    and (select count(*) from public.conversation_participants as members where members.conversation_id = mine.conversation_id) = 2
  limit 1;

  if conversation_id is not null then
    return conversation_id;
  end if;

  insert into public.conversations default values
    returning id into conversation_id;

  insert into public.conversation_participants (conversation_id, profile_id)
  values
    (conversation_id, current_profile_id),
    (conversation_id, other_profile_id);

  return conversation_id;
end;
$$;

revoke all on function public.start_direct_conversation(uuid) from public;
grant execute on function public.start_direct_conversation(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.locations enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;

create policy "authenticated users can view profiles"
  on public.profiles for select to authenticated using (true);

create policy "users update their own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "authenticated users can view trips"
  on public.trips for select to authenticated using (true);

create policy "users manage their own trips"
  on public.trips for all to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "users can read their own location"
  on public.locations for select to authenticated
  using (auth.uid() = profile_id);

create policy "users insert their own location"
  on public.locations for insert to authenticated
  with check (auth.uid() = profile_id);

create policy "users update their own location"
  on public.locations for update to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "users delete their own location"
  on public.locations for delete to authenticated
  using (auth.uid() = profile_id);

create policy "conversations visible to participants"
  on public.conversations for select to authenticated
  using (public.is_conversation_participant(id));

create policy "membership visible to participants"
  on public.conversation_participants for select to authenticated
  using (public.is_conversation_participant(conversation_id));

create policy "messages visible to participants"
  on public.messages for select to authenticated
  using (public.is_conversation_participant(conversation_id));

create policy "participants can send their own messages"
  on public.messages for insert to authenticated
  with check (
    auth.uid() = sender_id
    and public.is_conversation_participant(conversation_id)
  );

create policy "participants can mark messages read"
  on public.messages for update to authenticated
  using (
    auth.uid() <> sender_id
    and public.is_conversation_participant(conversation_id)
  )
  with check (
    auth.uid() <> sender_id
    and public.is_conversation_participant(conversation_id)
  );

alter publication supabase_realtime add table public.profiles;

alter publication supabase_realtime add table public.messages;
