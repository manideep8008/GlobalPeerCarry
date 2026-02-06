-- Report enums
create type report_status as enum ('pending', 'reviewing', 'resolved', 'dismissed');
create type report_reason as enum (
  'inappropriate_behavior',
  'fraud_or_scam',
  'prohibited_items',
  'harassment',
  'fake_identity',
  'no_show',
  'other'
);

-- Reports table
create table public.reports (
  id uuid default uuid_generate_v4() primary key,
  reporter_id uuid references public.profiles(id) on delete cascade not null,
  reported_user_id uuid references public.profiles(id) on delete cascade not null,
  parcel_id uuid references public.parcels(id) on delete set null,
  reason report_reason not null,
  description text not null,
  status report_status not null default 'pending',
  admin_notes text default '',
  resolved_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.reports enable row level security;

create policy "Users can view own reports"
  on public.reports for select
  using (auth.uid() = reporter_id);

create policy "Admins can view all reports"
  on public.reports for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Users can create reports"
  on public.reports for insert
  with check (auth.uid() = reporter_id and reporter_id != reported_user_id);

create policy "Admins can update reports"
  on public.reports for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Indexes
create index reports_reported_user_id_idx on public.reports (reported_user_id);
create index reports_reporter_id_idx on public.reports (reporter_id);
create index reports_status_idx on public.reports (status);

-- Updated_at trigger
create trigger reports_updated_at
  before update on public.reports
  for each row execute function public.update_updated_at();
