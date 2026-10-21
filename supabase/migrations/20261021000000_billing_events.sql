-- Billing (Dodo Payments): remember the timestamp of the last provider event
-- applied to each subscription, so retried or out-of-order webhooks can't
-- overwrite newer state. Look up rows by the provider's customer id.

alter table public.subscriptions add column provider_event_at timestamptz;

create unique index subscriptions_provider_customer_id_key
  on public.subscriptions (provider, provider_customer_id)
  where provider_customer_id is not null;
