# MCP User Feedback Server - Usage Guide

## Overview

The MCP User Feedback Server allows AI assistants to request real-time input from users through native system dialog boxes. This is particularly useful when an AI needs clarification, preferences, or specific information that wasn't provided in the original conversation.

## Installation & Setup

### 1. Cursor IDE Setup

1. Open Cursor IDE
2. Go to Settings (Cmd/Ctrl + ,)
3. Search for "MCP" or navigate to the MCP servers section
4. Add the following configuration:

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

5. Restart Cursor IDE

### 2. Claude Desktop Setup

1. Open the Claude Desktop configuration file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\\Claude\\claude_desktop_config.json`

2. Add the server configuration:

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

3. Restart Claude Desktop

### 3. Other MCP Clients

For any other MCP-compatible client, use:
- **Command**: `npx`
- **Arguments**: `["-y", "mcp-user-feedback-server@latest"]`

## How It Works

When configured, the AI assistant gains access to a `request_user_feedback` tool that can:

1. Display a native dialog box on your screen
2. Show a custom question or prompt
3. Accept user input
4. Return the input back to the AI

## Use Cases

### 1. Clarifying Requirements

```
User: Create a website for my business
AI: I'd like to get some details about your business to create the best website for you.
[AI shows dialog: "What type of business do you have?"]
[You enter: "Local bakery specializing in custom cakes"]
AI: Perfect! I'll create a website design for your custom cake bakery...
```

### 2. Getting Preferences

```
User: Help me choose a color scheme
AI: Let me ask about your color preferences.
[AI shows dialog with title "Color Preference": "What's your favorite color or any colors you'd like to avoid?"]
[You enter: "I love blues and greens, avoid red"]
AI: Great choice! Here are some blue and green color schemes...
```

### 3. Collecting Sensitive Information

```
User: Set up my database connection
AI: I need your database credentials to help you set this up.
[AI shows dialog: "Please enter your database password:"]
[You enter your password securely]
AI: Thanks! I'll configure the connection with your credentials...
```

### 4. Interactive Decision Making

```
User: Help me refactor this code
AI: I see a few different approaches. Let me ask which you prefer.
[AI shows dialog: "Would you prefer: A) Performance optimization, B) Readability focus, or C) Maintainability focus?"]
[You choose: "B) Readability focus"]
AI: I'll refactor focusing on readability...
```

## Dialog Features

### Basic Dialog
- Simple text input
- OK/Cancel buttons
- Returns user input or error if cancelled

### Advanced Options
- **Custom Title**: Set a specific title for the dialog
- **Default Text**: Pre-fill the input field
- **Multi-platform**: Works on macOS, Windows, and Linux

## Platform-Specific Behavior

### macOS
- Uses native AppleScript dialogs
- Integrated with system appearance
- No additional software required

### Windows
- Uses VBScript InputBox
- Native Windows look and feel
- No additional software required

### Linux
- Uses `zenity` (GTK) or `kdialog` (KDE)
- May require installing dialog software:
  ```bash
  # Ubuntu/Debian
  sudo apt-get install zenity
  
  # or for KDE
  sudo apt-get install kdialog
  ```

## Troubleshooting

### Dialog Not Appearing
1. **Check if server is running**: The MCP client should show the server as connected
2. **GUI Environment**: Ensure you're in a graphical environment (not SSH without X11)
3. **Linux Dependencies**: Install `zenity` or `kdialog` on Linux systems

### Permission Issues
- **macOS**: You may need to grant accessibility permissions to your terminal or MCP client
- **Windows**: Ensure scripts can run (check execution policy if needed)

### AI Not Using the Tool
- The AI will only use the tool when it determines user input is needed
- You can explicitly ask: "Please ask me for [specific information]"
- Make sure the MCP server is properly configured and connected

## Example Conversation Flows

### Information Gathering
```
User: Help me write a professional email
AI: I'll help you write a professional email. Let me gather some details first.
[Dialog 1: "Who is the recipient of this email?"]
[Dialog 2: "What is the main purpose or subject of the email?"]
[Dialog 3: "What tone would you like? (formal, friendly, urgent, etc.)"]
AI: Based on your inputs, here's a professional email draft...
```

### Configuration Setup
```
User: Set up my development environment
AI: I'll help you configure your development environment. Let me ask a few questions.
[Dialog 1: "What programming language/framework are you primarily using?"]
[Dialog 2: "Do you prefer VS Code, IntelliJ, or another IDE?"]
[Dialog 3: "Any specific tools or extensions you always use?"]
AI: Here's your customized development environment setup...
```

## Privacy & Security

- User input is only sent to the AI assistant, not stored by the MCP server
- Sensitive information should be handled carefully by both user and AI
- The dialog appears locally on your machine - no data is transmitted until you submit
- You can always cancel a dialog without providing information

## Tips for Best Experience

1. **Be Specific**: When asking the AI to gather information, be specific about what you need
2. **Use Titles**: The AI can set meaningful titles for dialogs to provide context
3. **Default Values**: For forms or repeated tasks, default values can speed up the process
4. **Multiple Questions**: The AI can ask several questions in sequence for complex tasks

## Need Help?

- Check the [GitHub repository](https://github.com/jeff_kit/mcp-user-feedback-server) for issues and updates
- Ensure your MCP client supports tool usage
- Verify the server appears in your MCP client's connected servers list

