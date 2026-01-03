# @samuraiwp/mcp-wp-remote

A STDIO bridge for connecting to WordPress sites via the Model Context Protocol (MCP). This package enables communication between MCP clients and WordPress installations running the SamuraiWP plugin.

## Overview

`mcp-wp-remote` acts as a bridge between MCP clients and WordPress REST API endpoints. It reads JSON-RPC requests from STDIN, forwards them to a WordPress site's MCP endpoint, and returns responses via STDOUT.

## Installation

```bash
npm install -g @samuraiwp/mcp-wp-remote
```

Or use directly with npx:

```bash
npx @samuraiwp/mcp-wp-remote <url> <api-key>
```

## Requirements

- Node.js (ES modules support required)
- WordPress site with SamuraiWP plugin installed
- Valid API key from your WordPress installation

## Usage

### Command Line

```bash
mcp-wp-remote <url> <api-key>
```

**Parameters:**
- `<url>` - Your WordPress site URL (e.g., `https://example.com`)
- `<api-key>` - API key for authentication (Bearer token)

The endpoint path `/wp-json/samur-ai/v1/mcp` is automatically appended to the URL if not present.

### Example

```bash
mcp-wp-remote https://mysite.com my-secret-api-key
```

Or with the full endpoint:

```bash
mcp-wp-remote https://mysite.com/wp-json/samur-ai/v1/mcp my-secret-api-key
```

### As MCP Server Configuration

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "wordpress": {
      "command": "mcp-wp-remote",
      "args": ["https://yoursite.com", "your-api-key"]
    }
  }
}
```

## How It Works

1. Accepts JSON-RPC 2.0 formatted messages via STDIN
2. Authenticates with WordPress using Bearer token authorization
3. Forwards requests to the WordPress MCP endpoint
4. Returns responses via STDOUT in JSON-RPC 2.0 format

### Communication Flow

```
MCP Client → STDIN → mcp-wp-remote → WordPress REST API
           ← STDOUT ←              ←
```

## JSON-RPC Protocol

The bridge expects and returns JSON-RPC 2.0 formatted messages:

**Request:**
```json
{
  "jsonrpc": "2.0",
  "method": "method_name",
  "params": {},
  "id": 1
}
```

**Response (Success):**
```json
{
  "jsonrpc": "2.0",
  "result": {},
  "id": 1
}
```

**Response (Error):**
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32000,
    "message": "Error description"
  },
  "id": 1
}
```

## Error Handling

The bridge handles various error scenarios:

- **Invalid URL**: Exits with code 1 if URL is malformed
- **HTTP Errors**: Returns JSON-RPC error with HTTP status code
- **Network Errors**: Returns JSON-RPC error with code -32000
- **Invalid Arguments**: Shows usage message and exits

## Features

- Automatic endpoint path normalization
- Bearer token authentication
- Multi-line JSON input support
- Graceful shutdown handling (SIGINT, SIGTERM)
- JSON-RPC 2.0 compliant error responses

## WordPress Setup

1. Install the SamuraiWP plugin on your WordPress site
2. Generate an API key in the plugin settings
3. Ensure the REST API endpoint is accessible at `/wp-json/samur-ai/v1/mcp`

## Development

```bash
# Clone repository
git clone <repository-url>

# Install dependencies (if any)
npm install

# Run locally
node index.js https://example.com your-api-key
```

## License

MIT

## Keywords

- MCP (Model Context Protocol)
- WordPress
- JSON-RPC
- STDIO Bridge
- REST API

## Author

SamuraiWP Team

## Support

For issues and questions:
- WordPress Plugin: [SamuraiWP](https://samuraiwp.com)
- GitHub Issues: Report issues in the repository
