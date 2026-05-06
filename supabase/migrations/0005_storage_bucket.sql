-- =============================================================================
-- Apex Sites — site-assets Storage bucket
-- =============================================================================
-- Run after 0004_site_content.sql in the Supabase SQL editor (Project → SQL
-- Editor → New query → paste → Run).
--
-- Creates a public-read bucket where customer logos, hero images, and
-- gallery photos live. Path scheme:
--
--   site-assets/{site_id}/{kind}/{uuid}-{filename}
--     where kind ∈ ("logo", "hero", "gallery")
--
-- Why public-read: every uploaded asset shows on a customer's tenant
-- subdomain (a public website). Hiding them behind signed URLs would mean
-- minting a new URL on every render. Public read keeps SSR cheap.
--
-- Writes go through `storage.objects` policies — service-role bypasses
-- RLS, so the server endpoint at /api/upload/sign mints signed upload
-- URLs the browser can PUT to without ever holding the service-role key.
-- =============================================================================

-- Bucket: 10MB max per file, image MIME types only.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
) values (
  'site-assets',
  'site-assets',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read policy on the bucket. Anon and authenticated roles both
-- pass; service role bypasses RLS as always.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'site-assets public read'
  ) then
    create policy "site-assets public read"
      on storage.objects for select
      using (bucket_id = 'site-assets');
  end if;
end $$;

-- No insert/update/delete policies = anon & authenticated denied. Only
-- the service-role key (used by the Next.js server) can write. Browsers
-- write via signed upload URLs minted server-side; those carry their own
-- one-shot auth and don't go through these policies.
