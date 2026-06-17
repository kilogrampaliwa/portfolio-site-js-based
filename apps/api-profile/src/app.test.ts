import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "./app";

/**
 * Integration tests against a local Supabase instance for the profile/CV
 * brain (reasume_api schema). Run `supabase start --workdir supabase/profile`
 * first, then `pnpm --filter @portfolio/api-profile test`.
 *
 * The keys below are from the local-dev seed — not production secrets.
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
    const response = await app.inject({ method: "GET", url: "/about" });

    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe("unauthorized");
  });

  it("rejects a request with a garbage X-API-Key header", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/about",
      headers: { "x-api-key": "not-a-real-key" },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe("unauthorized");
  });

  it("rejects a request with a revoked API key", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/about",
      headers: { "x-api-key": REVOKED_API_KEY },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe("unauthorized");
  });
});

describe("GET /about", () => {
  it("returns the about singleton", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/about",
      headers: { "x-api-key": VALID_API_KEY },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(typeof body.bioShort).toBe("string");
    expect(Array.isArray(body.targetRoles)).toBe(true);
  });
});

describe("GET /experience", () => {
  it("returns experience ordered by display_order", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/experience",
      headers: { "x-api-key": VALID_API_KEY },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(typeof body[0].title).toBe("string");
    expect(typeof body[0].company).toBe("string");
    expect(typeof body[0].displayOrder).toBe("number");
  });
});

describe("GET /qualifications", () => {
  it("returns all qualifications by default", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/qualifications",
      headers: { "x-api-key": VALID_API_KEY },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.length).toBeGreaterThan(0);
    expect(typeof body[0].title).toBe("string");
    expect(typeof body[0].issuer).toBe("string");
    expect(["degree", "certification", "course"]).toContain(body[0].type);
  });

  it("filters by ?type=degree", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/qualifications?type=degree",
      headers: { "x-api-key": VALID_API_KEY },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.every((q: { type: string }) => q.type === "degree")).toBe(true);
  });

  it("filters by ?type=certification,course", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/qualifications?type=certification,course",
      headers: { "x-api-key": VALID_API_KEY },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.every((q: { type: string }) => ["certification", "course"].includes(q.type))).toBe(true);
  });
});

describe("GET /skills", () => {
  it("returns all skills ordered by display_order", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/skills",
      headers: { "x-api-key": VALID_API_KEY },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.length).toBeGreaterThan(0);
    expect(typeof body[0].name).toBe("string");
    expect(typeof body[0].category).toBe("string");
  });

  it("filters by ?category=languages", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/skills?category=languages",
      headers: { "x-api-key": VALID_API_KEY },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.every((s: { category: string }) => s.category === "languages")).toBe(true);
  });
});

describe("GET /projects", () => {
  it("returns projects ordered by display_order", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/projects",
      headers: { "x-api-key": VALID_API_KEY },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(typeof body[0].title).toBe("string");
    expect(Array.isArray(body[0].highlights)).toBe(true);
  });
});

describe("GET /resume", () => {
  it("returns the full CV aggregate", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/resume",
      headers: { "x-api-key": VALID_API_KEY },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.about).toBeDefined();
    expect(body.experience.length).toBeGreaterThan(0);
    expect(body.qualifications.length).toBeGreaterThan(0);
    expect(body.skills.length).toBeGreaterThan(0);
    expect(body.projects.length).toBeGreaterThan(0);
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
