-- Demo requests from the public /demo form. Anyone can submit; nobody can
-- read them through the API (view them in the Supabase dashboard).

create table public.demo_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254 and email like '%_@_%._%'),
  company text not null default '' check (char_length(company) <= 160),
  team_size text not null default '' check (team_size in ('', '1-5', '6-20', '21-100', '100+')),
  message text not null default '' check (char_length(message) <= 2000),
  user_id uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.demo_requests enable row level security;

create policy "Anyone can request a demo" on public.demo_requests
  for insert to anon, authenticated
  with check (user_id is null or user_id = (select auth.uid()));

create index demo_requests_created_at_idx on public.demo_requests (created_at desc);
