/**
 * Placeholder shared type, proving the workspace wiring between
 * `apps/web` / `apps/api` and `packages/shared-types` works end to end.
 * Real domain types/schemas land in layer 02.
 */
export type HealthStatus = {
  status: string;
};
