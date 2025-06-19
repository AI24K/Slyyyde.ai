"use server";
import type { MCPServerConfig } from "app-types/mcp";
import { createUserScopedMCPManager } from "lib/ai/mcp/mcp-manager";
import { isMaybeMCPServerConfig } from "lib/ai/mcp/is-mcp-config";
import { detectConfigChanges } from "lib/ai/mcp/mcp-config-diff";
import { z } from "zod";
import { safe } from "ts-safe";
import { errorToString } from "lib/utils";
import { getSession } from "auth/server";

export async function selectMcpClientsAction() {
  const session = await getSession();
  if (!session?.user?.id) {
    return [];
  }

  const mcpClientsManager = createUserScopedMCPManager();
  await mcpClientsManager.init();
  const storage = (mcpClientsManager as any).storage;
  if (storage) {
    await storage.loadAll(session.user.id);
  }
  const list = mcpClientsManager.getClients();
  return list.map((client) => client.getInfo());
}

export async function selectMcpClientAction(name: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  const mcpClientsManager = createUserScopedMCPManager();
  await mcpClientsManager.init();
  const storage = (mcpClientsManager as any).storage;
  if (storage) {
    await storage.loadAll(session.user.id);
  }
  const client = mcpClientsManager
    .getClients()
    .find((client) => client.getInfo().name === name);
  if (!client) {
    throw new Error("Client not found");
  }
  return client.getInfo();
}

const validateConfig = (config: unknown) => {
  if (!isMaybeMCPServerConfig(config)) {
    throw new Error("Invalid MCP server configuration");
  }
  return config;
};

export async function updateMcpConfigByJsonAction(
  json: Record<string, MCPServerConfig>
) {
  Object.values(json).forEach(validateConfig);
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  const mcpClientsManager = createUserScopedMCPManager();
  await mcpClientsManager.init();
  const storage = (mcpClientsManager as any).storage;
  if (storage) {
    await storage.loadAll(session.user.id);
  }
  const prevConfig = Object.fromEntries(
    mcpClientsManager
      .getClients()
      .map((client) => [client.getInfo().name, client.getInfo().config])
  );
  const changes = detectConfigChanges(prevConfig, json);
  for (const change of changes) {
    const value = change.value;
    if (change.type === "add") {
      await mcpClientsManager.addClient(change.key, value);
    } else if (change.type === "remove") {
      await mcpClientsManager.removeClient(change.key);
    } else if (change.type === "update") {
      await mcpClientsManager.refreshClient(change.key, value);
    }
  }
}

export async function insertMcpClientAction(
  name: string,
  config: MCPServerConfig
) {
  if (process.env.NOT_ALLOW_ADD_MCP_SERVERS) {
    throw new Error("Not allowed to add MCP servers");
  }
  // Validate name to ensure it only contains alphanumeric characters and hyphens
  const nameSchema = z.string().regex(/^[a-zA-Z0-9\-]+$/, {
    message:
      "Name must contain only alphanumeric characters (A-Z, a-z, 0-9) and hyphens (-)",
  });

  const result = nameSchema.safeParse(name);
  if (!result.success) {
    throw new Error(
      "Name must contain only alphanumeric characters (A-Z, a-z, 0-9) and hyphens (-)"
    );
  }

  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  const mcpClientsManager = createUserScopedMCPManager();
  await mcpClientsManager.init();
  const storage = (mcpClientsManager as any).storage;
  if (storage) {
    await storage.loadAll(session.user.id);
  }
  await mcpClientsManager.addClient(name, config);
}

export async function removeMcpClientAction(name: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  const mcpClientsManager = createUserScopedMCPManager();
  await mcpClientsManager.init();
  const storage = (mcpClientsManager as any).storage;
  if (storage) {
    await storage.loadAll(session.user.id);
  }
  await mcpClientsManager.removeClient(name);
}

export async function connectMcpClientAction(name: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  const mcpClientsManager = createUserScopedMCPManager();
  await mcpClientsManager.init();
  const storage = (mcpClientsManager as any).storage;
  if (storage) {
    await storage.loadAll(session.user.id);
  }
  const client = mcpClientsManager
    .getClients()
    .find((client) => client.getInfo().name === name);
  if (client?.getInfo().status === "connected") {
    return;
  }
  await client?.connect();
}

export async function disconnectMcpClientAction(name: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  const mcpClientsManager = createUserScopedMCPManager();
  await mcpClientsManager.init();
  const storage = (mcpClientsManager as any).storage;
  if (storage) {
    await storage.loadAll(session.user.id);
  }
  const client = mcpClientsManager
    .getClients()
    .find((client) => client.getInfo().name === name);
  if (client?.getInfo().status === "disconnected") {
    return;
  }
  await client?.disconnect();
}

export async function refreshMcpClientAction(name: string) {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  const mcpClientsManager = createUserScopedMCPManager();
  await mcpClientsManager.init();
  const storage = (mcpClientsManager as any).storage;
  if (storage) {
    await storage.loadAll(session.user.id);
  }
  await mcpClientsManager.refreshClient(name);
}

export async function updateMcpClientAction(
  name: string,
  config: MCPServerConfig
) {
  console.log("Updating MCP client", name, config);
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  const mcpClientsManager = createUserScopedMCPManager();
  await mcpClientsManager.init();
  const storage = (mcpClientsManager as any).storage;
  if (storage) {
    await storage.loadAll(session.user.id);
  }
  await mcpClientsManager.refreshClient(name, config);
}

export async function callMcpToolAction(
  mcpName: string,
  toolName: string,
  input?: unknown
) {
  return safe(() => {
    // This function is called from the client, so we need to get the session
    // and create a user-scoped manager
    return getSession().then(async (session) => {
      if (!session?.user?.id) {
        throw new Error("Unauthorized");
      }
      const mcpClientsManager = createUserScopedMCPManager();
      await mcpClientsManager.init();
      const storage = (mcpClientsManager as any).storage;
      await storage.loadAll(session.user.id);
      const client = mcpClientsManager
        .getClients()
        .find((client) => client.getInfo().name === mcpName);
      if (!client) {
        throw new Error("Client not found");
      }
      const res = await client.callTool(toolName, input);
      if (res?.isError) {
        throw new Error(
          res.content?.[0]?.text ??
            JSON.stringify(res.content, null, 2) ??
            "Unknown error"
        );
      }
      return res;
    });
  })
    .ifFail((err) => {
      return {
        isError: true,
        content: [
          JSON.stringify({
            error: {
              message: errorToString(err),
              name: err?.name,
            },
          }),
        ],
      };
    })
    .unwrap();
}
