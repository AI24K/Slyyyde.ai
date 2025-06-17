"use client";
import { MCPCard } from "@/components/mcp-card";
import { appStore } from "@/app/store";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MCPOverview } from "@/components/mcp-overview";
import { selectMcpClientsAction } from "@/app/api/mcp/actions";
import useSWR from "swr";
import { Skeleton } from "ui/skeleton";
import { useState, useMemo } from "react";
import { handleErrorWithToast } from "ui/shared-toast";
import { Plus, Search } from "lucide-react";
import { ScrollArea } from "ui/scroll-area";
import { Input } from "ui/input";
import { useDebounce } from "use-debounce";

export default function Page() {
  const appStoreMutate = appStore((state) => state.mutate);

  const { data: mcpList, isLoading } = useSWR(
    "mcp-list",
    selectMcpClientsAction,
    {
      refreshInterval: 10000,
      fallbackData: [],
      onError: handleErrorWithToast,
      onSuccess: (data) => appStoreMutate({ mcpList: data }),
    },
  );

  console.log("MCP List:", mcpList);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  // Get all tools from all MCP servers
  const allTools = useMemo(() => {
    return mcpList.flatMap(server => 
      server?.tools?.map(tool => ({
        ...tool,
        serverName: server.name,
        serverDescription: server.description || 'No description',
      }))
    );
  }, [mcpList]);

  // Filter tools based on search term
  const filteredTools = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return allTools;
    const lowercasedSearch = debouncedSearchTerm.toLowerCase();
    return allTools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(lowercasedSearch) ||
        tool?.description.toLowerCase().includes(lowercasedSearch) ||
        tool?.serverName.toLowerCase().includes(lowercasedSearch) ||
        (tool?.serverDescription?.toLowerCase() || '').includes(lowercasedSearch)
    );
  }, [allTools, debouncedSearchTerm]);

  // Group tools by server for display
  const toolsByServer = useMemo(() => {
    const serverMap = new Map();
    
    filteredTools.forEach(tool => {
      if (!serverMap.has(tool?.serverName)) {
        const server = mcpList.find(s => s.name === tool?.serverName);
        serverMap.set(tool?.serverName, {
          ...server,
          tools: [],
        });
      }
      serverMap.get(tool?.serverName).tools.push(tool);
    });

    return Array.from(serverMap.values());
  }, [filteredTools, mcpList]);

  return (
    <ScrollArea className="h-full w-full">
      <div className="flex-1 relative flex flex-col gap-4 px-8 py-8 max-w-3xl h-full mx-auto">
        <div className="flex flex-col gap-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">MCP Servers</h1>
            <div className="flex-1" />
            <div className="flex gap-2">
              <Link href="https://smithery.ai/" target="_blank">
                <Button className="font-semibold" variant={"ghost"}>
                  Server Market
                </Button>
              </Link>
              <Link href="/mcp/create">
                <Button
                  className="border-dashed border-foreground/20 font-semibold"
                  variant="outline"
                >
                  <Plus className="stroke-2" />
                  Add MCP Server
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search MCP tools..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {searchTerm && (
            <div className="text-sm text-muted-foreground">
              Found {filteredTools.length} tools matching &quot;{searchTerm}&quot;
            </div>
          )}
        </div>
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-lg" />
              ))}
            </div>
          ) : searchTerm ? (
            <div className="space-y-6">
              {toolsByServer.map((server) => (
                <div key={server.name} className="space-y-2">
                  <h3 className="text-lg font-medium">{server.name}</h3>
                  <div className="space-y-4">
                    {server?.tools?.map((tool) => (
                      <div key={`${server.name}-${tool.name}`} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="font-medium">{tool.name}</div>
                        <div className="text-sm text-muted-foreground">{tool.description}</div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Server: {server.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {toolsByServer.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No tools found matching &quot;{searchTerm}&quot;
                </div>
              )}
            </div>
          ) : mcpList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="text-lg font-medium">No MCP Servers</h3>
              <p className="text-muted-foreground text-sm">
                Get started by adding an MCP server
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {mcpList.map((mcp) => (
                <MCPCard key={mcp.name} {...mcp} />
              ))}
            </div>
          )}
        </div>
        {!searchTerm && <MCPOverview  />}
      </div>
    </ScrollArea>
  );
}
