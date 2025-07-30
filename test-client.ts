#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

class TestClient {
  private client: Client;
  private transport: StdioClientTransport;
  private serverArgs: string[];

  constructor(serverArgs: string[] = []) {
    this.client = new Client(
      {
        name: 'test-client',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.serverArgs = serverArgs;

    // 创建传输层，使用本地编译好的服务器
    this.transport = new StdioClientTransport({
      command: 'node',
      args: ['dist/index.js', ...this.serverArgs],
    });
  }

  async startServer() {
    console.log('🚀 启动 MCP User Feedback Server...');
    if (this.serverArgs.length > 0) {
      console.log(`   参数: ${this.serverArgs.join(' ')}`);
    }
    
    // 连接客户端（会自动启动传输层）
    await this.client.connect(this.transport);
    console.log('✅ 客户端已连接到服务器');
  }

  async testListTools() {
    console.log('\n📋 测试获取工具列表...');
    
    try {
      const response = await this.client.listTools();
      console.log('✅ 工具列表获取成功:');
      response.tools.forEach((tool, index) => {
        console.log(`   ${index + 1}. ${tool.name}: ${tool.description}`);
      });
      return response.tools;
    } catch (error) {
      console.error('❌ 获取工具列表失败:', error);
      throw error;
    }
  }

  async testRequestUserFeedback() {
    console.log('\n💬 测试请求用户反馈...');
    
    try {
      const response = await this.client.callTool({
        name: 'request_user_feedback',
        arguments: {
          question: '请输入您的姓名:',
          title: 'MCP 测试',
          defaultAnswer: 'Claude'
        }
      }) as CallToolResult;

      console.log('✅ 用户反馈工具调用成功:');
      if (response.content && Array.isArray(response.content) && response.content[0]) {
        const content = response.content[0] as any;
        console.log('   响应:', content.text);
      }
      return response;
    } catch (error) {
      console.error('❌ 用户反馈工具调用失败:', error);
      throw error;
    }
  }

  async testMultipleFeedbacks() {
    console.log('\n🔄 测试多次用户反馈...');
    
    const questions = [
      {
        question: '您最喜欢的编程语言是什么?',
        title: '编程调查',
        defaultAnswer: 'TypeScript'
      },
      {
        question: '您对这个 MCP 服务器的评价如何? (1-10分)',
        title: '满意度调查',
        defaultAnswer: '10'
      }
    ];

    for (let i = 0; i < questions.length; i++) {
      const { question, title, defaultAnswer } = questions[i];
      console.log(`\n   问题 ${i + 1}/${questions.length}:`);
      
      try {
        const response = await this.client.callTool({
          name: 'request_user_feedback',
          arguments: { question, title, defaultAnswer }
        }) as CallToolResult;
        
        if (response.content && Array.isArray(response.content) && response.content[0]) {
          const content = response.content[0] as any;
          console.log(`   ✅ 回答: ${content.text}`);
        }
      } catch (error) {
        console.error(`   ❌ 问题 ${i + 1} 失败:`, error);
      }
    }
  }

  async testTimeoutParameter() {
    console.log('\n⏱️ 测试超时参数...');
    console.log('   (请等待对话框显示，然后不要操作它，等待超时)');
    
    try {
      const response = await this.client.callTool({
        name: 'request_user_feedback',
        arguments: {
          question: '这个对话框将在设置的超时时间后自动关闭。请不要点击任何按钮，等待超时。',
          title: '超时测试',
          defaultAnswer: ''
        }
      }) as CallToolResult;
      
      console.log('   响应:', response);
      
      if (response.isError) {
        console.log('   ✅ 对话框已正确超时');
      } else {
        console.log('   ❓ 对话框未超时，可能是用户手动关闭了对话框');
      }
      
      return response;
    } catch (error) {
      console.error('   ❌ 测试超时参数失败:', error);
      throw error;
    }
  }

  async cleanup() {
    console.log('\n🧹 清理资源...');
    
    try {
      await this.client.close();
      console.log('✅ 客户端连接已关闭');
    } catch (error) {
      console.error('❌ 关闭客户端失败:', error);
    }

    try {
      await this.transport.close();
      console.log('✅ 传输层已关闭');
    } catch (error) {
      console.error('❌ 关闭传输层失败:', error);
    }
  }

  async runTests(includeTimeoutTest: boolean = false) {
    try {
      await this.startServer();
      
      // 等待服务器初始化
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const tools = await this.testListTools();
      
      if (tools.length > 0) {
        await this.testRequestUserFeedback();
        await this.testMultipleFeedbacks();
        
        if (includeTimeoutTest) {
          await this.testTimeoutParameter();
        }
      }
      
      console.log('\n🎉 所有测试完成！');
      
    } catch (error) {
      console.error('\n💥 测试过程中出错:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const serverArgs: string[] = [];
  let testTimeout = false;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--test-timeout') {
      testTimeout = true;
    } else if (args[i] === '--server-timeout' && i + 1 < args.length) {
      serverArgs.push('--timeout', args[i + 1]);
      i++; // 跳过值参数
    } else {
      serverArgs.push(args[i]);
    }
  }
  
  return { serverArgs, testTimeout };
}

// 解析命令行参数
const { serverArgs, testTimeout } = parseArgs();

// 运行测试
const testClient = new TestClient(serverArgs);

// 处理进程退出
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  收到中断信号，正在清理...');
  await testClient.cleanup();
  process.exit(0);
});

process.on('uncaughtException', async (error) => {
  console.error('\n💥 未捕获的异常:', error);
  await testClient.cleanup();
  process.exit(1);
});

// 启动测试
testClient.runTests(testTimeout).catch(async (error) => {
  console.error('💥 测试启动失败:', error);
  await testClient.cleanup();
  process.exit(1);
}); 