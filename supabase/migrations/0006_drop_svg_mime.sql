-- 0006_drop_svg_mime.sql
--
-- Security fix: remove image/svg+xml from the site-assets bucket MIME
-- allowlist. SVG files served from a public-read bucket with
-- Content-Type: image/svg+xml can execute embedded <script> tags in the
-- requester's origin. With Next's <Image unoptimized /> serving the bytes
-- as-is on tenant subdomains, this would be a stored XSS vector.
--
-- The code-side guard (src/lib/storage.ts ALLOWED_MIME) is removed in the
-- same PR. This migration mirrors that change on the Supabase Storage
-- bucket so any direct-to-Storage upload attempts (e.g. via a leaked
-- signed URL) are rejected at the platform layer.
--
-- Idempotent: it's a straight UPDATE on the buckets row, safe to re-run.

update storage.buckets
set allowed_mime_types = array[
  'image/jpeg',
  'image/png',
  'image/webp'
]
where id = 'site-assets';
