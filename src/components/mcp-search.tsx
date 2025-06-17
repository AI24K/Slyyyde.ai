"use client";

import { Input } from "ui/input";
import { Search } from "lucide-react";
import { useDebounce } from "use-debounce";
import { useEffect, useState } from "react";
import { MCPToolInfo } from "app-types/mcp";

export function MCPSearch({
  tools,
  onSearch,
  className,
}: {
  tools: MCPToolInfo[];
  onSearch: (filteredTools: MCPToolInfo[]) => void;
  className?: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (!debouncedSearchTerm.trim()) {
      onSearch(tools);
      return;
    }

    const lowercasedSearch = debouncedSearchTerm.toLowerCase();
    const filtered = tools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(lowercasedSearch) ||
        tool.description.toLowerCase().includes(lowercasedSearch)
    );
    onSearch(filtered);
  }, [debouncedSearchTerm, tools, onSearch]);

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search MCP tools..."
        className="pl-10"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
}
