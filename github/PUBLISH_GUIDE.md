# Smart Task-Model Selector 发布指南

> **适用人群**：零基础用户，手把手教学
> **预计总耗时**：2-3小时（首次发布）

---

## 📋 发布前准备清单

在开始之前，请准备好以下信息和账号：

### 必需账号
- [ ] **GitHub 账号** - 用于代码托管和市场发布
- [ ] **npm 账号** - 用于 npm 包发布
- [ ] **CodeBuddy 账号** - 用于 CodeBuddy 市场发布

### 必需信息
- [ ] GitHub 用户名（例如：`yourusername`）
- [ ] npm 用户名（例如：`yournpmusername`）
- [ ] 邮箱地址（用于验证）
- [ ] 技能名称：`smart-task-model-selector`
- [ ] 技能描述：智能任务模型选择器

### 必需软件
- [ ] **Git** - 版本控制工具
- [ ] **Node.js** (版本 14 或更高)
- [ ] **PowerShell** 或 **命令提示符**

**检查软件是否安装**：
```powershell
# 检查 Git
git --version

# 检查 Node.js
node --version

# 检查 npm
npm --version
```

如果显示版本号，说明已安装。如果提示"命令不存在"，请先安装相应软件。

---

## 🚀 发布流程概览

```
第一步：准备工作 ────────────── 30分钟
    ↓
第二步：发布到 GitHub ────────── 20分钟
    ↓
第三步：发布到 npm ──────────── 15分钟
    ↓
第四步：发布到 CodeBuddy 市场 ── 25分钟
    ↓
完成！🎉
```

---

## 第一步：发布到 GitHub

### 1.1 创建 GitHub 仓库

**预计时间**：10分钟

#### 操作步骤：

1. **登录 GitHub**
   - 打开浏览器，访问：https://github.com
   - 输入用户名和密码登录

2. **创建新仓库**
   - 点击页面右上角的 **+** 号
   - 选择 **"New repository"**（新建仓库）

   📸 **截图指引**：
   ```
   位置：页面右上角，头像旁边
   图标：+ 号
   菜单项：New repository
   ```

3. **填写仓库信息**
   - **Repository name**（仓库名称）：`smart-task-model-selector`
   - **Description**（描述）：`智能任务模型选择器 - 自动选择最佳AI模型完成任务`
   - 选择 **Public**（公开）- 这样才能被其他人看到
   - ✅ 勾选 **"Add a README file"**（添加 README 文件）
   - 点击 **"Create repository"**（创建仓库）

   📸 **截图指引**：
   ```
   Repository name: [smart-task-model-selector]
   Description: [智能任务模型选择器]
   ☑ Public
   ☑ Add a README file
   [Create repository] 按钮（绿色）
   ```

### 1.2 上传代码到 GitHub

**预计时间**：10分钟

#### 方法一：使用 Git 命令行（推荐）

1. **打开 PowerShell**
   - 按 `Win + R`，输入 `powershell`，按回车

2. **配置 Git（首次使用）**
   ```powershell
   # 设置用户名（替换为你的 GitHub 用户名）
   git config --global user.name "yourusername"
   
   # 设置邮箱（替换为你的 GitHub 邮箱）
   git config --global user.email "your email@example.com"
   ```

3. **克隆仓库到本地**
   ```powershell
   # 进入工作目录
   cd C:\Users\leven\.workbuddy\skills
   
   # 克隆仓库（替换为你的 GitHub 用户名）
   git clone https://github.com/yourusername/smart-task-model-selector.git
   ```

4. **复制技能文件到仓库**
   ```powershell
   # 进入仓库目录
   cd smart-task-model-selector
   
   # 创建目录结构
   mkdir github
   mkdir dist
   
   # 复制技能文件（从现有技能目录）
   Copy-Item "..\Smart Task-Model Selector\SKILL.md" -Destination "."
   Copy-Item "..\Smart Task-Model Selector\github\*" -Destination ".\github\" -Recurse
   ```

5. **提交并推送代码**
   ```powershell
   # 添加所有文件到 Git
   git add .
   
   # 提交更改
   git commit -m "初始提交：Smart Task-Model Selector v1.0.0"
   
   # 推送到 GitHub
   git push origin main
   ```

   📸 **截图指引**：
   ```
   成功标志：
   - PowerShell 显示 "Uploading objects: 100%"
   - 浏览器刷新 GitHub 仓库页面，能看到上传的文件
   ```

