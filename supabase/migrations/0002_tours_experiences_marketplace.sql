set search_path = public, extensions;

create type public.user_type as enum (
  'traveler',
  'local_guide',
  'travel_business'
);

create type public.provider_type as enum (
  'local_guide',
  'travel_business'
);

create type public.listing_type as enum (
  'tour',
  'experience'
);

create type public.listing_status as enum (
  'draft',
  'published',
  'paused',
  'archived'
);

create type public.availability_status as enum (
  'available',
  'cancelled'
);

create type public.booking_status as enum (
  'pending',
  'confirmed',
  'declined',
  'cancelled',
  'completed'
);

alter table public.profiles
  add column user_type public.user_type not null default 'traveler';

create table public.provider_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles(id) on delete cascade,
  provider_type public.provider_type not null,
  display_name text not null constraint provider_display_name_length check (char_length(display_name) between 2 and 120),
  description text,
  logo_url text,
  website_url text,
  contact_email text,
  contact_phone text,
  city text,
  country text,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.provider_profiles(id) on delete cascade,
  listing_type public.listing_type not null,
  status public.listing_status not null default 'draft',
  title text not null constraint listing_title_length check (char_length(title) between 3 and 160),
  summary text not null constraint listing_summary_length check (char_length(summary) between 10 and 500),
  description text not null constraint listing_description_length check (char_length(description) between 20 and 10000),
  city text not null,
  country text not null,
  meeting_point text,
  location geography(point, 4326),
  duration_minutes integer not null constraint listing_duration_positive check (duration_minutes > 0),
  base_price numeric(12, 2) not null constraint listing_price_nonnegative check (base_price >= 0),
  currency text not null default 'USD' constraint listing_currency_iso check (currency ~ '^[A-Z]{3}$'),
  default_capacity integer not null constraint listing_capacity_positive check (default_capacity > 0),
  minimum_age integer constraint listing_minimum_age_valid check (minimum_age between 0 and 120),
  included_items text[] not null default '{}',
  requirements text[] not null default '{}',
  cancellation_policy text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_listing_has_date check (
    status <> 'published' or published_at is not null
  )
);

create table public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  image_url text not null,
  alt_text text,
  position integer not null default 0 constraint listing_image_position_nonnegative check (position >= 0),
  created_at timestamptz not null default now(),
  unique (listing_id, position)
);

create table public.listing_availability (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity integer not null constraint availability_capacity_positive check (capacity > 0),
  price_override numeric(12, 2) constraint availability_price_nonnegative check (price_override is null or price_override >= 0),
  status public.availability_status not null default 'available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint availability_dates_valid check (ends_at > starts_at),
  unique (listing_id, starts_at)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete restrict,
  availability_id uuid not null references public.listing_availability(id) on delete restrict,
  traveler_id uuid not null references public.profiles(id) on delete restrict,
  guest_count integer not null constraint booking_guest_count_positive check (guest_count > 0),
  total_amount numeric(12, 2) not null constraint booking_total_nonnegative check (total_amount >= 0),
  currency text not null constraint booking_currency_iso check (currency ~ '^[A-Z]{3}$'),
  status public.booking_status not null default 'pending',
  traveler_note text constraint booking_note_length check (traveler_note is null or char_length(traveler_note) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index provider_profiles_type_idx on public.provider_profiles (provider_type);
create index listings_provider_idx on public.listings (provider_id);
create index listings_public_feed_idx on public.listings (status, listing_type, published_at desc);
create index listings_location_gix on public.listings using gist (location);
create index listing_images_listing_position_idx on public.listing_images (listing_id, position);
create index listing_availability_listing_start_idx on public.listing_availability (listing_id, starts_at);
create index bookings_traveler_created_idx on public.bookings (traveler_id, created_at desc);
create index bookings_listing_status_idx on public.bookings (listing_id, status);
create index bookings_availability_status_idx on public.bookings (availability_id, status);
create unique index bookings_one_active_selection_idx
  on public.bookings (availability_id, traveler_id)
  where status in ('pending', 'confirmed');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger provider_profiles_set_updated_at
  before update on public.provider_profiles
  for each row execute procedure public.set_updated_at();

create or replace function public.protect_provider_verification()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is not null and new.is_verified is distinct from old.is_verified then
    raise exception 'Provider verification can only be changed by an administrator';
  end if;
  return new;
end;
$$;

create trigger provider_profiles_protect_verification
  before update on public.provider_profiles
  for each row execute procedure public.protect_provider_verification();

create trigger listings_set_updated_at
  before update on public.listings
  for each row execute procedure public.set_updated_at();

create trigger listing_availability_set_updated_at
  before update on public.listing_availability
  for each row execute procedure public.set_updated_at();

create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute procedure public.set_updated_at();

create or replace function public.owns_provider(target_provider_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.provider_profiles
    where id = target_provider_id
      and owner_id = auth.uid()
  );
$$;

revoke all on function public.owns_provider(uuid) from public;
grant execute on function public.owns_provider(uuid) to authenticated;

create or replace function public.owns_listing(target_listing_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.listings as l
    join public.provider_profiles as provider on provider.id = l.provider_id
    where l.id = target_listing_id
      and provider.owner_id = auth.uid()
  );
$$;

revoke all on function public.owns_listing(uuid) from public;
grant execute on function public.owns_listing(uuid) to authenticated;

create or replace function public.book_listing(
  target_availability_id uuid,
  requested_guest_count integer,
  note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_profile_id uuid := auth.uid();
  selected_slot public.listing_availability%rowtype;
  selected_listing public.listings%rowtype;
  already_reserved integer;
  unit_price numeric(12, 2);
  new_booking_id uuid;
begin
  if current_profile_id is null then
    raise exception 'Authentication required';
  end if;

  if requested_guest_count is null or requested_guest_count < 1 then
    raise exception 'Guest count must be at least one';
  end if;

  if note is not null and char_length(note) > 1000 then
    raise exception 'Traveler note cannot exceed 1000 characters';
  end if;

  select *
    into selected_slot
  from public.listing_availability
  where id = target_availability_id
  for update;

  if not found then
    raise exception 'Availability not found';
  end if;

  select *
    into selected_listing
  from public.listings
  where id = selected_slot.listing_id;

  if selected_listing.status <> 'published' then
    raise exception 'This listing is not currently available';
  end if;

  if selected_slot.status <> 'available' or selected_slot.starts_at <= now() then
    raise exception 'This date is no longer available';
  end if;

  if public.owns_provider(selected_listing.provider_id) then
    raise exception 'Providers cannot book their own listing';
  end if;

  select coalesce(sum(guest_count), 0)::integer
    into already_reserved
  from public.bookings
  where availability_id = target_availability_id
    and status in ('pending', 'confirmed');

  if already_reserved + requested_guest_count > selected_slot.capacity then
    raise exception 'Not enough places remain for this date';
  end if;

  unit_price := coalesce(selected_slot.price_override, selected_listing.base_price);

  insert into public.bookings (
    listing_id,
    availability_id,
    traveler_id,
    guest_count,
    total_amount,
    currency,
    traveler_note
  ) values (
    selected_listing.id,
    selected_slot.id,
    current_profile_id,
    requested_guest_count,
    unit_price * requested_guest_count,
    selected_listing.currency,
    nullif(trim(note), '')
  )
  returning id into new_booking_id;

  return new_booking_id;
end;
$$;

revoke all on function public.book_listing(uuid, integer, text) from public;
grant execute on function public.book_listing(uuid, integer, text) to authenticated;

create or replace function public.set_booking_status(
  target_booking_id uuid,
  next_status public.booking_status
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  current_profile_id uuid := auth.uid();
  current_booking public.bookings%rowtype;
  provider_is_owner boolean;
begin
  if current_profile_id is null then
    raise exception 'Authentication required';
  end if;

  select *
    into current_booking
  from public.bookings
  where id = target_booking_id
  for update;

  if not found then
    raise exception 'Booking not found';
  end if;

  provider_is_owner := public.owns_listing(current_booking.listing_id);

  if current_booking.traveler_id = current_profile_id then
    if next_status <> 'cancelled' or current_booking.status not in ('pending', 'confirmed') then
      raise exception 'Travelers can only cancel pending or confirmed bookings';
    end if;
  elsif provider_is_owner then
    if not (
      (current_booking.status = 'pending' and next_status in ('confirmed', 'declined', 'cancelled'))
      or (current_booking.status = 'confirmed' and next_status in ('completed', 'cancelled'))
    ) then
      raise exception 'That provider status change is not allowed';
    end if;
  else
    raise exception 'You cannot update this booking';
  end if;

  update public.bookings
  set status = next_status
  where id = target_booking_id
  returning * into current_booking;

  return current_booking;
end;
$$;

revoke all on function public.set_booking_status(uuid, public.booking_status) from public;
grant execute on function public.set_booking_status(uuid, public.booking_status) to authenticated;

alter table public.provider_profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.listing_availability enable row level security;
alter table public.bookings enable row level security;

create policy "provider profiles are publicly viewable"
  on public.provider_profiles for select to anon, authenticated
  using (true);

create policy "users create their matching provider profile"
  on public.provider_profiles for insert to authenticated
  with check (
    owner_id = auth.uid()
    and exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and user_type::text = provider_type::text
    )
  );

create policy "owners update their provider profile"
  on public.provider_profiles for update to authenticated
  using (owner_id = auth.uid())
  with check (
    owner_id = auth.uid()
    and exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and user_type::text = provider_type::text
    )
  );

create policy "owners delete their provider profile"
  on public.provider_profiles for delete to authenticated
  using (owner_id = auth.uid());

create policy "published listings are publicly viewable"
  on public.listings for select to anon, authenticated
  using (status = 'published');

create policy "providers can view their own listings"
  on public.listings for select to authenticated
  using (public.owns_provider(provider_id));

create policy "providers create listings"
  on public.listings for insert to authenticated
  with check (public.owns_provider(provider_id));

create policy "providers update their listings"
  on public.listings for update to authenticated
  using (public.owns_provider(provider_id))
  with check (public.owns_provider(provider_id));

create policy "providers delete their listings"
  on public.listings for delete to authenticated
  using (public.owns_provider(provider_id));

create policy "published listing images are publicly viewable"
  on public.listing_images for select to anon, authenticated
  using (
    exists (
      select 1
      from public.listings
      where id = listing_id and status = 'published'
    )
  );

create policy "providers can view their own listing images"
  on public.listing_images for select to authenticated
  using (public.owns_listing(listing_id));

create policy "providers add listing images"
  on public.listing_images for insert to authenticated
  with check (public.owns_listing(listing_id));

create policy "providers update listing images"
  on public.listing_images for update to authenticated
  using (public.owns_listing(listing_id))
  with check (public.owns_listing(listing_id));

create policy "providers delete listing images"
  on public.listing_images for delete to authenticated
  using (public.owns_listing(listing_id));

create policy "published listing availability is publicly viewable"
  on public.listing_availability for select to anon, authenticated
  using (
    exists (
      select 1
      from public.listings
      where id = listing_id and status = 'published'
    )
  );

create policy "providers can view their own listing availability"
  on public.listing_availability for select to authenticated
  using (public.owns_listing(listing_id));

create policy "providers add listing availability"
  on public.listing_availability for insert to authenticated
  with check (public.owns_listing(listing_id));

create policy "providers update listing availability"
  on public.listing_availability for update to authenticated
  using (public.owns_listing(listing_id))
  with check (public.owns_listing(listing_id));

create policy "providers delete listing availability"
  on public.listing_availability for delete to authenticated
  using (public.owns_listing(listing_id));

create policy "bookings visible to traveler and provider"
  on public.bookings for select to authenticated
  using (
    traveler_id = auth.uid()
    or public.owns_listing(listing_id)
  );

alter publication supabase_realtime add table public.listings;
alter publication supabase_realtime add table public.listing_availability;
alter publication supabase_realtime add table public.bookings;
