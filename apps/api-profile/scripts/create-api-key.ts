import { createHash, randomBytes } from "node:crypto";
import { supabase } from "../src/lib/supabaseClient";

const clientName = process.argv[2];

if (!clientName) {
  console.error("Usage: pnpm --filter @portfolio/api-profile create-api-key <client_name>");
  process.exit(1);
}

const rawKey = randomBytes(32).toString("hex");
const keyHash = createHash("sha256").update(rawKey).digest("hex");

const { error } = await supabase.from("api_keys").insert({ client_name: clientName, key_hash: keyHash });

if (error) {
  console.error(`Failed to create API key: ${error.message}`);
  process.exit(1);
}

console.log(`Created API key for client "${clientName}".`);
console.log("Raw key (store this now — it cannot be recovered):");
console.log(rawKey);
