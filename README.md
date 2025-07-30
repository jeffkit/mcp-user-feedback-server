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

## Command Line Options

The server supports the following command line options:

| Option | Alias | Description |
|--------|-------|-------------|
| --timeout | -t | Set dialog timeout in seconds (default: 600 seconds / 10 minutes) |

Example:
```bash
# Set timeout to 5 minutes (300 seconds)
npx mcp-user-feedback-server --timeout 300

# Using the short form
npx mcp-user-feedback-server -t 300
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

To set a custom timeout:

```json
{
  "mcpServers": {
    "user-feedback": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-user-feedback-server@latest",
        "--timeout",
        "300"
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

## Best Practices: Using with Cursor Rules

This MCP server works best when combined with proper rules or prompts in your AI assistant configuration. This ensures the AI consistently uses the feedback tool to verify its work rather than making assumptions.

### Recommended Cursor Rule

Add this rule to your Cursor configuration for optimal user feedback integration:

```markdown
**Feedback Protocol**  

**Core Rule:** Always use the `request_user_feedback` tool to verify your work - never assume you got it right.  

### **When to Request Feedback:**  
1. **When You Need Clarification**  
   - If any part of the request is unclear or missing details  
   - Example: *"Should I focus more on [A] or [B] for this analysis?"*  

2. **When You Complete a Task**  
   - After delivering any result, big or small  
   - Example: *"Here's the draft: [summary]. Does this meet your needs?"*  

**How to Use the Tool Properly:**  
- Always phrase requests clearly and specifically  
- Offer options when possible (e.g., "Should I use approach X or Y?")  
- Never proceed without getting explicit confirmation  

**Golden Rule:** Your work isn't done until the user says "This is exactly what I needed." Keep improving until you hear those words.
```

### How to Add the Rule in Cursor

1. Open Cursor IDE
2. Go to **settings** > **rules & memory** > **user rules**
3. Add the above feedback protocol rule
4. Save the configuration

This ensures your AI assistant will:
- Ask for clarification when requirements are unclear
- Verify completed work before moving on
- Use the dialog boxes to get real-time feedback
- Follow up until you confirm satisfaction

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
- **Linux**: Uses `zenity`, `kdialog`, `yad`, or `xmessage` (requires GUI environment)
- **Windows**: Uses PowerShell or VBScript (fallback)

## System Requirements

### macOS
- No additional dependencies required

### Linux
- Requires one of: `zenity` (GNOME/GTK), `kdialog` (KDE), `yad`, or `xmessage`
- Install zenity: `sudo apt-get install zenity` (Ubuntu/Debian)

### Windows
- No additional dependencies required

## Error Handling

The tool handles various error scenarios:
- User cancellation
- Dialog timeout
- Missing GUI environment
- Platform-specific dialog failures

## Development

The project structure:
```
src/
├── index.ts      # Main MCP server
├── dialog.ts     # Cross-platform dialog manager
docs/
├── FEEDBACK_PROTOCOL.md # Feedback protocol documentation
```

## License

MIT

import { read_file } from 'fs';

