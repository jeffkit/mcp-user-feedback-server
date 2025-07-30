import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { DialogManager } from './dialog.js';

const document = `
**Core Rule:** Always use the \`request_user_feedback\` tool to verify your work - never assume you got it right.  

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
`

// 解析命令行参数
function parseArgs(): { timeout: number } {
  const args = process.argv.slice(2);
  let timeout = 600; // 默认10分钟超时

  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '--timeout' || args[i] === '-t') && i + 1 < args.length) {
      const value = parseInt(args[i + 1], 10);
      if (!isNaN(value) && value > 0) {
        timeout = value;
        i++; // 跳过下一个参数，因为它是值
      }
    }
  }

  return { timeout };
}

// 解析命令行参数
const config = parseArgs();
console.error(`[配置] 对话框超时时间: ${config.timeout}秒`);

class UserFeedbackServer {
  private server: Server;
  private timeout: number;

  constructor(timeout: number) {
    this.timeout = timeout;
    this.server = new Server(
      {
        name: 'user-feedback-server',
        version: '2.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'request_user_feedback',
            description: document,
            inputSchema: {
              type: 'object',
              properties: {
                question: {
                  type: 'string',
                  description: 'The question or prompt to show to the user',
                },
                title: {
                  type: 'string',
                  description: 'Optional title for the dialog box',
                },
                defaultAnswer: {
                  type: 'string',
                  description: 'Optional default text to pre-fill in the input field',
                },
              },
              required: ['question'],
            },
          },
        ] as Tool[],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name === 'request_user_feedback') {
        try {
          const question = args?.question as string;
          const title = args?.title as string | undefined;
          const defaultAnswer = args?.defaultAnswer as string | undefined;

          if (!question) {
            throw new Error('Question parameter is required');
          }

          const userResponse = await DialogManager.showDialog({
            message: question,
            title: title,
            defaultText: defaultAnswer,
            timeout: this.timeout, // 使用全局超时设置
          });

          return {
            content: [
              {
                type: 'text',
                text: `User response: ${userResponse}`,
              },
            ],
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${errorMessage}`,
              },
            ],
            isError: true,
          };
        }
      }

      throw new Error(`Unknown tool: ${name}`);
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('User Feedback MCP server running on stdio');
  }
}

const server = new UserFeedbackServer(config.timeout);
server.run().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});

