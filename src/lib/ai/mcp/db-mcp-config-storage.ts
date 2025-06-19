import type { MCPServerConfig } from "app-types/mcp";
import type {
  MCPClientsManager,
  MCPConfigStorage,
} from "./create-mcp-clients-manager";
import { mcpRepository } from "lib/db/repository";
import logger from "logger";
import { getSession } from "auth/server";

export function createDbBasedMCPConfigsStorage(): MCPConfigStorage {
  // In-memory cache for configs
  const configs: Map<string, MCPServerConfig> = new Map();
  let manager: MCPClientsManager;
  let currentUserId: string | null = null;

  // Loads all enabled server configs from the database into the in-memory cache
  async function saveToCacheFromDb() {
    try {
      if (!currentUserId) {
        logger.warn("No user ID available when loading MCP configs");
        return;
      }
      const servers = await mcpRepository.selectAllServers(currentUserId);
      configs.clear();
      servers.forEach((server) => {
        configs.set(server.name, server.config);
      });

      // Initialize clients for all configs
      if (manager) {
        await Promise.all(
          Array.from(configs.entries()).map(([name, config]) =>
            manager.addClient(name, config)
          )
        );
      }
    } catch (error) {
      logger.error("Failed to load MCP configs from database:", error);
    }
  }

  // Initializes the manager with configs from the database
  async function init(_manager: MCPClientsManager): Promise<void> {
    manager = _manager;
  }

  // async function checkAndRefreshClients() {
  //   if (!currentUserId) return;

  //   let shouldRefresh = false;
  //   await saveToCacheFromDb();
  //   const dbConfigs = Array.from(configs.entries())
  //     .map(([name, config]) => {
  //       return {
  //         name,
  //         config,
  //       };
  //     })
  //     .sort((a, b) => a.name.localeCompare(b.name));

  //   const managerConfigs = manager
  //     .getClients()
  //     .map((client) => {
  //       const info = client.getInfo();
  //       return {
  //         name: info.name,
  //         config: info.config,
  //       };
  //     })
  //     .sort((a, b) => a.name.localeCompare(b.name));

  //   if (dbConfigs.length !== managerConfigs.length) {
  //     shouldRefresh = true;
  //   }

  //   if (!equal(dbConfigs, managerConfigs)) {
  //     shouldRefresh = true;
  //   }

  //   if (shouldRefresh) {
  //     const refreshPromises = dbConfigs.map(({ name, config }) => {
  //       const managerConfig = manager
  //         .getClients()
  //         .find((c) => c.getInfo().name === name)
  //         ?.getInfo();
  //       if (!managerConfig) {
  //         return manager.addClient(name, config);
  //       }
  //       if (
  //         !equal(managerConfig.config, config) &&
  //         managerConfig.status === "connected"
  //       ) {
  //         return manager.refreshClient(name, config);
  //       }
  //     });
  //     const deletePromises = managerConfigs
  //       .filter((c) => {
  //         const dbConfig = dbConfigs.find((c2) => c2.name === c.name);
  //         return !dbConfig;
  //       })
  //       .map((c) => manager.removeClient(c.name));
  //     await Promise.all([...refreshPromises, ...deletePromises]);
  //   }
  // }

  return {
    init,
    async loadAll(userId): Promise<Record<string, MCPServerConfig>> {
      console.log("Load ALL: ", userId);
      try {
        const session = await getSession();
        if (session?.user?.id) {
          currentUserId = session.user.id;
          await saveToCacheFromDb();
        }
        return Object.fromEntries(configs);
      } catch (error) {
        logger.error("Failed to load MCP configs:", error);
        return {};
      }
    },
    async save(name: string, config: MCPServerConfig): Promise<void> {
      const session = await getSession();
      if (!session?.user?.id) {
        throw new Error("User session not found");
      }
      currentUserId = session.user.id;
      try {
        const existingServer = await mcpRepository.selectServerByName(name);
        if (existingServer) {
          await mcpRepository.updateServer(existingServer.id, { config });
        } else {
          await mcpRepository.insertServer({
            name,
            config,
            userId: session.user.id,
          });
        }
        configs.set(name, config);
        // Initialize the client after saving
        if (manager) {
          await manager.addClient(name, config);
        }
      } catch (error) {
        logger.error(`Failed to save MCP config "${name}" to database:`, error);
        throw error;
      }
    },
    async delete(name: string): Promise<void> {
      try {
        const server = await mcpRepository.selectServerByName(name);
        if (server) {
          await mcpRepository.deleteServer(server.id);
        }
        configs.delete(name);
        // Remove the client after deleting
        if (manager) {
          await manager.removeClient(name);
        }
      } catch (error) {
        logger.error(
          `Failed to delete MCP config "${name}" from database:",`,
          error
        );
        throw error;
      }
    },
    async has(name: string): Promise<boolean> {
      return configs.has(name);
    },
  };
}
