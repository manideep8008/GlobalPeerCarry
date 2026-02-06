-- Reviews table
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  parcel_id uuid references public.parcels(id) on delete cascade not null,
  reviewer_id uuid references public.profiles(id) on delete cascade not null,
  reviewee_id uuid references public.profiles(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text default '',
  created_at timestamptz not null default now()
);

-- RLS
alter table public.reviews enable row level security;

create policy "Reviews are viewable by everyone"
  on public.reviews for select using (true);

create policy "Involved parties can create reviews"
  on public.reviews for insert
  with check (
    auth.uid() = reviewer_id
    and exists (
      select 1 from public.parcels
      where id = parcel_id
        and status = 'delivered'
        and (sender_id = auth.uid() or carrier_id = auth.uid())
    )
  );

-- Prevent duplicate reviews: one review per user per parcel
create unique index reviews_unique_per_parcel_idx
  on public.reviews (parcel_id, reviewer_id);

-- Indexes
create index reviews_reviewee_id_idx on public.reviews (reviewee_id);
create index reviews_reviewer_id_idx on public.reviews (reviewer_id);
create index reviews_parcel_id_idx on public.reviews (parcel_id);
