import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const execAsync = promisify(exec);

export interface DialogOptions {
  title?: string;
  message: string;
  defaultText?: string;
  timeout?: number; // 超时时间，单位为秒，默认600秒（10分钟）
}

export class DialogManager {
  private static async showMacOSDialog(options: DialogOptions): Promise<string> {
    const title = options.title || 'User Feedback';
    const message = options.message.replace(/"/g, '\\"');
    const defaultText = options.defaultText || '';
    const timeout = options.timeout !== undefined ? options.timeout : 600; // 默认10分钟
    
    // 使用正确的超时语法：with timeout of xxx seconds 在最外层
    const script = `
      with timeout of ${timeout} seconds
        tell application "System Events"
          display dialog "${message}" default answer "${defaultText}" with title "${title}" buttons {"取消", "确定"} default button "确定"
          return text returned of result
        end tell
      end timeout
    `;
    
    try {
      const { stdout } = await execAsync(`osascript -e '${script}'`);
      return stdout.trim();
    } catch (error) {
      if (error instanceof Error && (error.message.includes('User canceled') || error.message.includes('cancelled'))) {
        throw new Error('User cancelled the dialog');
      } else if (error instanceof Error && (error.message.includes('timeout') || error.message.includes('timed out'))) {
        throw new Error('Dialog timed out');
      }
      throw error;
    }
  }
  
  private static async showLinuxDialog(options: DialogOptions): Promise<string> {
    const title = options.title || 'User Feedback';
    const message = options.message.replace(/"/g, '\\"'); // 转义引号，提高兼容性
    const defaultText = options.defaultText || '';
    const timeout = options.timeout !== undefined ? options.timeout : 600; // 默认10分钟
    
    // 检查可用的对话框工具
    const checkCommand = async (cmd: string): Promise<boolean> => {
      try {
        await execAsync(`which ${cmd}`);
        return true;
      } catch {
        return false;
      }
    };
    
    // 尝试多种对话框工具，按优先级排序
    const tools = [
      {
        name: 'zenity',
        available: await checkCommand('zenity'),
        command: async () => {
          const { stdout } = await execAsync(
            `zenity --entry --title="${title}" --text="${message}" --entry-text="${defaultText}" --width=400 --ok-label="确定" --cancel-label="取消" --timeout=${timeout}`
          );
          return stdout.trim();
        }
      },
      {
        name: 'kdialog',
        available: await checkCommand('kdialog'),
        command: async () => {
          const { stdout } = await execAsync(
            `timeout ${timeout} kdialog --title "${title}" --inputbox "${message}" "${defaultText}"`
          );
          return stdout.trim();
        }
      },
      {
        name: 'yad',
        available: await checkCommand('yad'),
        command: async () => {
          const { stdout } = await execAsync(
            `yad --entry --title="${title}" --text="${message}" --entry-text="${defaultText}" --width=400 --button="取消:1" --button="确定:0" --timeout=${timeout} --timeout-indicator=top`
          );
          return stdout.trim();
        }
      },
      {
        name: 'xmessage',
        available: await checkCommand('xmessage'),
        command: async () => {
          const tempFile = join(tmpdir(), `feedback_${Date.now()}.txt`);
          writeFileSync(tempFile, defaultText);
          try {
            await execAsync(
              `xmessage -buttons 确定:0,取消:1 -default 确定 -timeout ${timeout} -file ${tempFile} "${message}"`
            );
            const { stdout } = await execAsync(`cat ${tempFile}`);
            return stdout.trim();
          } finally {
            if (existsSync(tempFile)) {
              unlinkSync(tempFile);
            }
          }
        }
      }
    ];
    
    // 尝试使用可用的对话框工具
    for (const tool of tools) {
      if (tool.available) {
        try {
          return await tool.command();
        } catch (error) {
          if (error instanceof Error) {
            if (error.message.includes('124')) {
              throw new Error('Dialog timed out');
            }
            // 尝试下一个工具
            continue;
          }
        }
      }
    }
    
    // 所有工具都失败，抛出错误
    throw new Error('没有可用的图形界面对话框。请安装 zenity、kdialog、yad 或 xmessage。');
  }
  
  private static async showWindowsDialog(options: DialogOptions): Promise<string> {
    const title = options.title || 'User Feedback';
    const message = options.message.replace(/"/g, '""').replace(/\n/g, '`n'); // 处理引号和换行符
    const defaultText = options.defaultText || '';
    const timeout = options.timeout !== undefined ? options.timeout : 600; // 默认10分钟
    
    // 检查PowerShell是否可用
    const hasPowerShell = await (async () => {
      try {
        await execAsync('powershell -Command "exit"');
        return true;
      } catch {
        return false;
      }
    })();
    
    if (!hasPowerShell) {
      // 如果PowerShell不可用，使用VBS作为备选方案（不支持超时）
      const vbsScript = `
        Dim result
        result = InputBox("${message}", "${title}", "${defaultText}")
        If IsEmpty(result) Then
          WScript.Quit(1)
        Else
          WScript.Echo result
        End If
      `;
      
      const tempFile = join(tmpdir(), `dialog_${Date.now()}.vbs`);
      writeFileSync(tempFile, vbsScript);
      
      try {
        const { stdout } = await execAsync(`cscript //NoLogo "${tempFile}"`);
        return stdout.trim();
      } catch (error) {
        throw new Error('User cancelled the dialog');
      } finally {
        if (existsSync(tempFile)) {
          unlinkSync(tempFile);
        }
      }
    }
    
    // 使用PowerShell的InputBox，添加超时功能
    const script = `
      Add-Type -AssemblyName Microsoft.VisualBasic
      Add-Type -AssemblyName System.Windows.Forms

      # 创建一个取消令牌源，用于超时
      $cancelSource = New-Object System.Threading.CancellationTokenSource
      $cancelSource.CancelAfter(${timeout * 1000})

      # 在单独的任务中运行InputBox，以便能够超时
      $task = [System.Threading.Tasks.Task]::Run({
          [Microsoft.VisualBasic.Interaction]::InputBox("${message}", "${title}", "${defaultText}")
      }, $cancelSource.Token)

      try {
          # 等待任务完成或超时
          if ($task.Wait(${timeout * 1000})) {
              $result = $task.Result
              if ([string]::IsNullOrEmpty($result)) {
                  exit 1  # 用户取消
              }
              Write-Output $result
          } else {
              Write-Error "Dialog timed out"
              exit 2  # 超时
          }
      } catch {
          if ($_.Exception.InnerException -is [System.Threading.Tasks.TaskCanceledException]) {
              Write-Error "Dialog timed out"
              exit 2  # 超时
          } else {
              Write-Error $_.Exception.Message
              exit 1  # 其他错误
          }
      }
    `;
    
    // 写入脚本到临时文件并执行
    const tempFile = join(tmpdir(), `dialog_${Date.now()}.ps1`);
    writeFileSync(tempFile, script);
    
    try {
      const command = `powershell -ExecutionPolicy Bypass -File "${tempFile}"`;
      const { stdout } = await execAsync(command);
      const output = stdout.trim();
      
      if (!output) {
        throw new Error('User cancelled the dialog');
      }
      
      return output;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('exit code 1')) {
          throw new Error('User cancelled the dialog');
        } else if (error.message.includes('exit code 2') || error.message.includes('timed out')) {
          throw new Error('Dialog timed out');
        }
      }
      throw error;
    } finally {
      // 清理临时文件
      if (existsSync(tempFile)) {
        unlinkSync(tempFile);
      }
    }
  }
  
  public static async showDialog(options: DialogOptions): Promise<string> {
    const platform = process.platform;
    
    // 设置默认超时
    const enhancedOptions = { 
      ...options, 
      timeout: options.timeout !== undefined ? options.timeout : 600 // 默认10分钟超时
    };
    
    switch (platform) {
      case 'darwin':
        return this.showMacOSDialog(enhancedOptions);
      case 'linux':
        return this.showLinuxDialog(enhancedOptions);
      case 'win32':
        return this.showWindowsDialog(enhancedOptions);
      default:
        throw new Error(`不支持的平台: ${platform}`);
    }
  }
}

