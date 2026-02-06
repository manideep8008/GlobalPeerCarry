-- Add admin flag and banned flag to profiles
alter table public.profiles add column is_admin boolean not null default false;
alter table public.profiles add column is_banned boolean not null default false;

-- Allow admins to update any profile (for KYC review, banning)
create policy "Admins can update any profile"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );
