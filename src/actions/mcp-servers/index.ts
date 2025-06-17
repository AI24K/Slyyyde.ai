"use server";
import type { MCPServerConfig } from "app-types/mcp";
import { pgDb as db } from "lib/db/pg/db.pg";
import { McpServerSchema } from "lib/db/pg/schema.pg";

export async function onGetAllMcpServers() {
  const query = db.select().from(McpServerSchema);
  const results = await query;

  return results.map((result) => ({
    id: result.id,
    name: result.name,
    config: result.config as MCPServerConfig,
    enabled: result.enabled,
    userId: result.userId,
  }));
}
