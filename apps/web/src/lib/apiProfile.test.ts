import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getCertificates, getEducation, getExperience, getProfile } from "./apiProfile";

const validProfile = {
  fullName: "Ada Lovelace",
  tagline: "Software pioneer",
  bio: "I build things.",
  email: "ada@example.com",
  socialLinks: { github: "https://github.com/ada" },
  avatarUrl: null,
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const validExperience = [
  {
    id: "1",
    company: "Acme",
    role: "Engineer",
    location: null,
    startDate: "2020-01-01",
    endDate: null,
    description: "Did things.",
    orderIndex: 0,
  },
];

const validEducation = [
  {
    id: "1",
    institution: "State University",
    degree: "B.Sc. Computer Science",
    field: null,
    startDate: "2014-09-01",
    endDate: "2018-06-01",
    description: "Studied computer science.",
    orderIndex: 0,
  },
];

const validCertificates = [
  {
    id: "1",
    name: "Certified Example",
    issuer: "Example Org",
    issueDate: "2022-01-01",
    expiryDate: null,
    credentialUrl: "https://example.com/credential",
    orderIndex: 0,
  },
];

describe("apiProfile", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.NEXT_PUBLIC_PROFILE_API_URL = "http://localhost:3001";
    process.env.PROFILE_API_KEY = "test-key";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  describe("getProfile", () => {
    it("returns the parsed profile and sends the API key + locale", async () => {
      const fetchMock = vi
        .spyOn(global, "fetch")
        .mockResolvedValue(new Response(JSON.stringify(validProfile), { status: 200 }));

      const result = await getProfile("pl");

      expect(result).toEqual(validProfile);
      const [url, init] = fetchMock.mock.calls[0];
      expect(String(url)).toBe("http://localhost:3001/profile?locale=pl");
      expect((init?.headers as Record<string, string>)["X-API-Key"]).toBe("test-key");
    });

    it("returns null when the API responds with an error status", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(new Response("oops", { status: 500 }));

      expect(await getProfile("en")).toBeNull();
    });

    it("returns null when the response doesn't match the schema", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ unexpected: true }), { status: 200 }),
      );

      expect(await getProfile("en")).toBeNull();
    });

    it("returns null when fetch throws", async () => {
      vi.spyOn(global, "fetch").mockRejectedValue(new Error("network error"));

      expect(await getProfile("en")).toBeNull();
    });

    it("returns null without fetching when env vars are missing", async () => {
      delete process.env.PROFILE_API_KEY;
      const fetchMock = vi.spyOn(global, "fetch");

      expect(await getProfile("en")).toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe("getExperience", () => {
    it("returns the parsed experience list", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(
        new Response(JSON.stringify(validExperience), { status: 200 }),
      );

      expect(await getExperience("en")).toEqual(validExperience);
    });

    it("returns an empty array on error", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(new Response("oops", { status: 500 }));

      expect(await getExperience("en")).toEqual([]);
    });
  });

  describe("getEducation", () => {
    it("returns the parsed education list", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(
        new Response(JSON.stringify(validEducation), { status: 200 }),
      );

      expect(await getEducation("en")).toEqual(validEducation);
    });

    it("returns an empty array on error", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(new Response("oops", { status: 500 }));

      expect(await getEducation("en")).toEqual([]);
    });
  });

  describe("getCertificates", () => {
    it("returns the parsed certificate list", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(
        new Response(JSON.stringify(validCertificates), { status: 200 }),
      );

      expect(await getCertificates("en")).toEqual(validCertificates);
    });

    it("returns an empty array on error", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(new Response("oops", { status: 500 }));

      expect(await getCertificates("en")).toEqual([]);
    });
  });
});
