import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import type { Database } from "./database";

/**
 * Integration tests against a local Supabase instance for the site brain
 * (`supabase/site`). Run `supabase start --workdir supabase/site` first (see
 * `supabase/site/README.md`), then `pnpm test:db:site`.
 *
 * The URL/keys below are the well-known Supabase local-dev defaults (derived
 * from the fixed local `JWT_SECRET`) — not secrets, and the same for every
 * `supabase start` using default config. Override via env vars if needed.
 */
const SUPABASE_URL = process.env.SUPABASE_SITE_URL ?? "http://127.0.0.1:54331";
const ANON_KEY =
  process.env.SUPABASE_SITE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SITE_SERVICE_ROLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const anon = createClient<Database>(SUPABASE_URL, ANON_KEY);
const serviceRole = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY);

describe("site brain RLS", () => {
  describe("projects", () => {
    it("anon can read published projects only", async () => {
      const { data, error } = await anon.from("projects").select("*");
      expect(error).toBeNull();
      expect(data?.length).toBeGreaterThan(0);
      expect(data?.every((row) => row.published_at !== null)).toBe(true);
      expect(data?.some((row) => row.slug === "experimental-ai-tool")).toBe(false);
    });

    it("anon cannot write", async () => {
      const { error } = await anon
        .from("projects")
        // @ts-expect-error -- intentionally invalid write payload; only the rejection matters
        .update({ updated_at: new Date().toISOString() })
        .neq("id", "");
      expect(error).not.toBeNull();
    });

    it("service_role can read unpublished projects and write", async () => {
      const { data, error } = await serviceRole.from("projects").select("*");
      expect(error).toBeNull();
      expect(data?.some((row) => row.slug === "experimental-ai-tool")).toBe(true);

      const { error: writeError } = await serviceRole
        .from("projects")
        .update({ updated_at: new Date().toISOString() })
        .eq("slug", "experimental-ai-tool");
      expect(writeError).toBeNull();
    });
  });

  describe("posts", () => {
    it("anon can read published posts only", async () => {
      const { data, error } = await anon.from("posts").select("*");
      expect(error).toBeNull();
      expect(data?.length).toBeGreaterThan(0);
      expect(data?.every((row) => row.published_at !== null)).toBe(true);
      expect(data?.some((row) => row.slug === "draft-post-in-progress")).toBe(false);
    });

    it("anon cannot write", async () => {
      const { error } = await anon
        .from("posts")
        // @ts-expect-error -- intentionally invalid write payload; only the rejection matters
        .update({ updated_at: new Date().toISOString() })
        .neq("id", "");
      expect(error).not.toBeNull();
    });

    it("service_role can read drafts and write", async () => {
      const { data, error } = await serviceRole.from("posts").select("*");
      expect(error).toBeNull();
      expect(data?.some((row) => row.slug === "draft-post-in-progress")).toBe(true);

      const { error: writeError } = await serviceRole
        .from("posts")
        .update({ updated_at: new Date().toISOString() })
        .eq("slug", "draft-post-in-progress");
      expect(writeError).toBeNull();
    });
  });
});
