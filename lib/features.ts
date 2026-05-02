// Feature flags. Read at module load — Next.js inlines NEXT_PUBLIC_*
// so this constant works in both server and client components.
//
// Schema (Supabase tables, RLS, country_slug FK on posts) is intentionally
// kept intact when a flag is off — only frontend surfaces are gated, so
// flipping the flag back to "true" restores everything without backfill.

export const COUNTRIES_ENABLED =
  process.env.NEXT_PUBLIC_FEATURE_COUNTRIES === "true"
