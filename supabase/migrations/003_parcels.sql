create type parcel_status as enum ('pending', 'accepted', 'in_transit', 'delivered', 'cancelled');
create type escrow_status as enum ('awaiting_payment', 'held', 'released', 'refunded');

create table public.parcels (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  trip_id uuid references public.trips(id) on delete cascade not null,
  carrier_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text default '',
  weight_kg numeric(6,2) not null check (weight_kg > 0),
  status parcel_status not null default 'pending',
  escrow_status escrow_status not null default 'awaiting_payment',
  verification_pin text,
  total_price numeric(10,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.parcels enable row level security;

create policy "Involved parties can view parcels"
  on public.parcels for select
  using (auth.uid() = sender_id or auth.uid() = carrier_id);

create policy "Senders can create parcels"
  on public.parcels for insert
  with check (auth.uid() = sender_id);

create policy "Involved parties can update parcels"
  on public.parcels for update
  using (auth.uid() = sender_id or auth.uid() = carrier_id);

create index parcels_sender_id_idx on public.parcels (sender_id);
create index parcels_trip_id_idx on public.parcels (trip_id);
create index parcels_carrier_id_idx on public.parcels (carrier_id);
create index parcels_status_idx on public.parcels (status);

create trigger parcels_updated_at
  before update on public.parcels
  for each row execute function public.update_updated_at();
