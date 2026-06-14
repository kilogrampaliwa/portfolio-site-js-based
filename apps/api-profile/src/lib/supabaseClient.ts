import { createClient } from "@supabase/supabase-js";
import type { Database } from "@portfolio/shared-types/profile";

/**
 * Server-side Supabase client for the profile/CV "brain", authenticated as
 * `service_role` (bypasses RLS). Never import this from `apps/web`.
 *
 * The defaults are the well-known Supabase local-dev URL/service_role JWT
 * (see `supabase/profile/README.md`) — not secrets, identical for every
 * `supabase start` using default config. Override via env for hosted use.
 */
const SUPABASE_URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:54321";
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
