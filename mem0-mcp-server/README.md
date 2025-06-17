# Mem0 MCP Server

A Model Context Protocol (MCP) server for managing coding preferences, built with FastAPI.

## Features

- Store and manage coding preferences
- Search through stored preferences
- MCP-compatible server with SSE support
- Simple in-memory storage (can be replaced with a database)

## Setup

1. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file and add your configuration:
   ```env
   MEM0_API_KEY=your_api_key_here
   ```

## Running the Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8080
```

The server will be available at `http://localhost:8080`

## API Endpoints

- `GET /sse` - SSE endpoint for MCP clients
- `POST /preferences` - Add a new coding preference
- `GET /preferences` - Get all coding preferences
- `POST /preferences/search` - Search coding preferences
- `POST /mcp/tools/search` - MCP search endpoint

## Connecting with Cursor

1. In Cursor, go to Settings > Advanced
2. Under "Model Context Protocol", add the SSE endpoint:
   ```
   http://localhost:8080/sse
   ```
3. Save and restart Cursor

## Development

To install development dependencies:

```bash
pip install -r requirements-dev.txt
```

## License

MIT
