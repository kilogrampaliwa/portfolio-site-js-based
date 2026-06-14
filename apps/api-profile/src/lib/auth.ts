import { createHash } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import { supabase } from "./supabaseClient";
import { errorBody } from "./errors";

declare module "fastify" {
  interface FastifyRequest {
    apiClientName?: string;
  }
}

/** Routes reachable without an API key. */
const PUBLIC_PATHS = new Set(["/health"]);

/**
 * `onRequest` hook enforcing the `X-API-Key` header on every route except
 * `/health`. Hashes the provided key (SHA-256) and looks it up in
 * `api_keys` (`key_hash`, `revoked_at is null`). On success, attaches
 * `client_name` to the request and best-effort updates `last_used_at`.
 */
export async function apiKeyAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const path = request.url.split("?")[0];
  if (PUBLIC_PATHS.has(path)) {
    return;
  }

  const apiKey = request.headers["x-api-key"];
  if (typeof apiKey !== "string" || apiKey.length === 0) {
    reply.code(401).send(errorBody("unauthorized", "Missing X-API-Key header"));
    return;
  }

  const keyHash = createHash("sha256").update(apiKey).digest("hex");

  const { data, error } = await supabase
    .from("api_keys")
    .select("client_name, revoked_at")
    .eq("key_hash", keyHash)
    .is("revoked_at", null)
    .maybeSingle();

  if (error || !data) {
    reply.code(401).send(errorBody("unauthorized", "Invalid or revoked API key"));
    return;
  }

  request.apiClientName = data.client_name;

  void supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("key_hash", keyHash)
    .then(undefined, () => {
      // best-effort — ignore failures
    });
}
