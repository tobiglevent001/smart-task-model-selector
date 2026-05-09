/**
 * AI 模型选择器 - 主入口
 * 整合所有模块，提供完整的模型推荐流程
 */

const TaskClassifier = require('./src/parser/taskClassifier');
const TokenEstimator = require('./src/estimator/tokenEstimator');
const ModelMatcher = require('./src/matcher/modelMatcher');
const RecommendationUI = require('./src/ui/recommendationUI');
const PriceUpdateManager = require('./src/core/priceUpdater');
const I18n = require('./src/i18n');

class AIModelSelector {
  constructor(options = {}) {
    // Load language from config or options
    const config = this.loadConfig();
    const lang = options.lang || config.language || 'zh';

    // Initialize i18n
    this.i18n = new I18n(lang);

    this.classifier = new TaskClassifier();
    this.estimator = new TokenEstimator();
    this.matcher = new ModelMatcher();
    this.ui = new RecommendationUI();
    this.priceManager = new PriceUpdateManager(options.priceManager || {});

    // Pass i18n to sub-modules
    this.estimator.i18n = this.i18n;
    this.ui.i18n = this.i18n;
    this.matcher.i18n = this.i18n;
  }

  /**
   * Load config.json for language setting
   */
  loadConfig() {
    try {
      const fs = require('fs');
      const path = require('path');
      const configPath = path.join(__dirname, 'config.json');
      const configData = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      return { language: 'zh' };
    }
  }

  /**
   * Detect input language and switch i18n accordingly
   * Simple heuristic: if >50% of characters are ASCII letters, treat as English
   * @param {string} text - User input text
   */
  autoDetectLanguage(text) {
    const isEnglish = I18n.detectEnglish(text);
    const config = this.loadConfig();
    const baseLang = config.language || 'zh';
    // If user input is English, switch to English output; otherwise use base language
    this.i18n.setLang(isEnglish ? 'en' : baseLang);
    // Propagate to sub-modules
    if (this.estimator.i18n) this.estimator.i18n = this.i18n;
    if (this.ui.i18n) this.ui.i18n = this.i18n;
    if (this.matcher.i18n) this.matcher.i18n = this.i18n;
  }
  
  /**
   * 主流程：分析任务并推荐模型
   * @param {string} userInput - 用户输入
   * @param {Object} options - 配置选项
   * @returns {Object} 推荐结果
   */
  async selectModel(userInput, options = {}) {
    const {
      accuracyMode = 'standard',     // standard / high
      optimizationPreference = 'balanced',  // cost / balanced / quality
      budgetLimit = null,             // 成本上限（可选）
      updateMode = 'auto',            // auto / hourly / daily / manual
      forcePriceRefresh = false       // 强制刷新价格
    } = options;

    // Auto-detect language from user input
    this.autoDetectLanguage(userInput);

    console.log(this.i18n.t('cli.analyzing') + '\n');
    
    // Step 0: 获取实时价格数据（带缓存）
    const { prices, meta: priceMeta } = await this.priceManager.getPrices({
      updateMode,
      forceRefresh: forcePriceRefresh,
      showWarnings: true
    });
    
    // Step 1: 任务分析
    const analysis = this.classifier.analyze(userInput);
    
    // Step 2: Token 预估
    const tokenEstimate = this.estimator.estimateTokens(
      analysis.taskType,
      analysis.complexity,
      analysis.requirements,
      accuracyMode
    );
    
    // 使用实时价格计算成本
    const samplePrice = prices['DeepSeek-Coder']?.cost_per_1k || 0.001;
    const tokenDisplay = this.estimator.formatEstimate(tokenEstimate, { cost_per_1k: samplePrice });
    
    // Step 3: 更新匹配器使用实时价格
    this.matcher.updatePrices(prices);
    
    // Step 4: 模型匹配
    const matchResult = this.matcher.matchModels(
      analysis,
      tokenEstimate,
      { optimizationPreference, budgetLimit, accuracyMode }
    );
    
    if (matchResult.error) {
      console.log(this.i18n.t('warn.budget_exceeded'));
      console.log(this.i18n.t('warn.budget_suggestion'));
      return matchResult;
    }
    
    // Step 5: 生成推荐展示（包含价格状态，避免重复显示）
    const display = this.ui.generateFullDisplay(matchResult, analysis, tokenDisplay, priceMeta);
    console.log(display);
    
    // Step 6: 生成选择提示
    const choicePrompt = this.ui.generateChoicePrompt(matchResult.recommendations, priceMeta);
    console.log(choicePrompt);
    
    return {
      success: true,
      analysis,
      tokenEstimate,
      recommendations: matchResult.recommendations,
      priceMeta,
      display,
      choicePrompt
    };
  }
  
  /**
   * 处理用户选择
   * @param {number} choice - 用户选择（1/2/3/4/5）
   * @param {Object} context - 之前的推荐结果
   * @returns {Object} 执行结果
   */
  async handleUserChoice(choice, context) {
    const { recommendations } = context;
    
    switch (choice) {
      case 1:  // 免费首选
        if (recommendations.free) {
          return this.executeWithModel(recommendations.free, context);
        }
        break;
        
      case 2:  // 性价比之选
        if (recommendations.balanced) {
          return this.executeWithModel(recommendations.balanced, context);
        }
        break;
        
      case 3:  // 效果最佳
        if (recommendations.quality) {
          return this.executeWithModel(recommendations.quality, context);
        }
        break;
        
      case 4:  // 详细对比
        return this.showDetailedComparison(context);
        
      case 5:  // 重新选择
        return this.reselectPreferences();
        
      default:
        return { error: this.i18n.t('warn.budget_suggestion') };
    }
  }