#### 方法二：使用 GitHub 网页上传（简单但文件多时较慢）

1. 在 GitHub 仓库页面，点击 **"Add file"** → **"Upload files"**
2. 拖拽文件到页面中
3. 填写提交信息：`初始提交：Smart Task-Model Selector v1.0.0`
4. 点击 **"Commit changes"**

### 1.3 创建 GitHub Release

**预计时间**：5分钟

1. 在 GitHub 仓库页面，点击右侧的 **"Releases"** 链接
2. 点击 **"Create a new release"**（创建新发布）
3. 填写发布信息：
   - **Tag version**：`v1.0.0`
   - **Release title**：`Smart Task-Model Selector v1.0.0`
   - **Description**（描述）：
     ```markdown
     ## 功能特性
     - ✨ 智能分析任务类型
     - 🎯 自动匹配最佳 AI 模型
     - 🚀 提升任务执行效率
     
     ## 安装方法
     详见 README.md
     ```
4. 点击 **"Publish release"**（发布）

---

## 第二步：发布到 npm

### 2.1 注册 npm 账号

**预计时间**：5分钟

1. 打开浏览器，访问：https://www.npmjs.com
2. 点击页面右上角 **"Sign Up"**（注册）
3. 填写信息：
   - **Username**（用户名）
   - **Email**（邮箱）
   - **Password**（密码）
4. 查收邮箱，点击验证链接激活账号

### 2.2 登录 npm（在命令行）

**预计时间**：2分钟

```powershell
# 登录 npm
npm login
```

执行后会提示输入：
- **Username**：你的 npm 用户名
- **Password**：你的 npm 密码
- **Email**：你的邮箱
- **One-time password**：邮箱收到的一次性密码

📸 **截图指引**：
```
PowerShell 提示信息：
Username: yourusername
Password: ********
Email: your email@example.com
```

### 2.3 准备 npm 包文件

**预计时间**：5分钟

确保你的技能目录包含以下文件：

1. **package.json**（包配置文件）
   
   创建 `package.json`：
   ```powershell
   # 在技能目录中执行
   cd C:\Users\leven\.workbuddy\skills\Smart Task-Model Selector
   
   # 创建 package.json
   npm init -y
   ```

   然后编辑 `package.json`，修改为：
   ```json
   {
     "name": "smart-task-model-selector",
     "version": "1.0.0",
     "description": "智能任务模型选择器 - 自动选择最佳AI模型完成任务",
     "main": "dist/index.js",
     "scripts": {
       "build": "echo 'Build script here'",
       "test": "echo 'Test script here'"
     },
     "keywords": [
       "codebuddy",
       "ai",
       "model-selector",
       "task-automation"
     ],
     "author": "Your Name <your email@example.com>",
     "license": "MIT",
     "repository": {
       "type": "git",
       "url": "https://github.com/yourusername/smart-task-model-selector.git"
     },
     "bugs": {
       "url": "https://github.com/yourusername/smart-task-model-selector/issues"
     },
     "homepage": "https://github.com/yourusername/smart-task-model-selector#readme"
   }
   ```

   ⚠️ **注意**：将 `yourusername` 替换为你的 GitHub 用户名

2. **.npmignore**（可选，排除不需要的文件）
   
   创建 `.npmignore` 文件：
   ```
   .git
   .gitignore
   node_modules
   *.md
   test
   ```

### 2.4 发布到 npm

**预计时间**：3分钟

```powershell
# 确保你在技能目录中
cd C:\Users\leven\.workbuddy\skills\Smart Task-Model Selector

# 发布包
npm publish
```

📸 **截图指引**：
```
成功标志：
+ smart-task-model-selector@1.0.0
```

#### 常见错误及解决方法：

**错误 1**：`ECONNREFUSED`
- 原因：未登录 npm
- 解决：运行 `npm login` 重新登录

**错误 2**：`package name already exists`
- 原因：包名已被占用
- 解决：修改 `package.json` 中的 `name` 字段，例如改为 `smart-task-model-selector-leven`

