#!/usr/bin/env node
/**
 * Smart Task-Model Selector CLI
 * Command line interface for AI model selection
 */

const path = require('path');

// Set up module paths for require
global.require = require;

const AIModelSelector = require('./index.js');

const selector = new AIModelSelector();

const args = process.argv.slice(2);

if (args.includes('--config')) {
  console.log('🔧 进入配置向导...');
  selector.configure().then(() => {
    console.log('✅ 配置完成！');
    process.exit(0);
  }).catch(err => {
    console.error('❌ 配置失败:', err.message);
    process.exit(1);
  });
} else if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🤖 Smart Task-Model Selector CLI

用法:
  smart-model-selector [选项] [任务描述]

选项:
  --config    打开配置向导
  --help, -h  显示帮助信息

示例:
  smart-model-selector "开发一个跨境电商网站"
  smart-model-selector --config
  `);
  process.exit(0);
} else {
  const task = args.join(' ') || '开发一个简单的Hello World程序';

  console.log(`🎯 正在分析任务: ${task}\n`);

  selector.selectModel(task).then(result => {
    console.log(result.display);
    process.exit(0);
  }).catch(err => {
    console.error('❌ 分析失败:', err.message);
    process.exit(1);
  });
}
