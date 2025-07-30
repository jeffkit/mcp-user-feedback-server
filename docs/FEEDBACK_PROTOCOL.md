# Feedback Protocol

## Core Rule

Always use the `request_user_feedback` tool to verify your work - never assume you got it right.

## When to Request Feedback

### 1. When You Need Clarification
- If any part of the request is unclear or missing details
- Example: *"Should I focus more on [A] or [B] for this analysis?"*

### 2. When You Complete a Task
- After delivering any result, big or small
- Example: *"Here's the draft: [summary]. Does this meet your needs?"*

## How to Use the Tool Properly

- Always phrase requests clearly and specifically
- Offer options when possible (e.g., "Should I use approach X or Y?")
- Never proceed without getting explicit confirmation

## Golden Rule

Your work isn't done until the user says "This is exactly what I needed." Keep improving until you hear those words.

## Technical Details

### Command Line Options

The server supports the following command line options:

| Option | Alias | Description |
|--------|-------|-------------|
| --timeout | -t | 设置对话框超时时间（秒），默认为600秒（10分钟） |

示例：
```bash
# 设置超时时间为5分钟
node dist/index.js --timeout 300

# 使用简写形式
node dist/index.js -t 300
```

### Tool Parameters

The `request_user_feedback` tool accepts the following parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| question | string | Yes | The question or prompt to show to the user |
| title | string | No | Optional title for the dialog box |
| defaultAnswer | string | No | Optional default text to pre-fill in the input field |

### Example Usage

```javascript
const response = await client.callTool({
  name: 'request_user_feedback',
  arguments: {
    question: '您对这个功能的实现满意吗？',
    title: '用户反馈',
    defaultAnswer: '是的，我很满意'
  }
});
```

### Response Format

The tool returns a response with the following format:

```javascript
{
  content: [
    {
      type: 'text',
      text: 'User response: [用户输入的反馈]'
    }
  ]
}
```

If an error occurs (such as user cancellation or timeout), the response will include an error message:

```javascript
{
  content: [
    {
      type: 'text',
      text: 'Error: [错误信息]'
    }
  ],
  isError: true
}
```

## Platform Support

The feedback dialog is supported on:
- Windows
- macOS
- Linux (requires zenity, kdialog, yad, or xmessage) 