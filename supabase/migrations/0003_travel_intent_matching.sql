set search_path = public, extensions;

create type public.trip_status as enum (
  'planning',
  'confirmed',
  'completed',
  'cancelled'
);

create type public.trip_visibility as enum (
  'public',
  'matches_only',
  'private'
);

create type public.travel_connection_status as enum (
  'pending',
  'accepted',
  'declined',
  'cancelled'
);

alter table public.trips
  add column status public.trip_status not null default 'planning',
  add column visibility public.trip_visibility not null default 'matches_only',
  add column description text constraint trip_description_length check (
    description is null or char_length(description) <= 1000
  ),
  add column flexible_dates boolean not null default false,
  add column interests text[] not null default '{}',
  add column looking_for text[] not null default '{}',
  add column updated_at timestamptz not null default now();

create table public.travel_connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  requester_trip_id uuid not null references public.trips(id) on delete cascade,
  recipient_trip_id uuid not null references public.trips(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  message text constraint travel_connection_message_length check (
    message is null or char_length(message) <= 500
  ),
  status public.travel_connection_status not null default 'pending',
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint travel_connection_different_users check (requester_id <> recipient_id),
  constraint travel_connection_different_trips check (requester_trip_id <> recipient_trip_id)
);

create index trips_match_feed_idx
  on public.trips (status, visibility, start_date, end_date);
create index trips_place_country_idx
  on public.trips (lower(place), lower(country));
create index travel_connections_requester_idx
  on public.travel_connections (requester_id, status, created_at desc);
create index travel_connections_recipient_idx
  on public.travel_connections (recipient_id, status, created_at desc);
create unique index travel_connections_one_pending_pair_idx
  on public.travel_connections (
    least(requester_id, recipient_id),
    greatest(requester_id, recipient_id),
    least(requester_trip_id, recipient_trip_id),
    greatest(requester_trip_id, recipient_trip_id)
  )
  where status = 'pending';

create trigger trips_set_updated_at
  before update on public.trips
  for each row execute procedure public.set_updated_at();

create trigger travel_connections_set_updated_at
  before update on public.travel_connections
  for each row execute procedure public.set_updated_at();

drop policy if exists "trips viewable by everyone" on public.trips;

create policy "visible trips are viewable by authenticated users"
  on public.trips for select to authenticated
  using (
    profile_id = auth.uid()
    or (
      visibility = 'public'
      and status in ('planning', 'confirmed')
    )
  );

create or replace function public.find_travel_matches(
  target_trip_id uuid,
  radius_meters double precision default 50000,
  date_window_days integer default 3
)
returns table (
  profile_id uuid,
  display_name text,
  handle text,
  avatar_url text,
  bio text,
  profile_interests text[],
  trip_id uuid,
  place text,
  country text,
  start_date date,
  end_date date,
  flexible_dates boolean,
  trip_interests text[],
  looking_for text[],
  trip_description text,
  distance_meters double precision,
  shared_interests text[],
  match_score integer
)
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare
  current_profile_id uuid := auth.uid();
  source_trip public.trips%rowtype;
  bounded_radius double precision := least(greatest(radius_meters, 1000), 500000);
  bounded_date_window integer := least(greatest(date_window_days, 0), 30);
begin
  if current_profile_id is null then
    raise exception 'Authentication required';
  end if;

  select *
    into source_trip
  from public.trips
  where id = target_trip_id
    and trips.profile_id = current_profile_id;

  if not found then
    raise exception 'Travel plan not found or does not belong to you';
  end if;

  return query
  with candidates as (
    select
      p.id as candidate_profile_id,
      p.display_name as candidate_display_name,
      p.handle as candidate_handle,
      p.avatar_url as candidate_avatar_url,
      p.bio as candidate_bio,
      p.interests as candidate_profile_interests,
      candidate.id as candidate_trip_id,
      candidate.place as candidate_place,
      candidate.country as candidate_country,
      candidate.start_date as candidate_start_date,
      candidate.end_date as candidate_end_date,
      candidate.flexible_dates as candidate_flexible_dates,
      candidate.interests as candidate_trip_interests,
      candidate.looking_for as candidate_looking_for,
      candidate.description as candidate_description,
      case
        when source_trip.destination is not null and candidate.destination is not null
          then st_distance(source_trip.destination, candidate.destination)
        else null
      end as candidate_distance,
      array(
        select distinct interest
        from unnest(source_trip.interests || p.interests) as interest
        where interest = any(candidate.interests || p.interests)
        order by interest
      ) as candidate_shared_interests,
      (
        case
          when lower(candidate.place) = lower(source_trip.place)
            and lower(coalesce(candidate.country, '')) = lower(coalesce(source_trip.country, '')) then 50
          when source_trip.destination is not null
            and candidate.destination is not null
            and st_dwithin(source_trip.destination, candidate.destination, bounded_radius) then 40
          when lower(coalesce(candidate.country, '')) = lower(coalesce(source_trip.country, '')) then 15
          else 0
        end
        + case
            when candidate.start_date <= source_trip.end_date
              and candidate.end_date >= source_trip.start_date then 30
            else 15
          end
        + least(
            20,
            5 * cardinality(array(
              select distinct interest
              from unnest(source_trip.interests || p.interests) as interest
              where interest = any(candidate.interests || p.interests)
            ))
          )
      )::integer as candidate_score
    from public.trips as candidate
    join public.profiles as p on p.id = candidate.profile_id
    where candidate.profile_id <> current_profile_id
      and candidate.visibility in ('public', 'matches_only')
      and candidate.status in ('planning', 'confirmed')
      and candidate.end_date >= current_date
      and candidate.start_date <= source_trip.end_date + bounded_date_window
      and candidate.end_date >= source_trip.start_date - bounded_date_window
      and (
        (
          source_trip.destination is not null
          and candidate.destination is not null
          and st_dwithin(source_trip.destination, candidate.destination, bounded_radius)
        )
        or (
          lower(candidate.place) = lower(source_trip.place)
          and lower(coalesce(candidate.country, '')) = lower(coalesce(source_trip.country, ''))
        )
      )
  )
  select
    candidate_profile_id,
    candidate_display_name,
    candidate_handle,
    candidate_avatar_url,
    candidate_bio,
    candidate_profile_interests,
    candidate_trip_id,
    candidate_place,
    candidate_country,
    candidate_start_date,
    candidate_end_date,
    candidate_flexible_dates,
    candidate_trip_interests,
    candidate_looking_for,
    candidate_description,
    candidate_distance,
    candidate_shared_interests,
    candidate_score
  from candidates
  order by candidate_score desc, candidate_distance asc nulls last, candidate_start_date asc;
