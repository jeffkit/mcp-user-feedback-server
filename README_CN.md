[README](README.md) | [中文](README_CN.md)
# MCP 用户反馈服务器

一个 Model Context Protocol (MCP) 服务器，提供通过系统对话框请求用户反馈的工具。

## 特性

- 跨平台对话框支持 (macOS, Linux, Windows)
- 单一工具：`request_user_feedback`
- 原生系统对话框集成
- 支持自定义标题和默认文本
- 易于与 Cursor、Claude Desktop 等 MCP 客户端集成

## 快速开始

### 与 MCP 客户端一起使用

该服务器设计用于与 MCP 客户端配合使用。最简单的方式是直接从 npm 安装：

```bash
npx mcp-user-feedback-server@latest
```

### 开发环境安装

```bash
npm install
npm run build
```

## MCP 客户端配置

### Cursor IDE

在 Cursor 设置中的 MCP 服务器配置部分添加：

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

在 Claude Desktop 配置文件中添加：

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

### 其他 MCP 客户端

对于任何支持 Model Context Protocol 的 MCP 客户端，您都可以使用：

- **命令**: `npx`
- **参数**: `["-y", "mcp-user-feedback-server@latest"]`

### 本地开发设置

如果您在本地开发，也可以直接运行服务器：

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

## 工具：request_user_feedback

显示对话框以请求用户反馈。

### 参数

- `question` (必需): 要显示给用户的问题或提示
- `title` (可选): 对话框标题
- `defaultAnswer` (可选): 在输入框中预填的默认文本

### 在 MCP 客户端中的使用示例

在您的 MCP 客户端中配置后，您可以在对话中使用该工具：

**示例 1: 简单问题**
```
用户: 问我最喜欢的编程语言是什么
AI: 我来问您最喜欢的编程语言。
[AI 使用 request_user_feedback 工具，问题: "您最喜欢的编程语言是什么？"]
[对话框出现在您的屏幕上]
[您输入 "TypeScript" 并点击确定]
AI: 谢谢！您提到 TypeScript 是您最喜欢的编程语言。
```

**示例 2: 自定义标题和默认值**
```
用户: 获取我的通知邮箱偏好
AI: 让我询问您的首选通知邮箱。
[AI 使用 request_user_feedback 工具，参数:
  question: "请输入您的首选通知邮箱："
  title: "邮箱设置"
  defaultAnswer: "user@example.com"]
[出现标题为"邮箱设置"的对话框]
[您修改默认邮箱并提交]
AI: 我已记录您的首选通知邮箱。
```

### 工具参数

```json
{
  "question": "您最喜欢的颜色是什么？",
  "title": "用户偏好",
  "defaultAnswer": "蓝色"
}
```

### 平台特定实现

- **macOS**: 使用 AppleScript 与 `osascript`
- **Linux**: 使用 `zenity` 或 `kdialog` (需要 GUI 环境)
- **Windows**: 使用 VBScript 与 `cscript`

## 系统要求

### macOS
- 无需额外依赖

### Linux
- 需要 `zenity` (GNOME/GTK) 或 `kdialog` (KDE)
- 安装 zenity: `sudo apt-get install zenity` (Ubuntu/Debian)

### Windows
- 无需额外依赖（使用内置 VBScript）

## 错误处理

该工具处理各种错误场景：
- 用户取消
- 缺少 GUI 环境
- 平台特定对话框故障

## 开发

项目结构：
```
src/
├── index.ts      # 主 MCP 服务器
├── dialog.ts     # 跨平台对话框管理器
```

## 测试

### 自动化测试
```bash
npm run test:client
```

### 交互式测试
```bash
npm run test:interactive
```

详细测试说明请参见 [TEST_GUIDE.md](TEST_GUIDE.md)。

## 许可证

MIT 