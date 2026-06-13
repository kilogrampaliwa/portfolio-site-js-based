import { describe, expect, it } from "vitest";
import type { HealthStatus } from "./index";

describe("HealthStatus", () => {
  it("accepts an object with a status string", () => {
    const health: HealthStatus = { status: "ok" };
    expect(health.status).toBe("ok");
  });
});
