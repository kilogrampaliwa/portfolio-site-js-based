import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "./app";

/**
 * Integration tests against a local Supabase instance for the profile/CV
 * brain (`supabase/profile`). Run `supabase start --workdir supabase/profile`
 * first (see `supabase/profile/README.md`), then `pnpm --filter
 * @portfolio/api-profile test` (or root `pnpm test`).
 *
 * The keys below are from `supabase/profile/supabase/seed.sql` — local-dev
 * fixtures only, not secrets.
 */
const VALID_API_KEY =
  process.env.PROFILE_API_KEY ?? "a456fb3913986e5dd8970c52013d2602bd222a2fbf23c05a27891d11def215db";
const REVOKED_API_KEY =
  process.env.PROFILE_REVOKED_API_KEY ?? "5f5e165b5e600e7302a6ef4997d3ebc0195e57593e45505157af4a545570d873";

let app: FastifyInstance;

beforeAll(async () => {
  process.env.ALLOWED_ORIGINS ??= "http://localhost:3000";
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe("GET /health", () => {
  it("works without an API key", async () => {
    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
  });
});

describe("API key authentication", () => {
  it("rejects a request with no X-API-Key header", async () => {
    const response = await app.inject({ method: "GET", url: "/profile" });

    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe("unauthorized");
  });

  it("rejects a request with a garbage X-API-Key header", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/profile",
      headers: { "x-api-key": "not-a-real-key" },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe("unauthorized");
  });

  it("rejects a request with a revoked API key", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/profile",
      headers: { "x-api-key": REVOKED_API_KEY },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe("unauthorized");
  });
});

describe("GET /profile", () => {
  it("returns the profile in English by default", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/profile",
      headers: { "x-api-key": VALID_API_KEY },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.fullName).toBe("Jane Doe");
    expect(body.tagline).toBe("Full-Stack Software Engineer");
    expect(body.email).toBe("jane.doe@example.com");
  });

  it("resolves ?locale=pl", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/profile?locale=pl",
      headers: { "x-api-key": VALID_API_KEY },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().tagline).toBe("Inżynier Full-Stack");
  });

  it("rejects an invalid ?locale=", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/profile?locale=fr",
      headers: { "x-api-key": VALID_API_KEY },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe("bad_request");
  });
});

describe("GET /experience", () => {
  it("returns experience ordered by order_index", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/experience",
      headers: { "x-api-key": VALID_API_KEY },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(body[0].company).toBe("Acme Corp");
    expect(body[0].orderIndex).toBe(0);
  });

  it("resolves ?locale=pl", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/experience?locale=pl",
      headers: { "x-api-key": VALID_API_KEY },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()[0].description).toContain("Prowadzenie rozwoju portalu");
  });
});

describe("GET /education", () => {
  it("returns education ordered by order_index", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/education",
      headers: { "x-api-key": VALID_API_KEY },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.length).toBeGreaterThan(0);
    expect(body[0].institution).toBe("University of Technology");
    expect(body[0].degree).toBe("MSc");
  });
});

describe("GET /certificates", () => {
  it("returns certificates ordered by order_index", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/certificates",
      headers: { "x-api-key": VALID_API_KEY },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.length).toBeGreaterThan(0);
    expect(body[0].issuer).toBe("Amazon Web Services");
  });
});

describe("GET /skills", () => {
  it("returns skills ordered by order_index", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/skills",
      headers: { "x-api-key": VALID_API_KEY },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.length).toBeGreaterThan(0);
    expect(body[0].name).toBe("TypeScript");
    expect(body[0].keywords).toContain("typescript");
  });
});

describe("GET /languages", () => {
  it("returns languages ordered by order_index, resolving locale", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/languages",
      headers: { "x-api-key": VALID_API_KEY },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.length).toBeGreaterThan(0);
    expect(body[0].name).toBe("English");
    expect(body[0].fluency).toBe("Fluent (C1)");
  });
});

describe("GET /resume", () => {
  it("returns the combined aggregate of every other endpoint", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/resume",
      headers: { "x-api-key": VALID_API_KEY },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.profile.fullName).toBe("Jane Doe");
    expect(body.experience.length).toBeGreaterThan(0);
    expect(body.education.length).toBeGreaterThan(0);
    expect(body.certificates.length).toBeGreaterThan(0);
    expect(body.skills.length).toBeGreaterThan(0);
    expect(body.languages.length).toBeGreaterThan(0);
  });
});

describe("CORS", () => {
  it("allows a listed origin", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
      headers: { origin: "http://localhost:3000" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
  });

  it("rejects an unlisted origin", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
      headers: { origin: "http://evil.example.com" },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe("forbidden");
  });
});
