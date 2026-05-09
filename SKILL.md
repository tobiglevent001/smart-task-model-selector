---
name: smart-task-model-selector
description: "Full reference implementation of an intelligent AI model selector — analyzes task type, estimates token consumption, and recommends the optimal model based on complexity, cost, and regional accessibility."
version: 1.1.0
author: tobiglevent001
license: MIT
metadata:
  hermes:
    tags: [model-selection, cost-optimization, task-classification, token-estimation, china-accessible, reference-implementation]
    related_skills: [smart-task-model-selector]
---

# Smart Task-Model Selector — Reference Implementation

> 智能 AI 模型选择器 — 完整的 Node.js 参考实现，包含 7 个独立模块、测试套件和全面文档。
>
> Also available as a **Hermes Agent Skill** (lightweight decision framework): see the `smart-task-model-selector` skill loaded in the agent.

## 🌟 Overview

This is the **reference implementation** of the Smart Task-Model Selector concept. It's a complete, runnable Node.js application that:

1. **Analyzes** user tasks (9 types: code, writing, translation, research, data analysis, image gen, etc.)
2. **Estimates** token consumption (min/avg/max three tiers with adjustable accuracy)
3. **Recommends** the optimal model from 20+ models with cost, quality, and region awareness
4. **Tracks** actual usage to improve future estimates

The project is fully functional as a standalone tool, and the **decision framework** has been extracted into a lightweight Hermes Agent skill for agents that don't need the full code.

## 🏗️ Architecture

```
smart-task-model-selector/
├── index.js                       # Main entry point — orchestrates the full pipeline
├── cli.js                         # CLI runner (smart-model-selector command)
├── package.json                   # npm package
│
├── src/
│   ├── parser/
│   │   └── taskClassifier.js      # [核心] 9 task types with keyword scoring + fuzzy matching
│   ├── estimator/
│   │   └── tokenEstimator.js      # [核心] Three-tier token estimation with history adjustment
│   ├── matcher/
│   │   └── modelMatcher.js        # [核心] 20+ models, scoring algorithm, regional preference
│   ├── ui/
│   │   └── recommendationUI.js    # Terminal UI with box-drawing charts
│   ├── core/
│   │   └── priceUpdater.js        # Real-time price fetching with OpenRouter API + caching
│   └── config/
│       └── ConfigManager.js       # User preference management
│
├── config/                        # Model database and pricing YAML files
├── test.js                        # Basic tests
├── simple-test.js                 # Quick smoke tests
├── test-real-tasks.js             # Real-world scenario tests (9 scenarios)
├── test-regional-preference.js    # Regional preference tests
│
├── USER-GUIDE.md                  # User guide with screenshots
├── TEST-REPORT.md                 # Test results and coverage
├── FIX-VERIFICATION.md            # Bug fix verification log
├── README.md                      # Full documentation
└── SKILL.md                       # This file
```

## ✨ Key Features

### 1. Intelligent Task Classification
9 task types with keyword-based scoring + fuzzy matching:
- 代码生成 (Code Generation), 代码审查 (Code Review), 代码调试 (Debugging)
- 文案写作 (Writing), 翻译 (Translation), 搜索研究 (Research)
- 数据分析 (Data Analysis), AI 绘画 (Image Gen), 图片处理 (Image Processing)

### 2. Three-Tier Token Estimation
```
┌─────────────┬──────────────┬──────────────┐
│ 预估级别    │ Token 数量   │ 预估成本     │
├─────────────┼──────────────┼──────────────┤
│ 🟢 最小     │ 800          │ ¥0.0004      │
│ 🟡 平均     │ 1,200        │ ¥0.0006      │
│ 🔴 最大     │ 2,500        │ ¥0.0013      │
└─────────────┴──────────────┴──────────────┘
```

Adjustable accuracy: standard (±30%) or high (±10%) with history-based optimization.

### 3. 20+ Models with Matching Algorithm
Built-in model database covering:
- 🇨🇳 **Domestic CN**: DeepSeek Coder/V3, 通义千问 Coder/Long/Analysis/万相, Kimi, 百度翻译
- 🌍 **International**: Claude Sonnet/Haiku/Opus, GPT-4o/4o-mini/3.5, Perplexity, DALL-E 3, Stable Diffusion, DeepL, Google Translate

### 4. Regional Preference System
- Auto-detect accessible models based on user's region config
- Score adjustment: -50 for inaccessible, +15 for preferred region
- Access requirements labeling (✅ Free / ⚠️ API Key / ⚠️ Account needed)

### 5. Dual Currency Display
- 🇨🇳 CN models: ¥ primary + USD conversion
- 🌍 INTL models: $ primary + CNY conversion

### 6. Real-Time Price Updates
- OpenRouter API integration for live pricing
- Smart caching (configurable: auto/hourly/daily/manual)
- Graceful fallback to default prices

### 7. Regression Tests
4 test files covering 20+ scenarios including regional preference, budget limits, and edge cases.

## 🚀 Quick Start

```bash
# Install from GitHub
git clone https://github.com/tobiglevent001/smart-task-model-selector.git
cd smart-task-model-selector
npm install

# CLI mode
node cli.js "帮我写一个用户登录功能"

# Programmatic API
node -e "
const Selector = require('./index.js');
const s = new Selector();
s.selectModel('帮我写一个用户登录功能', {
  accuracyMode: 'standard',
  optimizationPreference: 'balanced'
}).then(r => console.log(r.display));
"
```

## 📋 Test Report Summary

```
✓ 代码生成任务 - 关键词匹配测试
✓ 文案写作任务 - 关键词匹配测试
✓ 翻译任务 - 关键词匹配测试
✓ 搜索研究任务 - 关键词匹配测试
✓ 数据分析任务 - 关键词匹配测试
✓ AI绘画任务 - 关键词匹配测试
✓ 简单任务 - 复杂度评估测试
✓ 复杂任务 - 复杂度评估测试
✓ 中文技术要求提取测试
✓ 用户区域偏好测试 (7 scenarios)
```

## 🤝 Relationship with Hermes Agent Skill

This repository is the **full reference implementation** — runnable code you can inspect, test, and extend.

The Hermes Agent Skill version (`smart-task-model-selector`) distills the **same decision framework** into a lightweight markdown skill that agents can follow directly, without running external code. It contains the core logic: task classification, token estimation, model selection matrix, regional preference rules, and cost optimization strategy.

**Use this repo when you want to:**
- Understand the full implementation details
- Run tests and see actual outputs
- Extend the model database or matching algorithm
- Develop your own model selector based on this design

**Use the Hermes Skill when you want:**
- AI agents to make smart model selection decisions directly
- Lightweight, zero-dependency recommendations
- The same decision logic without running Node.js code

## 📄 License

MIT
