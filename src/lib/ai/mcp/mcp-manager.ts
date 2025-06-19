import { createDbBasedMCPConfigsStorage } from "./db-mcp-config-storage";
import {
  createMCPClientsManager,
  type MCPClientsManager,
} from "./create-mcp-clients-manager";

// Factory function to create a new MCPClientsManager per user/session
export function createUserScopedMCPManager(): MCPClientsManager {
  const storage = createDbBasedMCPConfigsStorage();
  return createMCPClientsManager(storage);
}