**错误 3**：`You do not have permission to publish`
- 原因：包名属于其他作用域
- 解决：使用作用域包名，例如 `@yourusername/smart-task-model-selector`

### 2.5 验证发布成功

1. 打开浏览器，访问：https://www.npmjs.com/package/smart-task-model-selector
2. 如果看到你的包页面，说明发布成功！

---

## 第三步：发布到 CodeBuddy 市场

### 3.1 了解 CodeBuddy 技能市场

CodeBuddy 技能市场是 CodeBuddy 用户发现和安装技能的地方。

**发布方式**：
- 方式 A：通过 GitHub 自动发布（推荐）
- 方式 B：手动提交到 CodeBuddy 技能仓库

### 3.2 方式 A：通过 GitHub 自动发布（推荐）

**预计时间**：15分钟

#### 步骤 1：Fork CodeBuddy 技能仓库

1. 访问：https://github.com/codebuddy/skills（示例链接，实际链接可能不同）
2. 点击页面右上角的 **"Fork"** 按钮
3. 等待 Fork 完成

#### 步骤 2：添加你的技能

1. 在你的 Fork 仓库中，创建新分支：
   ```powershell
   # 克隆你 Fork 的仓库
   git clone https://github.com/yourusername/skills.git
   cd skills
   
   # 创建新分支
   git checkout -b add-smart-task-model-selector
   ```

2. 创建技能目录：
   ```powershell
   mkdir smart-task-model-selector
   cd smart-task-model-selector
   ```

3. 创建 `SKILL.md` 文件（技能描述文件）：
   ```markdown
   # Smart Task-Model Selector
   
   ## 描述
   智能任务模型选择器，自动分析任务类型并选择最佳AI模型。
   
   ## 安装
   ```
   bash
   npm install smart-task-model-selector
   ```
   
   ## 使用方法
   1. 在 CodeBuddy 中启用此技能
   2. 输入任务描述
   3. 技能自动选择最佳模型
   
   ## 特性
   - ✨ 智能任务分析
   - 🎯 自动模型匹配
   - 📊 性能优化建议
   
   ## 作者
   Your Name
   
   ## 许可证
   MIT
   ```

4. 提交并推送：
   ```powershell
   git add .
   git commit -m "Add smart-task-model-selector skill"
   git push origin add-smart-task-model-selector
   ```

#### 步骤 3：创建 Pull Request

1. 访问你 Fork 的仓库页面
2. 点击 **"Compare & pull request"** 按钮
3. 填写 PR 信息：
   - **Title**：`Add smart-task-model-selector skill`
   - **Description**：
     ```markdown
     ## 技能名称
     Smart Task-Model Selector
     
     ## 功能描述
     智能任务模型选择器，自动分析任务类型并选择最佳AI模型。
     
     ## 安装方法
     npm install smart-task-model-selector
     
     ## 测试截图
     （如果有的话，添加截图）
     ```
4. 点击 **"Create pull request"**

#### 步骤 4：等待审核

- CodeBuddy 团队会审核你的技能
- 审核时间：通常 1-3 个工作日
- 审核通过后，技能会出现在 CodeBuddy 市场中

### 3.3 方式 B：手动提交（备选）

**预计时间**：25分钟

如果方式 A 不适用，可以手动提交：

1. **准备技能包**
   - 打包所有技能文件为 ZIP
   - 确保包含 `SKILL.md`、`package.json` 等必需文件

2. **提交到 CodeBuddy**
   - 访问 CodeBuddy 官网：https://codebuddy.com（示例链接）
   - 找到"技能提交"或"Submit Skill"页面
   - 填写技能信息表单
   - 上传技能包 ZIP 文件
   - 提交审核

3. **等待审核**
   - 审核时间：3-5 个工作日
   - 审核结果会通过邮件通知

---

## 📝 发布后检查清单

发布完成后，请检查以下项目：

### GitHub 检查
- [ ] 仓库可见（Public）
- [ ] README.md 显示正确
- [ ] Release 已创建
- [ ] 代码可以正常克隆

### npm 检查
- [ ] 包页面可以访问
- [ ] 安装命令有效：`npm install smart-task-model-selector`
- [ ] 包信息正确（描述、作者、许可证等）

