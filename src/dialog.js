import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, unlinkSync } from 'fs';
const execAsync = promisify(exec);
export class DialogManager {
    static async showMacOSDialog(options) {
        const title = options.title || 'User Feedback';
        const message = options.message.replace(/"/g, '\\"');
        const defaultText = options.defaultText || '';
        const isMultiline = options.multiline !== false; // 默认为多行
        let script;
        if (isMultiline) {
            // 使用 TextEdit 应用程序创建更大的文本编辑窗口
            script = `
        tell application "TextEdit"
          activate
          make new document
          set text of document 1 to "${defaultText}"
          set name of document 1 to "${title}"
        end tell
        
        display dialog "${message}

请在 TextEdit 中编辑您的反馈内容，然后点击 OK 继续。" buttons {"取消", "完成"} default button "完成" with title "${title}"
        
        tell application "TextEdit"
          set userText to text of document 1
          close document 1 without saving
        end tell
        
        return userText
      `;
        }
        else {
            // 单行对话框，但增加窗口大小
            script = `
        tell application "System Events"
          display dialog "${message}" default answer "${defaultText}" with title "${title}" buttons {"取消", "确定"} default button "确定" giving up after 300
          return text returned of result
        end tell
      `;
        }
        try {
            const { stdout } = await execAsync(`osascript -e '${script}'`);
            return stdout.trim();
        }
        catch (error) {
            if (error instanceof Error && (error.message.includes('User canceled') || error.message.includes('cancelled'))) {
                throw new Error('User cancelled the dialog');
            }
            throw error;
        }
    }
    static async showLinuxDialog(options) {
        const title = options.title || 'User Feedback';
        const message = options.message;
        const defaultText = options.defaultText || '';
        const isMultiline = options.multiline !== false; // 默认为多行
        // Try zenity first (most common)
        try {
            if (isMultiline) {
                // 创建临时文件用于默认文本
                const tempFile = `/tmp/feedback_${Date.now()}.txt`;
                writeFileSync(tempFile, defaultText);
                try {
                    const { stdout } = await execAsync(`zenity --text-info --editable --title="${title}" --width=600 --height=400 --filename="${tempFile}" --ok-label="提交" --cancel-label="取消"`);
                    return stdout.trim();
                }
                finally {
                    try {
                        unlinkSync(tempFile);
                    }
                    catch { }
                }
            }
            else {
                const { stdout } = await execAsync(`zenity --entry --title="${title}" --text="${message}" --entry-text="${defaultText}" --width=400 --ok-label="确定" --cancel-label="取消"`);
                return stdout.trim();
            }
        }
        catch (zenityError) {
            // Try kdialog (KDE)
            try {
                if (isMultiline) {
                    const { stdout } = await execAsync(`kdialog --title "${title}" --textbox /dev/stdin 600 400`);
                    return stdout.trim();
                }
                else {
                    const { stdout } = await execAsync(`kdialog --title "${title}" --inputbox "${message}" "${defaultText}"`);
                    return stdout.trim();
                }
            }
            catch (kdialogError) {
                // Fallback to terminal input
                throw new Error('没有可用的图形界面对话框。请安装 zenity 或 kdialog。');
            }
        }
    }
    static async showWindowsDialog(options) {
        const title = options.title || 'User Feedback';
        const message = options.message.replace(/"/g, '""');
        const defaultText = options.defaultText || '';
        const isMultiline = options.multiline !== false; // 默认为多行
        let script;
        if (isMultiline) {
            // 使用 PowerShell 创建多行文本输入对话框
            script = `
        Add-Type -AssemblyName System.Windows.Forms
        Add-Type -AssemblyName System.Drawing

        $form = New-Object System.Windows.Forms.Form
        $form.Text = "${title}"
        $form.Size = New-Object System.Drawing.Size(600,500)
        $form.StartPosition = "CenterScreen"
        $form.FormBorderStyle = "FixedDialog"
        $form.MaximizeBox = $false
        $form.MinimizeBox = $false

        $label = New-Object System.Windows.Forms.Label
        $label.Location = New-Object System.Drawing.Point(10,10)
        $label.Size = New-Object System.Drawing.Size(570,40)
        $label.Text = "${message}"
        $form.Controls.Add($label)

        $textbox = New-Object System.Windows.Forms.TextBox
        $textbox.Location = New-Object System.Drawing.Point(10,60)
        $textbox.Size = New-Object System.Drawing.Size(570,350)
        $textbox.Multiline = $true
        $textbox.ScrollBars = "Vertical"
        $textbox.Text = "${defaultText}"
        $textbox.Font = New-Object System.Drawing.Font("Microsoft YaHei",11)
        $form.Controls.Add($textbox)

        $okButton = New-Object System.Windows.Forms.Button
        $okButton.Location = New-Object System.Drawing.Point(410,420)
        $okButton.Size = New-Object System.Drawing.Size(80,30)
        $okButton.Text = "确定"
        $okButton.DialogResult = [System.Windows.Forms.DialogResult]::OK
        $form.AcceptButton = $okButton
        $form.Controls.Add($okButton)

        $cancelButton = New-Object System.Windows.Forms.Button
        $cancelButton.Location = New-Object System.Drawing.Point(500,420)
        $cancelButton.Size = New-Object System.Drawing.Size(80,30)
        $cancelButton.Text = "取消"
        $cancelButton.DialogResult = [System.Windows.Forms.DialogResult]::Cancel
        $form.CancelButton = $cancelButton
        $form.Controls.Add($cancelButton)

        $result = $form.ShowDialog()
        if ($result -eq [System.Windows.Forms.DialogResult]::OK) {
            Write-Output $textbox.Text
        } else {
            exit 1
        }
      `;
        }
        else {
            // 标准输入框
            script = `
        Dim result
        result = InputBox("${message}", "${title}", "${defaultText}")
        If IsEmpty(result) Then
          WScript.Quit(1)
        Else
          WScript.Echo result
        End If
      `;
        }
        // Write script to temp file and execute
        const fileExt = isMultiline ? 'ps1' : 'vbs';
        const tempFile = `${process.env.TEMP || '/tmp'}/dialog_${Date.now()}.${fileExt}`;
        writeFileSync(tempFile, script);
        try {
            const command = isMultiline
                ? `powershell -ExecutionPolicy Bypass -File "${tempFile}"`
                : `cscript //NoLogo "${tempFile}"`;
            const { stdout } = await execAsync(command);
            const output = stdout.trim();
            if (!output) {
                throw new Error('User cancelled the dialog');
            }
            return output;
        }
        catch (error) {
            if (error instanceof Error && (error.message.includes('1') || error.message.includes('cancelled'))) {
                throw new Error('User cancelled the dialog');
            }
            throw new Error('User cancelled the dialog');
        }
        finally {
            // Clean up temp file
            try {
                unlinkSync(tempFile);
            }
            catch { }
        }
    }
    static async showDialog(options) {
        const platform = process.platform;
        // 设置默认为多行模式
        const enhancedOptions = { ...options, multiline: options.multiline !== false };
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
