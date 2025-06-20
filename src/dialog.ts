import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface DialogOptions {
  title?: string;
  message: string;
  defaultText?: string;
}

export class DialogManager {
  private static async showMacOSDialog(options: DialogOptions): Promise<string> {
    const title = options.title || 'User Feedback';
    const message = options.message.replace(/"/g, '\\"');
    const defaultText = options.defaultText || '';
    
    const script = `
      tell application "System Events"
        display dialog "${message}" default answer "${defaultText}" with title "${title}" buttons {"Cancel", "OK"} default button "OK"
        return text returned of result
      end tell
    `;
    
    try {
      const { stdout } = await execAsync(`osascript -e '${script}'`);
      return stdout.trim();
    } catch (error) {
      if (error instanceof Error && error.message.includes('User canceled')) {
        throw new Error('User cancelled the dialog');
      }
      throw error;
    }
  }
  
  private static async showLinuxDialog(options: DialogOptions): Promise<string> {
    const title = options.title || 'User Feedback';
    const message = options.message;
    const defaultText = options.defaultText || '';
    
    // Try zenity first (most common)
    try {
      const { stdout } = await execAsync(
        `zenity --entry --title="${title}" --text="${message}" --entry-text="${defaultText}"`
      );
      return stdout.trim();
    } catch (zenityError) {
      // Try kdialog (KDE)
      try {
        const { stdout } = await execAsync(
          `kdialog --title "${title}" --inputbox "${message}" "${defaultText}"`
        );
        return stdout.trim();
      } catch (kdialogError) {
        // Fallback to terminal input
        throw new Error('No GUI dialog available. Please install zenity or kdialog.');
      }
    }
  }
  
  private static async showWindowsDialog(options: DialogOptions): Promise<string> {
    const title = options.title || 'User Feedback';
    const message = options.message.replace(/"/g, '""');
    const defaultText = options.defaultText || '';
    
    const vbsScript = `
      Dim result
      result = InputBox("${message}", "${title}", "${defaultText}")
      If result = "" Then
        WScript.Quit(1)
      Else
        WScript.Echo result
      End If
    `;
    
    // Write VBS script to temp file and execute
    const tempFile = `${process.env.TEMP || '/tmp'}/dialog_${Date.now()}.vbs`;
    require('fs').writeFileSync(tempFile, vbsScript);
    
    try {
      const { stdout } = await execAsync(`cscript //NoLogo "${tempFile}"`);
      return stdout.trim();
    } catch (error) {
      throw new Error('User cancelled the dialog');
    } finally {
      // Clean up temp file
      try {
        require('fs').unlinkSync(tempFile);
      } catch {}
    }
  }
  
  public static async showDialog(options: DialogOptions): Promise<string> {
    const platform = process.platform;
    
    switch (platform) {
      case 'darwin':
        return this.showMacOSDialog(options);
      case 'linux':
        return this.showLinuxDialog(options);
      case 'win32':
        return this.showWindowsDialog(options);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }
}

