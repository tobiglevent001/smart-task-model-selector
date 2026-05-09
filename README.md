# Smart Task-Model Selector
## 智能任务模型选择器

[![npm version](assets/badge-version.svg)](assets/badge-version.svg)
[![npm](assets/badge-npm.svg)](assets/badge-npm.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue.svg)](https://github.com/tobiglevent001/smart-task-model-selector)
[![Language: JavaScript](https://img.shields.io/badge/Language-JavaScript-green.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

> 智能 AI 模型推荐工具 - 根据任务类型、Token 预估、成本预算自动推荐最优模型

✨ 让每一次 AI 调用都恰到好处

---

## ✨ 功能特点

### 🎯 智能任务分析
- 自动识别任务类型（代码生成/文案写作/搜索研究/AI 绘画等）
- 评估任务复杂度（简单/中等/复杂）
- 提取技术要求（数据库/API/安全/测试等）
- 多维度置信度评估

### 💰 Token 消耗预估（三档）
```
┌─────────────┬──────────────┬──────────────┐
│   预估级别   │   Token 数量  │   预估成本    │
├─────────────┼──────────────┼──────────────┤
│   🟢 最小   │     800      │    ¥0.0004   │
│   🟡 平均   │    1,200     │    ¥0.0006   │
│   🔴 最大   │    2,500     │    ¥0.0013   │
└─────────────┴──────────────┴──────────────┘
```

### ⭐ 用户动态选择（核心特色）

**预估精度选择**
```
请选择 Token 预估精度：
[1] 标准精度（快速，±30% 误差）- 推荐日常使用
[2] 高精度（较慢，±10% 误差）- 适合预算敏感场景
```

**优化偏好选择**
```
请选择您的优化偏好：
[1] 🆓 省钱优先 - 优先推荐免费/低成本模型
[2] ⚖️ 平衡模式 - 性价比最优（推荐）
[3] 💎 效果优先 - 优先推荐效果最好的模型
[4] 💰 设置预算上限 - 自定义最高成本
```

### 🏆 三档模型推荐
| 档次 | 说明 | 代表模型 |
|------|------|----------|
| 🆓 免费首选 | 完全免费的模型 | 通义千问 Coder |
| ⚖️ 性价比之选 | 效果与成本平衡最优 | DeepSeek Coder |
| 💎 效果最佳 | 效果最好但成本较高 | Claude 3.5 Sonnet |

### 📊 成本对比与洞察
- 显示所有候选模型的成本对比表
- 智能提示"最贵 vs 最便宜"的差距
- 预算超限时提供拆分建议

### 🌍 国内外平台偏好支持
- 自动识别用户可访问的模型
- 支持配置国内/国际平台偏好
- 详细标注访问要求（免费/需注册/需 API Key）

---

## 🚀 快速开始

### 方式一：通过 Skill 命令调用（推荐）

在 CodeBuddy/WorkBuddy 中输入：
```bash
/smart-task-model-selector 帮我写一个用户登录功能
```

然后按照交互提示选择：
1. 预估精度（标准/高精度）
2. 优化偏好（省钱/平衡/效果/预算上限）
3. 确认推荐的模型

### 方式二：配置偏好
```bash
/smart-task-model-selector --config
```

### 方式三：作为 Node.js 模块使用
```javascript
const AIModelSelector = require('./index.js');

const selector = new AIModelSelector();

// 分析任务并推荐模型
const result = await selector.selectModel(
  '帮我写一个用户登录功能',
  {
    accuracyMode: 'standard',
    optimizationPreference: 'balanced'
  }
);

// 处理用户选择
const executionResult = await selector.handleUserChoice(2, result);
```

---

## 📊 支持的模型

### 代码生成类

| 模型 | 区域 | 上下文 | 免费额度 | 评分 |
|------|------|--------|----------|------|
| 通义千问 Coder | 🇨🇳 国内 | 8K | 完全免费 | ⭐85 |
| DeepSeek Coder | 🇨🇳 国内 | 16K | 500K tokens/月 | ⭐92 |
| GPT-4o | 🌍 国际 | 128K | 有限 | ⭐90 |
| GPT-3.5 Turbo | 🌍 国际 | 16K | 付费 | ⭐75 |
| Claude 3.5 Sonnet | 🌍 国际 | 200K | 无 | ⭐98 |

### 文案写作类

| 模型 | 区域 | 上下文 | 免费额度 | 评分 |
|------|------|--------|----------|------|
| Claude 3.5 Haiku | 🌍 国际 | 200K | 无 | ⭐82 |
| GPT-4o mini | 🌍 国际 | 128K | 有限 | ⭐78 |

### 搜索研究类

| 模型 | 区域 | 上下文 | 免费额度 | 评分 |
|------|------|--------|----------|------|
| Perplexity AI | 🌍 国际 | 32K | 每日有限 | ⭐88 |

### AI 绘画类

| 模型 | 区域 | 部署方式 | 免费额度 | 评分 |
|------|------|----------|----------|------|
| Stable Diffusion | 🌍 国际 | 本地部署 | 开源免费 | ⭐80 |

### 数据分析类

| 模型 | 区域 | 上下文 | 免费额度 | 评分 |
|------|------|--------|----------|------|
| Claude 3.5 Sonnet | 🌍 国际 | 200K | 无 | ⭐95 |

---

## 💡 使用示例

### 完整推荐展示

```
┌─────────────────────────────────────────────────────────────────────┐
│                        📋 任务分析结果                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   任务类型：代码生成                 复杂度：中等                      │
│   技术要求：[PHP, MySQL, Session]                                    │
│   置信度：⭐⭐⭐⭐                                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        📊 Token 消耗预估                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────┬──────────────┬──────────────┬─────────────────┐   │
│   │  预估级别   │  Token 数量  │   预估成本   │    说明         │   │
│   ├─────────────┼──────────────┼──────────────┼─────────────────┤   │
│   │   🟢 最小   │     800      │   ¥0.0004   │  理想情况       │   │
│   │   🟡 平均   │    1,200     │   ¥0.0006   │  标准情况       │   │
│   │   🔴 最大   │    2,500     │   ¥0.0013   │  复杂情况       │   │
│   └─────────────┴──────────────┴──────────────┴─────────────────┘   │
│                                                                     │
│   ⏱️ 预计耗时：30-90 秒                                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

请选择 Token 预估精度：
[1] 标准精度（快速，±30% 误差）
[2] 高精度（较慢，±10% 误差）
用户选择：1

请选择优化偏好：
[1] 🆓 省钱优先
[2] ⚖️ 平衡模式（推荐）
[3] 💎 效果优先
[4] 💰 设置预算上限
用户选择：2

┌─────────────────────────────────────────────────────────────────────┐
│                        🏆 模型推荐对比                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ╔═══════════════════════════════════════════════════════════════╗ │
│   ║  🆓 免费首选：通义千问 Coder                                   ║ │
│   ╠═══════════════════════════════════════════════════════════════╣ │
│   ║  区域：🇨🇳 国内 | 访问：✅ 免费使用                             ║ │
│   ║  成本：¥0 - ¥0                                                 ║ │
│   ║  耗时：45-90 秒                                                 ║ │
│   ║  ⭐ 效果：⭐⭐⭐⭐ (4/5)                                       ║ │
│   ║  ✅ 推荐理由：完全免费，中文友好，适合简单-中等任务              ║ │
│   ╚═══════════════════════════════════════════════════════════════╝ │
│                                                                     │
│   ╔═══════════════════════════════════════════════════════════════╗ │
│   ║  ⚖️ 性价比之选：DeepSeek Coder                                ║ │
│   ╠═══════════════════════════════════════════════════════════════╣ │
│   ║  区域：🇨🇳 国内 | 访问：⚠️ 需要API Key                         ║ │
│   ║  成本：¥0.0004 - ¥0.0013  ← 基于 Token 预估计算               ║ │
│   ║  耗时：30-50 秒                                                 ║ │
│   ║  ⭐ 效果：⭐⭐⭐⭐ (4.5/5)                                      ║ │
│   ║  ✅ 推荐理由：代码能力强，成本极低，免费额度充足                ║ │
│   ╚═══════════════════════════════════════════════════════════════╝ │
│                                                                     │
│   ╔═══════════════════════════════════════════════════════════════╗ │
│   ║  💎 效果最佳：Claude 3.5 Sonnet                               ║ │
│   ╠═══════════════════════════════════════════════════════════════╣ │
│   ║  区域：🌍 国际 | 访问：⚠️ 需要API Key                          ║ │
│   ║  成本：¥0.004 - ¥0.013  ← 基于 Token 预估计算                 ║ │
│   ║  耗时：20-40 秒                                                 ║ │
│   ║  ⭐ 效果：⭐⭐⭐⭐⭐ (5/5)                                ⭐  ║ │
│   ║  ✅ 推荐理由：架构设计最佳，安全考虑完善                        ║ │
│   ╚═══════════════════════════════════════════════════════════════╝ │
│                                                                     │
│   💡 洞察：最高成本（Claude）是最便宜方案（Qwen）的 10 倍            │
│          但效果提升仅 25%，性价比不高                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

请选择模型：
  [1] 🆓 免费首选：通义千问 Coder
  [2] ⚖️ 性价比之选：DeepSeek Coder
  [3] 💎 效果最佳：Claude 3.5 Sonnet
  [4] 详细对比
  [5] 重新选择精度/偏好
你的选择：2

⚡ 正在使用 DeepSeek Coder 执行任务...

✅ 任务执行完成！
📊 实际消耗：1,150 tokens
💰 实际成本：¥0.00115
```

---

## 🛠️ 配置选项

### 配置文件位置

用户配置存储在 `config.json` 文件中。

### 国内外平台偏好配置

#### 首次使用配置向导

```bash
/smart-task-model-selector --config
```

#### 交互式配置选项

| 选项 | 说明 |
|------|------|
| 🇳 **国内优先** | 优先推荐国内平台（默认） |
| 🌍 **国际优先** | 优先推荐国际平台 |
| 🇳 **仅国内** | 只推荐国内平台 |
| 🌍 **仅国际** | 只推荐国际平台 |

### 通过代码修改配置

```javascript
const ConfigManager = require('./src/config/ConfigManager');
const manager = new ConfigManager();

// 更新国内平台账号
manager.updateConfig({
  userAccess: {
    hasDomesticAccounts: {
      kimi: true,
      deepseek: true
    }
  }
});

// 更新区域偏好
manager.updateConfig({
  regionalPreference: 'domestic'
});

// 重置为默认配置
manager.resetConfig();
```

### 添加新模型

编辑 `config/models.yaml`，添加新模型配置：

```yaml
- name: "New-Model"
  display_name: "新模型"
  category: "代码生成"
  capabilities:
    - "代码生成"
    - "代码补全"
  strengths:
    - "中文友好"
  weaknesses:
    - "新模型，评价有限"
  context_length: 16000
  cost_per_1k_tokens: 0.001
  free_tier: "100K tokens/月"
  api_available: true
  recommended_for:
    - "日常开发"
  score: 85
```

---

## 📦 安装

### 前提条件

- Node.js 16.0 或更高版本
- CodeBuddy/WorkBuddy 或兼容的 Skill 运行平台

### 安装步骤

1. **下载或克隆项目**
   ```bash
   git clone https://github.com/tobiglevent001/smart-task-model-selector.git
   ```

2. **放置到 Skills 目录**
   ```
   ~/.workbuddy/skills/Smart Task-Model Selector/
   ```

3. **验证安装**
   ```bash
   /smart-task-model-selector --help
   ```

### 目录结构

```
Smart Task-Model Selector/
├── SKILL.md                    # Skill 定义文件
├── README.md                   # 本文件
├── index.js                    # 主入口
├── config.json                 # 用户配置文件
│
├── src/
│   ├── parser/
│   │   └── taskClassifier.js   # 任务分类器
│   ├── estimator/
│   │   └── tokenEstimator.js   # Token 预估器
│   ├── matcher/
│   │   └── modelMatcher.js     # 模型匹配器
│   ├── ui/
│   │   └── recommendationUI.js # 推荐界面生成器
│   └── config/
│       └── ConfigManager.js     # 配置管理器
│
├── config/
│   ├── models.yaml             # 模型能力数据库
│   └── pricing.yaml           # 价格配置
│
└── assets/
    ├── badge-npm.svg          # npm 徽章
    ├── badge-version.svg      # 版本徽章
    ├── banner.svg             # 横幅
    ├── logo.svg               # Logo
    └── icon.svg               # 图标
```

---

## 🤝 贡献指南

欢迎为 Smart Task-Model Selector 贡献代码！

### 开发环境设置

```bash
# 克隆项目
git clone https://github.com/tobiglevent001/smart-task-model-selector.git
cd smart-task-model-selector

# 安装依赖
npm install
```

### 开发流程

1. **Fork 本仓库**
2. **创建特性分支**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **提交变更**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **推送分支**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **创建 Pull Request**

### 代码规范

- 使用 ES6+ 语法
- 变量命名清晰有意义
- 添加必要的注释
- 保持代码简洁
- 遵循现有代码风格

### 测试

```bash
# 运行测试
npm test

# 运行特定测试
npm test -- --grep "token estimation"
```

### 问题反馈

- 使用 [GitHub Issues](https://github.com/tobiglevent001/smart-task-model-selector/issues) 报告 Bug
- 提交功能请求时请详细说明使用场景
- 建议附上示例输入和期望输出

---

## 📄 许可证

本项目采用 [MIT 许可证](https://opensource.org/licenses/MIT)。

---

## 🔗 相关链接

- [GitHub 仓库](https://github.com/tobiglevent001/smart-task-model-selector)
- [问题反馈](https://github.com/tobiglevent001/smart-task-model-selector/issues)
- [版本历史](github/CHANGELOG.md)

---

**Created by Senior Developer (高级开发工程师)**

**版本：v1.1.0** - 添加国内外平台偏好支持
