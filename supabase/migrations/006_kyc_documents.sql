-- KYC document review status
create type kyc_review_status as enum ('pending', 'approved', 'rejected');

-- KYC documents table
create table public.kyc_documents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  document_type text not null check (document_type in ('passport', 'national_id', 'drivers_license')),
  document_url text not null,
  review_status kyc_review_status not null default 'pending',
  reviewer_id uuid references public.profiles(id),
  reviewer_notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.kyc_documents enable row level security;

create policy "Users can view own kyc documents"
  on public.kyc_documents for select
  using (auth.uid() = user_id);

create policy "Admins can view all kyc documents"
  on public.kyc_documents for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Users can submit kyc documents"
  on public.kyc_documents for insert
  with check (auth.uid() = user_id);

create policy "Admins can review kyc documents"
  on public.kyc_documents for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Indexes
create index kyc_documents_user_id_idx on public.kyc_documents (user_id);
create index kyc_documents_review_status_idx on public.kyc_documents (review_status);

-- Updated_at trigger
create trigger kyc_documents_updated_at
  before update on public.kyc_documents
  for each row execute function public.update_updated_at();
