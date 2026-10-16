-- BrandEchoAI initial schema: plans, brand profiles and checks.
-- Every table is row-level secured to its owner. Plan limits are enforced in
-- the database so they hold even if someone calls the API directly.

-- ---------------------------------------------------------------------------
-- Plans
-- ---------------------------------------------------------------------------

create table public.plans (
  id text primary key,
  name text not null,
  price_cents integer not null,
  monthly_checks integer,          -- null = unlimited
  max_brands integer,              -- null = unlimited
  sort_order integer not null default 0
);

insert into public.plans (id, name, price_cents, monthly_checks, max_brands, sort_order) values
  ('free',         'Free',         0,    10,   1,    0),
  ('starter',      'Starter',      1900, 100,  1,    1),
  ('professional', 'Professional', 4900, null, null, 2);

alter table public.plans enable row level security;
create policy "Plans are readable by everyone" on public.plans for select using (true);

-- One row per user. Written only by the server (service role) — for example by
-- the billing provider's webhook — never by the browser.
create table public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan_id text not null default 'free' references public.plans (id),
  status text not null default 'active',            -- active | trialing | past_due | canceled
  provider text,                                    -- e.g. 'dodo'
  provider_customer_id text,
  provider_subscription_id text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;
create policy "Users read their own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);

-- Every new account starts on the free plan.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.subscriptions (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- The plan a user is effectively on (paid plans fall back to free unless active).
create function public.current_plan(uid uuid)
returns public.plans
language sql
stable
security definer
set search_path = public
as $$
  select p.*
  from public.plans p
  where p.id = coalesce(
    (select s.plan_id from public.subscriptions s
      where s.user_id = uid and s.status in ('active', 'trialing')),
    'free'
  );
$$;

-- ---------------------------------------------------------------------------
-- Brand profiles
-- ---------------------------------------------------------------------------

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  summary text not null default '',                 -- one-paragraph voice description
  attributes jsonb not null default '[]'::jsonb,    -- [{label, value}] e.g. Tone: Confident
  preferred_terms text[] not null default '{}',
  banned_terms text[] not null default '{}',
  rules text[] not null default '{}',               -- do / don't statements
  example_copy text not null default '',
  guidelines_text text not null default '',         -- raw source text, if pasted or extracted
  house_standard integer not null default 90 check (house_standard between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index brands_user_id_idx on public.brands (user_id, created_at desc);

-- True while the calling user is under their plan's brand limit.
create function public.can_create_brand()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select (select max_brands from public.current_plan(auth.uid())) is null
      or (select count(*) from public.brands where user_id = auth.uid())
         < (select max_brands from public.current_plan(auth.uid()));
$$;

alter table public.brands enable row level security;
create policy "Users read their own brands" on public.brands
  for select using (auth.uid() = user_id);
create policy "Users create brands within their plan" on public.brands
  for insert with check (auth.uid() = user_id and public.can_create_brand());
create policy "Users update their own brands" on public.brands
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete their own brands" on public.brands
  for delete using (auth.uid() = user_id);

create function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger brands_touch_updated_at
  before update on public.brands
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Checks
-- ---------------------------------------------------------------------------

-- Created by the server after the AI run, using the caller's own session.
-- Inserting rows by hand would only add to the caller's own usage count.
create table public.checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  brand_id uuid references public.brands (id) on delete set null,
  brand_name text not null,                          -- kept if the brand is deleted
  channel text not null default 'other',
  title text not null default '',
  draft text not null,
  score integer not null check (score between 0 and 100),
  verdict text not null default '',
  issues jsonb not null default '[]'::jsonb,         -- [{quote, category, note, suggestion}]
  rewrite text not null default '',
  model text not null,
  created_at timestamptz not null default now()
);

create index checks_user_id_idx on public.checks (user_id, created_at desc);
create index checks_brand_id_idx on public.checks (brand_id, created_at desc);

alter table public.checks enable row level security;
create policy "Users read their own checks" on public.checks
  for select using (auth.uid() = user_id);
create policy "Users create their own checks" on public.checks
  for insert with check (auth.uid() = user_id);
create policy "Users delete their own checks" on public.checks
  for delete using (auth.uid() = user_id);

-- Checks used in the current calendar month (UTC) and the plan's allowance.
create function public.usage_this_month(uid uuid)
returns table (used integer, allowance integer, plan_id text)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*)::integer from public.checks
      where user_id = uid and created_at >= date_trunc('month', now())),
    (select monthly_checks from public.current_plan(uid)),
    (select id from public.current_plan(uid));
$$;

-- Functions are executable by PUBLIC by default. Lock the per-user helpers
-- down so callers can only ask about themselves.
revoke execute on function public.current_plan(uuid) from public, anon, authenticated;
revoke execute on function public.usage_this_month(uuid) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.can_create_brand() from public, anon;
grant execute on function public.can_create_brand() to authenticated;

create function public.my_usage()
returns table (used integer, allowance integer, plan_id text)
language sql
stable
security definer
set search_path = public
as $$
  select * from public.usage_this_month(auth.uid());
$$;

revoke execute on function public.my_usage() from public, anon;
grant execute on function public.my_usage() to authenticated;
