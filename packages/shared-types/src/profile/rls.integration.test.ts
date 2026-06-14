import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import type { Database } from "./database";

/**
 * Integration tests against a local Supabase instance for the profile/CV
 * brain (`supabase/profile`). Run `supabase start --workdir supabase/profile`
 * first (see `supabase/profile/README.md`), then `pnpm test:db:profile`.
 *
 * The URL/keys below are the well-known Supabase local-dev defaults (derived
 * from the fixed local `JWT_SECRET`) — not secrets, and the same for every
 * `supabase start` using default config. Override via env vars if needed.
 */
const SUPABASE_URL = process.env.SUPABASE_PROFILE_URL ?? "http://127.0.0.1:54321";
const ANON_KEY =
  process.env.SUPABASE_PROFILE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_PROFILE_SERVICE_ROLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const anon = createClient<Database>(SUPABASE_URL, ANON_KEY);
const serviceRole = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY);

const CONTENT_TABLES = [
  "profile",
  "experience",
  "education",
  "certificates",
  "skills",
  "languages",
] as const;

describe("profile brain RLS", () => {
  describe.each(CONTENT_TABLES)("%s", (table) => {
    it("anon can read", async () => {
      const { data, error } = await anon.from(table).select("*");
      expect(error).toBeNull();
      expect(data?.length).toBeGreaterThan(0);
    });

    it("anon cannot write", async () => {
      const { error } = await anon
        .from(table)
        // @ts-expect-error -- intentionally invalid write payload; only the rejection matters
        .update({ updated_at: new Date().toISOString() })
        .neq("id", "");
      expect(error).not.toBeNull();
    });

    it("service_role can read and write", async () => {
      const { error: readError, data } = await serviceRole.from(table).select("*");
      expect(readError).toBeNull();
      expect(data?.length).toBeGreaterThan(0);
    });
  });

  it("anon has zero access to api_keys", async () => {
    const { data, error } = await anon.from("api_keys").select("*");
    expect(error).not.toBeNull();
    expect(data).toBeNull();
  });

  it("service_role has full access to api_keys", async () => {
    const { data, error } = await serviceRole.from("api_keys").select("*");
    expect(error).toBeNull();
    expect(data?.length).toBeGreaterThan(0);
    expect(data?.[0]?.client_name).toBe("web");
  });
});
