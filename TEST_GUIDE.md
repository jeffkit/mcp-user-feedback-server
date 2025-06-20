# MCP User Feedback Server 测试指南

这个项目包含了完整的 MCP (Model Context Protocol) User Feedback Server 实现以及相应的测试客户端。

## 🚀 快速开始

### 1. 安装和构建
```bash
npm install
npm run build
```

### 2. 基本使用
直接运行服务器：
```bash
npm start
# 或者
npx -y mcp-user-feedback-server@latest
```

## 🧪 测试选项

### 自动化测试 (无需用户交互)
```bash
npm run test:client
```
这个测试使用模拟的用户输入，会自动完成所有测试用例：
- ✅ 获取工具列表
- ✅ 测试基本的用户反馈功能
- ✅ 测试多轮对话

### 交互式测试 (需要用户交互)
```bash
npm run test:interactive
```
这个测试会弹出真实的操作系统对话框，需要用户手动输入：
- 🔹 基本输入对话框测试
- 🔹 带默认值的对话框测试  
- 🔹 长文本输入测试

## 📋 测试功能说明

### request_user_feedback 工具
这个工具支持以下参数：
- `question` (必需): 要显示给用户的问题或提示
- `title` (可选): 对话框的标题
- `defaultAnswer` (可选): 输入框的默认文本

### 平台支持
- **macOS**: 使用 AppleScript 显示对话框
- **Linux**: 使用 zenity 或 kdialog 显示对话框
- **Windows**: 使用 VBScript 显示对话框

## 🛠️ 开发和调试

### 本地开发模式
```bash
npm run dev
```

### 监听文件变化
```bash
npm run watch
```

### 手动编译 TypeScript
```bash
npm run build:ts
```

## 📦 发布流程

项目配置了自动发布流程：
```bash
npm publish
```

会自动：
1. 运行 `npm run build` 进行打包
2. 将所有依赖打包到单个文件中 (~167KB)
3. 发布到 npm registry

## 🔧 项目结构

```
mcp-user-feedback-server/
├── src/
│   ├── index.ts          # 主服务器文件
│   └── dialog.ts         # 跨平台对话框实现
├── dist/                 # 构建输出
├── test-client.ts        # 自动化测试客户端
├── test-client-interactive.ts # 交互式测试客户端
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript 配置
├── README.md             # 项目说明
├── USAGE_GUIDE.md        # 使用指南
└── TEST_GUIDE.md         # 测试指南 (本文件)
```

## 🐛 常见问题

### Q: 对话框没有显示？
A: 确保您在桌面环境中运行，并且安装了必要的依赖：
- macOS: 系统自带，无需额外安装
- Linux: 安装 `zenity` 或 `kdialog`
- Windows: 系统自带，无需额外安装

### Q: npx 命令失败？
A: 检查网络连接和 npm 配置，确保能访问 npm registry。

### Q: 测试客户端连接失败？
A: 确保已经运行了 `npm run build` 构建项目。

## 🎯 使用示例

### 在其他 MCP 客户端中使用
```json
{
  "mcpServers": {
    "user-feedback": {
      "command": "npx",
      "args": ["-y", "mcp-user-feedback-server@latest"]
    }
  }
}
```

### 在代码中调用
```javascript
// 基本用法
await callTool("request_user_feedback", {
  question: "请输入您的姓名:",
  title: "用户信息",
  defaultAnswer: "匿名用户"
});

// 复杂用法
await callTool("request_user_feedback", {
  question: "请描述您遇到的问题，包括具体的错误信息和重现步骤:",
  title: "问题反馈",
  defaultAnswer: ""
});
```

## 📄 许可证

MIT License - 详见 LICENSE 文件。 