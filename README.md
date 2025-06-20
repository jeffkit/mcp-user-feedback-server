[README](README.md) | [中文](README_CN.md)
# MCP User Feedback Server

A Model Context Protocol (MCP) server that provides a tool for requesting user feedback through system dialog boxes.

## Features

- Cross-platform dialog support (macOS, Linux, Windows)
- Single tool: `request_user_feedback`
- Native system dialog integration
- Supports custom titles and default text
- Easy integration with MCP clients like Cursor, Claude Desktop, etc.

## Quick Start

### Using with MCP Clients

This server is designed to be used with MCP clients. The easiest way is to install it directly from npm:

```bash
npx mcp-user-feedback-server@latest
```

### Installation for Development

```bash
npm install
npm run build
```

## MCP Client Configuration

### Cursor IDE

Add this to your Cursor settings in the MCP servers configuration:

```json
{
  "mcpServers": {
    "user-feedback": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-user-feedback-server@latest"
      ]
    }
  }
}
```

### Claude Desktop

Add this to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "user-feedback": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-user-feedback-server@latest"
      ]
    }
  }
}
```

### Other MCP Clients

For any MCP client that supports the Model Context Protocol, you can use:

- **Command**: `npx`
- **Args**: `["-y", "mcp-user-feedback-server@latest"]`

### Local Development Setup

If you're developing locally, you can also run the server directly:

```json
{
  "mcpServers": {
    "user-feedback": {
      "command": "node",
      "args": ["/path/to/mcp-user-feedback-server/dist/index.js"]
    }
  }
}
```

## Tool: request_user_feedback

Shows a dialog box to request feedback from the user.

### Parameters

- `question` (required): The question or prompt to show to the user
- `title` (optional): Title for the dialog box
- `defaultAnswer` (optional): Default text to pre-fill in the input field

### Example Usage in MCP Clients

Once configured in your MCP client, you can use the tool in conversations:

**Example 1: Simple question**
```
User: Ask me what my favorite programming language is
AI: I'll ask you about your favorite programming language.
[AI uses request_user_feedback tool with question: "What is your favorite programming language?"]
[Dialog box appears on your screen]
[You type "TypeScript" and click OK]
AI: Thanks! You mentioned that TypeScript is your favorite programming language.
```

**Example 2: With custom title and default**
```
User: Get my preferred email for notifications
AI: Let me ask for your preferred notification email.
[AI uses request_user_feedback tool with:
  question: "Please enter your preferred email for notifications:"
  title: "Email Settings"
  defaultAnswer: "user@example.com"]
[Dialog box appears with the title "Email Settings"]
[You modify the default email and submit]
AI: I've noted your preferred email for notifications.
```

### Tool Parameters

```json
{
  "question": "What is your favorite color?",
  "title": "User Preference",
  "defaultAnswer": "Blue"
}
```

### Platform-specific Implementation

- **macOS**: Uses AppleScript with `osascript`
- **Linux**: Uses `zenity` or `kdialog` (requires GUI environment)
- **Windows**: Uses VBScript with `cscript`

## System Requirements

### macOS
- No additional dependencies required

### Linux
- Requires `zenity` (GNOME/GTK) or `kdialog` (KDE)
- Install zenity: `sudo apt-get install zenity` (Ubuntu/Debian)

### Windows
- No additional dependencies required (uses built-in VBScript)

## Error Handling

The tool handles various error scenarios:
- User cancellation
- Missing GUI environment
- Platform-specific dialog failures

## Development

The project structure:
```
src/
├── index.ts      # Main MCP server
├── dialog.ts     # Cross-platform dialog manager
```

## License

MIT

