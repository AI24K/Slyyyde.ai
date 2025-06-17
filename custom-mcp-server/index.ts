// import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
// import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
// import { z } from "zod";
// import { registerPlaywrightTools } from './playwright-tools';

// // Import other utilities if needed
// import { marked } from 'marked';
// import { customAlphabet } from 'nanoid';
// import QRCode from 'qrcode';
// import axios from 'axios';

// // Initialize marked with safe defaults
// marked.setOptions({
//   gfm: true,
//   breaks: true,
//   sanitize: false,
//   smartypants: true
// });

// // URL shortener (in-memory store for demo)
// const urlStore = new Map<string, string>();
// const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

// // In-memory search index (replace with a real search engine in production)
// const searchIndex = [
//   {
//     id: 1,
//     title: "Getting Started with MCP",
//     content: "Learn how to set up your first MCP server and connect it to your application.",
//     url: "https://example.com/docs/getting-started"
//   },
//   {
//     id: 2,
//     title: "Advanced Search Techniques",
//     content: "Explore advanced search capabilities and how to implement them in your MCP server.",
//     url: "https://example.com/docs/advanced-search"
//   },
//   {
//     id: 3,
//     title: "API Reference",
//     content: "Complete reference for all MCP server APIs and configuration options.",
//     url: "https://example.com/docs/api"
//   },
// ];

// const server = new McpServer({
//   name: "search-mcp-server",
//   version: "0.1.0",
//   description: "A search MCP server for document search functionality"
// });

// // Simple search implementation
// server.tool(
//   "search_documents",
//   "Search through documents with a query string",
//   {
//     query: z.string().describe("Search query"),
//     limit: z.number().optional().default(10).describe("Maximum number of results to return")
//   },
//   async ({ query, limit }) => {
//     // Simple case-insensitive search
//     const searchTerm = query.toLowerCase();

//     const results = searchIndex
//       .filter(doc =>
//         doc.title.toLowerCase().includes(searchTerm) ||
//         doc.content.toLowerCase().includes(searchTerm)
//       )
//       .slice(0, limit);

//     return {
//       results,
//       count: results.length,
//       query: searchTerm
//     };
//   }
// );

// // Get document by ID
// server.tool(
//   "get_document",
//   "Get a document by its ID",
//   {
//     id: z.number().describe("Document ID")
//   },
//   async ({ id }) => {
//     const document = searchIndex.find(doc => doc.id === id);
//     if (!document) {
//       throw new Error(`Document with ID ${id} not found`);
//     }
//     return document;
//   }
// );

// // Register Playwright tools
// registerPlaywrightTools(server);

// const transport = new StdioServerTransport();

// // Handle graceful shutdown
// process.on('SIGINT', async () => {
//   console.log('Shutting down MCP server...');
//   await transport.close();
//   process.exit(0);
// });

// process.on('SIGTERM', async () => {
//   console.log('Shutting down MCP server...');
//   await transport.close();
//   process.exit(0);
// });

// // Start the server
// console.log('Starting MCP server with Playwright tools...');
// await server.connect(transport);