end;
$$;

revoke all on function public.find_travel_matches(uuid, double precision, integer) from public;
grant execute on function public.find_travel_matches(uuid, double precision, integer) to authenticated;

create or replace function public.request_travel_connection(
  source_trip_id uuid,
  target_trip_id uuid,
  connection_message text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_profile_id uuid := auth.uid();
  source_trip public.trips%rowtype;
  target_trip public.trips%rowtype;
  connection_id uuid;
begin
  if current_profile_id is null then
    raise exception 'Authentication required';
  end if;

  if connection_message is not null and char_length(connection_message) > 500 then
    raise exception 'Connection message cannot exceed 500 characters';
  end if;

  select *
    into source_trip
  from public.trips
  where id = source_trip_id
    and profile_id = current_profile_id;

  if not found then
    raise exception 'Your travel plan was not found';
  end if;

  select *
    into target_trip
  from public.trips
  where id = target_trip_id
    and profile_id <> current_profile_id
    and visibility in ('public', 'matches_only')
    and status in ('planning', 'confirmed');

  if not found then
    raise exception 'The matching travel plan is no longer available';
  end if;

  if source_trip.status not in ('planning', 'confirmed') then
    raise exception 'Your travel plan is not active';
  end if;

  if not (
    target_trip.start_date <= source_trip.end_date + 30
    and target_trip.end_date >= source_trip.start_date - 30
  ) then
    raise exception 'These travel dates are too far apart';
  end if;

  if exists (
    select 1
    from public.travel_connections
    where status = 'pending'
      and (
        (requester_trip_id = source_trip.id and recipient_trip_id = target_trip.id)
        or (requester_trip_id = target_trip.id and recipient_trip_id = source_trip.id)
      )
  ) then
    raise exception 'A connection request is already pending for these travel plans';
  end if;

  insert into public.travel_connections (
    requester_id,
    recipient_id,
    requester_trip_id,
    recipient_trip_id,
    message
  ) values (
    current_profile_id,
    target_trip.profile_id,
    source_trip.id,
    target_trip.id,
    nullif(trim(connection_message), '')
  )
  returning id into connection_id;

  return connection_id;
end;
$$;

revoke all on function public.request_travel_connection(uuid, uuid, text) from public;
grant execute on function public.request_travel_connection(uuid, uuid, text) to authenticated;

create or replace function public.set_travel_connection_status(
  target_connection_id uuid,
  next_status public.travel_connection_status
)
returns public.travel_connections
language plpgsql
security definer
set search_path = public
as $$
declare
  current_profile_id uuid := auth.uid();
  connection public.travel_connections%rowtype;
  chat_id uuid;
begin
  if current_profile_id is null then
    raise exception 'Authentication required';
  end if;

  select *
    into connection
  from public.travel_connections
  where id = target_connection_id
  for update;

  if not found then
    raise exception 'Connection request not found';
  end if;

  if connection.status <> 'pending' then
    raise exception 'This connection request has already been resolved';
  end if;

  if current_profile_id = connection.recipient_id then
    if next_status not in ('accepted', 'declined') then
      raise exception 'Recipients can only accept or decline requests';
    end if;
  elsif current_profile_id = connection.requester_id then
    if next_status <> 'cancelled' then
      raise exception 'Requesters can only cancel pending requests';
    end if;
  else
    raise exception 'You cannot update this connection request';
  end if;

  if next_status = 'accepted' then
    chat_id := public.start_direct_conversation(connection.requester_id);
  end if;

  update public.travel_connections
  set
    status = next_status,
    responded_at = now(),
    conversation_id = coalesce(chat_id, conversation_id)
  where id = target_connection_id
  returning * into connection;

  return connection;
end;
$$;

revoke all on function public.set_travel_connection_status(uuid, public.travel_connection_status) from public;
grant execute on function public.set_travel_connection_status(uuid, public.travel_connection_status) to authenticated;

alter table public.travel_connections enable row level security;

create policy "connections visible to both travelers"
  on public.travel_connections for select to authenticated
  using (
    requester_id = auth.uid()
    or recipient_id = auth.uid()
  );

alter publication supabase_realtime add table public.trips;
alter publication supabase_realtime add table public.travel_connections;
