-- Fixes from the Supabase database advisor.
-- 1. Pin the trigger function's search_path.
-- 2. Evaluate auth.uid() once per query in policies, not once per row.

alter function public.touch_updated_at() set search_path = '';

drop policy "Users read their own subscription" on public.subscriptions;
create policy "Users read their own subscription" on public.subscriptions
  for select using ((select auth.uid()) = user_id);

drop policy "Users read their own brands" on public.brands;
drop policy "Users create brands within their plan" on public.brands;
drop policy "Users update their own brands" on public.brands;
drop policy "Users delete their own brands" on public.brands;
create policy "Users read their own brands" on public.brands
  for select using ((select auth.uid()) = user_id);
create policy "Users create brands within their plan" on public.brands
  for insert with check ((select auth.uid()) = user_id and (select public.can_create_brand()));
create policy "Users update their own brands" on public.brands
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users delete their own brands" on public.brands
  for delete using ((select auth.uid()) = user_id);

drop policy "Users read their own checks" on public.checks;
drop policy "Users create their own checks" on public.checks;
drop policy "Users delete their own checks" on public.checks;
create policy "Users read their own checks" on public.checks
  for select using ((select auth.uid()) = user_id);
create policy "Users create their own checks" on public.checks
  for insert with check ((select auth.uid()) = user_id);
create policy "Users delete their own checks" on public.checks
  for delete using ((select auth.uid()) = user_id);
