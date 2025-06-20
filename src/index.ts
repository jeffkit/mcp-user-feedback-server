import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { DialogManager } from './dialog.js';

class UserFeedbackServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'user-feedback-server',
        version: '1.0.0',
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
            description: 'Shows a dialog box to request feedback from the user',
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

const server = new UserFeedbackServer();
server.run().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});

