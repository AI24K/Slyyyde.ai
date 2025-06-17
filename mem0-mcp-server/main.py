import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (replace with a database in production)
preferences_db = []

class CodingPreference(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    code: str
    language: str
    framework: Optional[str] = None
    version: Optional[str] = None
    tags: List[str] = []
    dependencies: List[str] = []
    setup_instructions: Optional[str] = None
    example_usage: Optional[str] = None
    best_practices: Optional[str] = None

class SearchQuery(BaseModel):
    query: str
    limit: int = 5

@app.post("/preferences", response_model=CodingPreference)
async def add_preference(preference: CodingPreference):
    """Add a new coding preference to the database"""
    preference.id = f"pref_{len(preferences_db) + 1}"
    preferences_db.append(preference.dict())
    return preference

@app.get("/preferences", response_model=List[CodingPreference])
async def get_all_preferences():
    """Get all coding preferences"""
    return preferences_db

@app.post("/preferences/search", response_model=List[CodingPreference])
async def search_preferences(query: SearchQuery):
    """Search coding preferences (simple text search, replace with semantic search in production)"""
    query_lower = query.query.lower()
    results = []
    
    for pref in preferences_db:
        if (query_lower in pref['title'].lower() or 
            query_lower in pref['description'].lower() or 
            query_lower in pref['code'].lower() or
            any(query_lower in tag.lower() for tag in pref['tags'])):
            results.append(pref)
            if len(results) >= query.limit:
                break
                
    return results

# MCP Server Implementation
from sse_starlette.sse import EventSourceResponse
import json
import asyncio

class MCPServer:
    def __init__(self):
        self.clients = set()
        
    async def event_generator(self, client_id):
        try:
            while True:
                if client_id in self.clients:
                    # In a real implementation, you would send actual events here
                    await asyncio.sleep(5)  # Keep-alive
                    yield {"event": "keepalive", "data": ""}
                else:
                    break
        except asyncio.CancelledError:
            self.clients.discard(client_id)
            
mcp_server = MCPServer()

@app.get("/sse")
async def sse_endpoint():
    """SSE endpoint for MCP clients"""
    client_id = str(len(mcp_server.clients) + 1)
    mcp_server.clients.add(client_id)
    
    async def event_generator():
        try:
            while True:
                if client_id in mcp_server.clients:
                    # Send a keep-alive event
                    yield {"event": "keepalive", "data": json.dumps({"message": "Connected to MCP server"})}
                    await asyncio.sleep(5)
                else:
                    break
        except asyncio.CancelledError:
            mcp_server.clients.discard(client_id)
    
    return EventSourceResponse(event_generator())

# MCP Tools
@app.post("/mcp/tools/search")
async def mcp_search(query: dict):
    """MCP search endpoint"""
    try:
        # Forward search to our search endpoint
        search_query = SearchQuery(query=query.get("query", ""), limit=query.get("limit", 5))
        results = await search_preferences(search_query)
        return {
            "results": results,
            "count": len(results)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
