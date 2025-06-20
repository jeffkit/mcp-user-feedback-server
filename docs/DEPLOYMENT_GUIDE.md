# GitHub Pages 部署指南 | GitHub Pages Deployment Guide

[中文](#中文版) | [English](#english-version)

---

## 中文版

### 📋 部署前准备

1. **确保您有 GitHub 账户**
2. **确保您有项目的管理员权限**
3. **确认项目根目录有 `docs/` 文件夹**

### 🚀 部署步骤

#### 第 1 步：推送文件到 GitHub

首先，确保所有文件已推送到您的 GitHub 仓库：

```bash
# 添加所有文件
git add .

# 提交更改
git commit -m "Add GitHub Pages site"

# 推送到 GitHub
git push origin main
```

#### 第 2 步：启用 GitHub Pages

1. 打开您的 GitHub 仓库页面
2. 点击 **Settings**（设置）选项卡
3. 向下滚动到 **Pages**（页面）部分
4. 在 **Source**（源）下拉菜单中选择 **Deploy from a branch**
5. 选择 **main** 分支
6. 选择 **/ docs** 文件夹
7. 点击 **Save**（保存）

#### 第 3 步：访问您的网站

- 几分钟后，您的网站将在以下地址可用：
  ```
  https://[您的用户名].github.io/[仓库名称]/
  ```

### 🔧 自定义域名（可选）

如果您想使用自定义域名：

1. 在 **Pages** 设置中，找到 **Custom domain** 部分
2. 输入您的域名（例如：`mcp-feedback.yourdomain.com`）
3. 点击 **Save**
4. 在您的域名 DNS 设置中添加 CNAME 记录：
   ```
   CNAME mcp-feedback [您的用户名].github.io
   ```

### 📱 网站特性

您的 GitHub Pages 网站包含以下特性：

- ✅ **响应式设计** - 在所有设备上完美显示
- ✅ **中英文双语** - 点击右上角语言切换器
- ✅ **代码高亮** - 使用 Prism.js 实现
- ✅ **现代 UI** - 使用 Tailwind CSS 构建
- ✅ **快速加载** - 优化的静态资源
- ✅ **SEO 友好** - 包含完整的元数据

### 🎨 自定义网站

您可以通过编辑以下文件来自定义网站：

- `docs/index.html` - 英文版主页
- `docs/zh.html` - 中文版主页
- 修改 CSS 样式或添加新的页面

### 🔄 更新网站

要更新网站内容：

1. 编辑 `docs/` 文件夹中的文件
2. 提交并推送更改到 GitHub
3. GitHub Pages 将自动重新部署（通常需要几分钟）

### 📊 流量监控

您可以通过以下方式监控网站流量：

1. **GitHub Insights** - 在仓库的 Insights 选项卡中查看流量
2. **Google Analytics** - 添加跟踪代码到 HTML 文件中
3. **第三方工具** - 如 Plausible 或 Simple Analytics

### ⚠️ 故障排除

**常见问题：**

1. **404 错误**
   - 确保文件路径正确
   - 确认 GitHub Pages 已正确配置

2. **样式未加载**
   - 检查 CDN 链接是否可访问
   - 确认路径没有错误

3. **更新未生效**
   - GitHub Pages 可能需要几分钟来更新
   - 尝试清除浏览器缓存

---

## English Version

### 📋 Prerequisites

1. **Ensure you have a GitHub account**
2. **Ensure you have admin access to the repository**
3. **Confirm the project has a `docs/` folder in the root directory**

### 🚀 Deployment Steps

#### Step 1: Push Files to GitHub

First, ensure all files are pushed to your GitHub repository:

```bash
# Add all files
git add .

# Commit changes
git commit -m "Add GitHub Pages site"

# Push to GitHub
git push origin main
```

#### Step 2: Enable GitHub Pages

1. Open your GitHub repository page
2. Click the **Settings** tab
3. Scroll down to the **Pages** section
4. Under **Source**, select **Deploy from a branch**
5. Choose **main** branch
6. Select **/ docs** folder
7. Click **Save**

#### Step 3: Access Your Website

- After a few minutes, your website will be available at:
  ```
  https://[your-username].github.io/[repository-name]/
  ```

### 🔧 Custom Domain (Optional)

If you want to use a custom domain:

1. In **Pages** settings, find the **Custom domain** section
2. Enter your domain (e.g., `mcp-feedback.yourdomain.com`)
3. Click **Save**
4. Add a CNAME record in your domain's DNS settings:
   ```
   CNAME mcp-feedback [your-username].github.io
   ```

### 📱 Website Features

Your GitHub Pages website includes the following features:

- ✅ **Responsive Design** - Perfect display on all devices
- ✅ **Bilingual Support** - Click the language switcher in the top-right
- ✅ **Code Highlighting** - Powered by Prism.js
- ✅ **Modern UI** - Built with Tailwind CSS
- ✅ **Fast Loading** - Optimized static assets
- ✅ **SEO Friendly** - Complete metadata included

### 🎨 Customizing the Website

You can customize the website by editing:

- `docs/index.html` - English homepage
- `docs/zh.html` - Chinese homepage
- Modify CSS styles or add new pages

### 🔄 Updating the Website

To update website content:

1. Edit files in the `docs/` folder
2. Commit and push changes to GitHub
3. GitHub Pages will automatically redeploy (usually takes a few minutes)

### 📊 Traffic Monitoring

You can monitor website traffic through:

1. **GitHub Insights** - View traffic in your repository's Insights tab
2. **Google Analytics** - Add tracking code to HTML files
3. **Third-party tools** - Such as Plausible or Simple Analytics

### ⚠️ Troubleshooting

**Common Issues:**

1. **404 Errors**
   - Ensure file paths are correct
   - Confirm GitHub Pages is properly configured

2. **Styles Not Loading**
   - Check if CDN links are accessible
   - Confirm paths are correct

3. **Updates Not Reflecting**
   - GitHub Pages may take a few minutes to update
   - Try clearing browser cache

### 🎯 Best Practices

1. **Regular Updates** - Keep content fresh and accurate
2. **Performance** - Optimize images and minimize file sizes
3. **Analytics** - Monitor user behavior to improve the site
4. **Security** - Use HTTPS (enabled by default on GitHub Pages)

---

### 📞 支持 | Support

如果您在部署过程中遇到问题，请：
If you encounter issues during deployment, please:

- 查看 GitHub Pages 官方文档 | Check the official GitHub Pages documentation
- 在项目仓库中提交 Issue | Submit an issue in the project repository
- 联系项目维护者 | Contact the project maintainers

**有用链接 | Useful Links:**
- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [自定义域名指南](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [故障排除指南](https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting-404-errors-for-github-pages-sites) 