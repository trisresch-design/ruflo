-- Dienstplan-App schema
-- Run this once against a fresh Supabase project (SQL Editor or `supabase db push`).

-- ─────────────────────────────────────────────────────────────
-- profiles: one row per auth user, carries the app-level role
-- ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role text not null default 'employee' check (role in ('admin', 'employee')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read own or any if admin"
  on public.profiles for select
  using (
    auth.uid() = id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "profiles: admin can update roles"
  on public.profiles for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Auto-create a profile row whenever a new auth user signs up.
-- New users default to 'employee'; promote to 'admin' manually in the table editor.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', new.email));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- shifts: the actual schedule entries
-- ─────────────────────────────────────────────────────────────
create table if not exists public.shifts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  employee_id uuid references public.profiles (id) on delete set null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint shifts_time_order check (ends_at > starts_at)
);

alter table public.shifts enable row level security;

-- Admins see and manage every shift.
create policy "shifts: admin full access"
  on public.shifts for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Employees can only read shifts assigned to them (read-only, per app spec).
create policy "shifts: employee reads own shifts"
  on public.shifts for select
  using (employee_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- Realtime: broadcast inserts/updates/deletes on shifts to all clients
-- ─────────────────────────────────────────────────────────────
alter publication supabase_realtime add table public.shifts;
