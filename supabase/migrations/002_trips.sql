create table public.trips (
  id uuid default uuid_generate_v4() primary key,
  carrier_id uuid references public.profiles(id) on delete cascade not null,
  origin text not null,
  destination text not null,
  travel_date date not null,
  total_weight_kg numeric(6,2) not null check (total_weight_kg > 0),
  available_weight_kg numeric(6,2) not null check (available_weight_kg >= 0),
  price_per_kg numeric(8,2) not null check (price_per_kg > 0),
  notes text default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.trips enable row level security;

create policy "Trips are viewable by everyone"
  on public.trips for select using (true);

create policy "Carriers can create trips"
  on public.trips for insert with check (auth.uid() = carrier_id);

create policy "Carriers can update own trips"
  on public.trips for update using (auth.uid() = carrier_id);

create policy "Carriers can delete own trips"
  on public.trips for delete using (auth.uid() = carrier_id);

-- Indexes for search
create index trips_origin_idx on public.trips (lower(origin));
create index trips_destination_idx on public.trips (lower(destination));
create index trips_travel_date_idx on public.trips (travel_date);
create index trips_carrier_id_idx on public.trips (carrier_id);

create trigger trips_updated_at
  before update on public.trips
  for each row execute function public.update_updated_at();