  /**
   * 使用选定模型执行任务
   */
  async executeWithModel(model, context) {
    const executingMsg = this.i18n.getLang() === 'en'
      ? `\n⚡ Executing with ${model.display_name}...\n`
      : `\n⚡ 正在使用 ${model.display_name} 执行任务...\n`;
    console.log(executingMsg);
    
    // 这里应该调用实际的 AI 模型 API
    // 由于是演示，这里只返回模拟结果
    
    const mockResult = {
      success: true,
      model: model.display_name,
      actualTokens: Math.round(context.tokenEstimate.avg * (0.8 + Math.random() * 0.4)),  // 模拟实际消耗
      cost: (context.tokenEstimate.avg / 1000) * model.cost_per_1k_tokens,
      output: '这是模拟的输出结果...'
    };
    
    console.log(this.i18n.t('cli.done'));
    const tokenMsg = this.i18n.getLang() === 'en'
      ? `📊 Actual usage: ${mockResult.actualTokens} tokens`
      : `📊 实际消耗：${mockResult.actualTokens} tokens`;
    console.log(tokenMsg);
    const costMsg = this.i18n.getLang() === 'en'
      ? `💰 Actual cost: ${this.formatCost(mockResult.cost)}`
      : `💰 实际成本：${this.formatCost(mockResult.cost)}`;
    console.log(costMsg);
    
    // 记录实际使用数据（用于优化预估）
    this.estimator.recordActualUsage(
      context.analysis.taskType,
      context.analysis.complexity,
      context.analysis.requirements,
      context.tokenEstimate,
      mockResult.actualTokens
    );
    
    return mockResult;
  }
  
  /**
   * 显示详细对比
   */
  showDetailedComparison(context) {
    const header = this.i18n.getLang() === 'en' ? '\n📈 Detailed Comparison\n' : '\n📈 详细对比分析\n';
    console.log(header);
    return { action: 'show_comparison', context };
  }

  /**
   * 重新选择偏好
   */
  reselectPreferences() {
    const isEn = this.i18n.getLang() === 'en';
    console.log('\n⚙️ ' + (isEn ? 'Reselect Preferences' : '重新选择配置') + '\n');

    if (isEn) {
      console.log('Select accuracy level:');
      console.log('  [1] Standard (fast, ±30% error)');
      console.log('  [2] High precision (slower, ±10% error)');
      console.log('\nSelect optimization preference:');
      console.log('  [3] 🆓 Cost First');
      console.log('  [4] ⚖️ Balanced');
      console.log('  [5] 💎 Quality First');
      return { action: 'reselect', prompt: 'Enter your choice (1-5): ' };
    }

    console.log('请选择预估精度：');
    console.log('  [1] 标准精度（快速，±30% 误差）');
    console.log('  [2] 高精度（较慢，±10% 误差）');
    console.log('\n请选择优化偏好：');
    console.log('  [3] 🆓 省钱优先');
    console.log('  [4] ⚖️ 平衡模式');
    console.log('  [5] 💎 效果优先');

    return { action: 'reselect', prompt: '请输入你的选择（1-5）：' };
  }
  
  /**
   * 统一格式化成本（用户友好）
   * 规则：
   * - 0: ¥0 (免费)
   * - 0.001-0.01: ¥0.004 (4位小数)
   * - 0.01-1: ¥0.35 (2位小数)
   * - 1-100: ¥15.00 (2位小数)
   * - >100: ¥500 (整数)
   */
  formatCost(cost) {
    if (cost === 0) return '¥0 (免费)';
    if (cost < 0) return '¥-';
    
    if (cost < 0.001) {
      return `¥${cost.toFixed(6)}`;
    } else if (cost < 0.01) {
      return `¥${cost.toFixed(4)}`;
    } else if (cost < 1) {
      return `¥${cost.toFixed(2)}`;
    } else if (cost < 100) {
      return `¥${cost.toFixed(2)}`;
    } else {
      return `¥${Math.round(cost)}`;
    }
  }
}

// 命令行使用
if (require.main === module) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const selector = new AIModelSelector();

  console.log(selector.i18n.t('cli.title'));
  console.log('=================================\n');

  const prompt = selector.i18n.t('cli.input_prompt');
  rl.question(prompt, async (userInput) => {
    const result = await selector.selectModel(userInput, {
      accuracyMode: 'standard',
      optimizationPreference: 'balanced'
    });

    if (result.success) {
      rl.question('\n' + result.choicePrompt + '\n' + (selector.i18n.getLang() === 'en' ? 'Your choice: ' : '你的选择：'), async (choice) => {
        const choiceResult = await selector.handleUserChoice(parseInt(choice), result);
        console.log('\n' + selector.i18n.t('cli.done'));
        rl.close();
      });
    } else {
      rl.close();
    }
  });
}

module.exports = AIModelSelector;