### CodeBuddy 市场检查
- [ ] Pull Request 已提交
- [ ] 审核状态可查
- [ ] （审核通过后）技能在市场中可见

---

## 🔄 更新已发布的技能

当你的技能有更新时，需要发布新版本。

### 更新流程

1. **更新版本号**
   
   修改 `package.json` 中的 `version` 字段：
   - 小改动：`1.0.0` → `1.0.1`
   - 新功能：`1.0.0` → `1.1.0`
   - 大改动：`1.0.0` → `2.0.0`

2. **更新 GitHub**
   ```powershell
   git add .
   git commit -m "更新：v1.0.1 - 修复bug"
   git tag v1.0.1
   git push origin main --tags
   ```

3. **更新 npm**
   ```powershell
   npm publish
   ```

4. **更新 CodeBuddy 市场**
   - 更新 Pull Request 或提交新的 PR

---

## ❓ 常见问题解答

### Q1：我从未使用过 Git，怎么办？

**A**：推荐使用 [GitHub Desktop](https://desktop.github.com)（图形界面工具）：
1. 下载并安装 GitHub Desktop
2. 登录你的 GitHub 账号
3. 点击"Clone a repository"克隆仓库
4. 将文件拖入仓库文件夹
5. 在 GitHub Desktop 中填写摘要，点击"Commit to main"
6. 点击"Push origin"推送到 GitHub

### Q2：npm 发布失败，提示"package name too similar"？

**A**：包名与现有包太相似，解决方法：
1. 修改 `package.json` 中的 `name` 字段
2. 添加前缀或后缀，例如：`smart-task-model-selector-pro`
3. 重新运行 `npm publish`

### Q3：如何知道我的技能是否通过审核？

**A**：
- **GitHub PR**：在 Pull Request 页面查看审核状态
- **邮件通知**：CodeBuddy 会发送审核结果到你的邮箱
- **市场页面**：审核通过后，在 CodeBuddy 市场中搜索你的技能名称

### Q4：我可以删除已发布的包吗？

**A**：
- **npm**：可以，但有限制（发布后 72 小时内可删除）
  ```powershell
  npm unpublish smart-task-model-selector --force
  ```
- **GitHub**：可以删除仓库（Settings → Danger Zone → Delete repository）
- **CodeBuddy**：需要联系管理员删除

### Q5：发布需要多少钱？

**A**：
- **GitHub**：免费（公开仓库）
- **npm**：免费
- **CodeBuddy 市场**：免费

---

## 📚 附加资源

### 官方文档
- [GitHub 文档](https://docs.github.com)
- [npm 文档](https://docs.npmjs.com)
- [CodeBuddy 文档](https://docs.codebuddy.com)（示例链接）

### 视频教程
- [Git 入门教程](https://www.youtube.com/watch?v=SWYqp7iY_Tc)
- [npm 包发布教程](https://www.youtube.com/watch?v=3IbigjCEA2w)

### 社区支持
- [GitHub Community](https://github.community)
- [Stack Overflow](https://stackoverflow.com) - 搜索标签 `npm`、`github`

---

## ✅ 发布成功标志

当你完成所有步骤后，应该能看到：

1. **GitHub**
   - 仓库地址：https://github.com/yourusername/smart-task-model-selector
   - 绿色 ✅ 的 README 显示

2. **npm**
   - 包页面：https://www.npmjs.com/package/smart-task-model-selector
   - 显示版本号、下载量等信息

3. **CodeBuddy 市场**
   - 在 CodeBuddy 中搜索 `smart-task-model-selector` 能找到
   - 可以点击"安装"按钮

---

## 🎉 恭喜！

你现在知道如何发布技能到三个平台了！

**下一步建议**：
1. 分享你的技能给朋友和社区
2. 收集用户反馈，持续改进
3. 添加更多功能，发布新版本
4. 在其他平台（如 Product Hunt）推广你的技能

**需要帮助？**
- 查看 [CodeBuddy 社区论坛](https://community.codebuddy.com)（示例链接）
- 在 GitHub 仓库中提交 Issue
- 联系作者：your-email@example.com

---

**文档版本**：1.0.0  
**最后更新**：2026-05-09  
**作者**：CodeBuddy User
