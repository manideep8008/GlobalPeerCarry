-- User blocks table
create table public.user_blocks (
  id uuid default uuid_generate_v4() primary key,
  blocker_id uuid references public.profiles(id) on delete cascade not null,
  blocked_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  constraint user_blocks_no_self_block check (blocker_id != blocked_id)
);

-- RLS
alter table public.user_blocks enable row level security;

create policy "Users can view own blocks"
  on public.user_blocks for select
  using (auth.uid() = blocker_id);

create policy "Users can block others"
  on public.user_blocks for insert
  with check (auth.uid() = blocker_id);

create policy "Users can unblock"
  on public.user_blocks for delete
  using (auth.uid() = blocker_id);

create policy "Admins can view all blocks"
  on public.user_blocks for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Indexes
create unique index user_blocks_unique_idx on public.user_blocks (blocker_id, blocked_id);
create index user_blocks_blocker_id_idx on public.user_blocks (blocker_id);
create index user_blocks_blocked_id_idx on public.user_blocks (blocked_id);
