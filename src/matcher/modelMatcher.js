/**
 * 模型匹配器
 * 根据任务分析、Token 预估、用户偏好推荐最优模型
 */

class ModelMatcher {
  constructor() {
    // 加载模型数据库
    this.models = this.loadModels();
    // 实时价格（从价格管理器获取）
    this.realtimePrices = {};
    // 加载用户配置
    this.userConfig = this.loadUserConfig();
    // 汇率配置（2024年参考值）
    this.exchangeRate = 7.2; // 1 USD = 7.2 CNY
    // 价格参考基准说明
    this.priceReference = {
      domestic: '参考：DeepSeek Flash ¥0.1/元 (≈$0.014)',
      international: '参考：GPT-4o-mini $0.15/千Token'
    };
    // i18n instance (optional, set externally)
    this.i18n = null;
  }
  
  /**
   * 加载用户配置文件
   */
  loadUserConfig() {
    try {
      const fs = require('fs');
      const path = require('path');
      const configPath = path.join(__dirname, '../../config.json');
      const configData = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      // 默认配置：优先国内平台
      return {
        userAccess: {
          hasInternationalAccess: false,
          hasAccounts: {
            openai: false,
            anthropic: false,
            perplexity: false
          },
          hasDomesticAccounts: {
            qwen: true,
            deepseek: true,
            kimi: false
          },
          preference: 'domestic-first'
        }
      };
    }
  }
  
  /**
   * 检查模型是否可访问
   */
  isModelAccessible(model) {
    const { userAccess } = this.userConfig;
    
    // 国内模型
    if (model.region === 'CN') {
      // 检查用户是否有该平台的账号
      const platformMap = {
        'Qwen': 'qwen',
        'DeepSeek': 'deepseek',
        'Kimi': 'kimi',
        'Zhipu': 'zhipu',
        'Ernie': 'ernie',
        'Spark': 'spark'
      };
      
      const platform = platformMap[model.platform] || model.platform.toLowerCase();
      return userAccess.hasDomesticAccounts[platform] !== false;
    }
    
    // 国际模型
    if (model.region === 'INTL') {
      if (!userAccess.hasInternationalAccess) return false;
      
      const platformMap = {
        'OpenAI': 'openai',
        'Anthropic': 'anthropic',
        'Perplexity': 'perplexity',
        'DeepL': 'deepl',
        'Google': 'google'
      };
      
      const platform = platformMap[model.platform] || model.platform.toLowerCase();
      return userAccess.hasAccounts[platform] === true;
    }
    
    return true;
  }
  
  /**
   * 计算区域偏好加分
   */
  getRegionBonus(model) {
    const { userAccess } = this.userConfig;
    const preference = userAccess.preference || 'domestic-first';
    
    // 国内优先模式
    if (preference === 'domestic-first' || preference === 'domestic-only') {
      if (model.region === 'CN') return 15;
      if (model.region === 'INTL') return 0;
    }
    
    // 国际优先模式
    if (preference === 'international-first' || preference === 'international-only') {
      if (model.region === 'INTL') return 15;
      if (model.region === 'CN') return 0;
    }
    
    return 0;
  }
  
  /**
   * 更新实时价格
   */
  updatePrices(prices) {
    this.realtimePrices = prices;
  }
  
  /**
   * 获取模型价格（优先使用实时价格）
   */
  getModelPrice(modelName) {
    // 先查实时价格
    if (this.realtimePrices[modelName]) {
      return this.realtimePrices[modelName].cost_per_1k;
    }
    // 再查内置价格
    const model = this.models.find(m => m.name === modelName);
    return model ? model.cost_per_1k_tokens : 0;
  }
  
  /**
   * 匹配最优模型
   * @param {Object} analysis - 任务分析结果
   * @param {Object} tokenEstimate - Token 预估
   * @param {Object} userPreference - 用户偏好
   * @returns {Object} 推荐模型列表
   */
  matchModels(analysis, tokenEstimate, userPreference = {}) {
    const {
      optimizationPreference = 'balanced',  // cost / balanced / quality
      budgetLimit = null,                  // 成本上限（可选）
      accuracyMode = 'standard'
    } = userPreference;
    
    // 1. 筛选候选模型
    let candidates = this.filterCandidates(analysis);
    
    // 2. 计算匹配分数
    candidates = candidates.map(model => {
      const score = this.calculateMatchScore(model, analysis, tokenEstimate);
      const cost = this.calculateCost(tokenEstimate, model);
      
      return {
        ...model,
        matchScore: score,
        costEstimate: cost,
        costNum: (tokenEstimate.avg / 1000) * model.cost_per_1k_tokens
      };
    });
    
    // 3. 根据预算上限过滤
    if (budgetLimit) {
      candidates = candidates.filter(m => m.costNum <= budgetLimit);
      
      if (candidates.length === 0) {
        const isEn = this.i18n && this.i18n.getLang() === 'en';
        return {
          error: isEn ? `All models exceed budget ¥${budgetLimit.toFixed(4)}` : `所有模型都超出预算 ¥${budgetLimit.toFixed(4)}`,
          suggestion: isEn ? 'Please increase budget or select a free model' : '请提高预算或选择免费模型',
          candidates: []
        };
      }
    }
    
    // 4. 根据优化偏好排序
    candidates = this.sortByPreference(candidates, optimizationPreference);
    
    // 5. 分成三档推荐（传入任务类型以便正确分类）
    const recommendations = this.categorizeRecommendations(candidates, analysis.taskType);
    
    return {
      success: true,
      recommendations,
      comparison: this.generateComparisonTable(candidates.slice(0, 5)),
      insight: this.generateInsight(candidates)
    };
  }
  
  /**
   * 筛选候选模型
   */
  filterCandidates(analysis) {
    const { taskType, complexity } = analysis;
    
    return this.models.filter(model => {
      // 1. 检查模型是否支持该任务类型
      const taskTypeMap = {
        '代码生成': ['代码生成'],
        '代码审查': ['代码生成', '代码审查'],
        '代码调试': ['代码生成'],
        '文案写作': ['文案写作', '代码生成'],
        '翻译': ['翻译', '文案写作'],
        '搜索研究': ['搜索研究', '文案写作'],
        '数据分析': ['数据分析', '文案写作'],
        'AI 绘画': ['AI 绘画'],
        '图片处理': ['AI 绘画', '图片处理']
      };
      
      const supportedCategories = taskTypeMap[taskType] || [taskType];
      const isSupported = supportedCategories.some(cat => model.category === cat);
      
      // 如果没有精确匹配但模型评分很高，仍然保留
      if (!isSupported && model.score >= 85) {
        return true;
      }
      
      return isSupported;
    });
  }
  
  /**
   * 计算匹配分数（重新设计）
   */
  calculateMatchScore(model, analysis, tokenEstimate) {
    let score = model.score || 80;  // 基础分
    
    // 1. 任务类型匹配度（这个很重要）
    const taskMatchBonus = this.getTaskMatchBonus(model, analysis.taskType);
    score += taskMatchBonus;
    
    // 2. 复杂度适配度
    const complexityBonus = this.getComplexityBonus(model, analysis.complexity);
    score += complexityBonus;
    
    // 3. 技术要求匹配度
    const techBonus = this.getTechBonus(model, analysis.requirements);
    score += techBonus;
    
    // 4. 成本适应度（作为微调，不要太大影响）
    const costScore = this.getCostScore(model, tokenEstimate);
    score += costScore;
    
    // 5. 区域偏好加分（国内优先/国际优先）
    const regionBonus = this.getRegionBonus(model);
    score += regionBonus;
    
    // 6. 可访问性加分（优先推荐用户能用的）
    if (!this.isModelAccessible(model)) {
      score -= 50;  // 不可访问的模型大幅降分
    }
    
    return Math.min(Math.max(score, 0), 100);
  }
  
  getTaskMatchBonus(model, taskType) {
    const capabilityMap = {
      '代码生成': ['代码生成', '架构设计', '代码审查', '调试'],
      '代码审查': ['代码生成', '代码审查'],
      '代码调试': ['代码生成', '调试'],
      '文案写作': ['文案写作', '方案撰写', '报告生成', 'PPT大纲', '长文生成'],
      '翻译': ['翻译', '多语言', '本地化'],
      '搜索研究': ['搜索研究', '引用来源', '年报分析', '行业调研', '信息收集', '实时信息'],
      '数据分析': ['数据分析', '图表生成', 'BI报告', '复杂分析', '可视化'],
      'AI 绘画': ['AI 绘画', '图片生成', '海报设计', '插画']
    };
    
    const requiredCaps = capabilityMap[taskType] || [];
    let bonus = 0;
    
    requiredCaps.forEach(cap => {
      if (model.capabilities.includes(cap)) {
        bonus += 8;
      }
    });
    
    // 如果模型分类与任务类型完全匹配，额外加分
    if (model.category === taskType) {
      bonus += 15;
    }
    
    return bonus;
  }
  
  getComplexityBonus(model, complexity) {
    if (complexity === '复杂') {
      if (model.context_length >= 100000) return 15;  // 大上下文模型
      if (model.category === '代码生成' && model.score >= 90) return 10;
      if (model.score >= 92) return 8;
    }
    if (complexity === '中等') {
      if (model.score >= 85) return 5;
    }
    if (complexity === '简单') {
      if (model.cost_per_1k_tokens === 0) return 8;  // 简单任务优先免费
      if (model.cost_per_1k_tokens < 0.001) return 5;
    }
    return 0;
  }
  
  getTechBonus(model, requirements) {
    let bonus = 0;
    
    if (requirements.includes('中文') && (model.strengths.includes('中文友好') || model.strengths.includes('中文优秀'))) {
      bonus += 10;
    }
    
    if (requirements.includes('长文档') && model.context_length > 50000) {
      bonus += 10;
    }
    
    if (requirements.includes('多语言') && model.capabilities.includes('多语言')) {
      bonus += 8;
    }
    
    return bonus;
  }
  
  getCostScore(model, tokenEstimate) {
    const avgCost = (tokenEstimate.avg / 1000) * model.cost_per_1k_tokens;
    
    if (avgCost === 0) return 5;   // 免费模型：+5 分
    if (avgCost < 0.001) return 3; // 极便宜：+3 分
    if (avgCost < 0.01) return 1;  // 便宜：+1 分
    if (avgCost < 0.1) return -2;  // 中等：-2 分
    return -5;  // 较贵：-5 分
  }
  
  /**
   * 计算成本预估（双币种显示）
   */
  calculateCost(tokenEstimate, model) {
    const costPer1K = model.cost_per_1k_tokens;
    const minNum = (tokenEstimate.min / 1000) * costPer1K;
    const avgNum = (tokenEstimate.avg / 1000) * costPer1K;
    const maxNum = (tokenEstimate.max / 1000) * costPer1K;
    
    // 根据模型区域决定显示币种
    const isDomestic = model.region === 'CN';
    
    // 如果是国内模型，显示 ¥ + 换算 $
    // 如果是国际模型，显示 $ + 换算 ¥
    if (isDomestic) {
      // 国内模型：主要显示人民币，换算美元
      // 注意：formatCostCNY/USD 已经包含符号，无需重复添加
      return {
        min: this.formatCostCNY(minNum) + ' (≈' + this.formatCostUSD(minNum / this.exchangeRate) + ')',
        avg: this.formatCostCNY(avgNum) + ' (≈' + this.formatCostUSD(avgNum / this.exchangeRate) + ')',
        max: this.formatCostCNY(maxNum) + ' (≈' + this.formatCostUSD(maxNum / this.exchangeRate) + ')',
        minNum: minNum,
        avgNum: avgNum,
        maxNum: maxNum,
        currency: 'CNY',
        currencyDisplay: '¥'
      };
    } else {
      // 国际模型：主要显示美元，换算人民币
      return {
        min: this.formatCostUSD(minNum) + ' (≈' + this.formatCostCNY(minNum * this.exchangeRate) + ')',
        avg: this.formatCostUSD(avgNum) + ' (≈' + this.formatCostCNY(avgNum * this.exchangeRate) + ')',
        max: this.formatCostUSD(maxNum) + ' (≈' + this.formatCostCNY(maxNum * this.exchangeRate) + ')',
        minNum: minNum,
        avgNum: avgNum,
        maxNum: maxNum,
        currency: 'USD',
        currencyDisplay: '$'
      };
    }
  }
  
  /**
   * 统一格式化成本（用户友好）
   * 规则：
   * - 0: ¥0 / $0
   * - 0.001-0.01: ¥0.004 / $0.0005 (4位小数)
   * - 0.01-1: ¥0.35 / $0.15 (2位小数)
   * - 1-100: ¥15.00 / $8.50 (2位小数)
   * - >100: ¥500 / $150 (整数)
   */
  formatCost(cost, currency = 'CNY') {
    const prefix = currency === 'CNY' ? '¥' : '$';
    
    if (cost === 0) return `${prefix}0`;
    if (cost < 0) return `${prefix}-`;
    
    if (cost < 0.001) {
      // 极小金额：保留6位小数
      return `${prefix}${cost.toFixed(6)}`;
    } else if (cost < 0.01) {
      // 很小金额：保留4位小数
      return `${prefix}${cost.toFixed(4)}`;
    } else if (cost < 1) {
      // 小金额：保留2位小数
      return `${prefix}${cost.toFixed(2)}`;
    } else if (cost < 100) {
      // 中等金额：2位小数
      return `${prefix}${cost.toFixed(2)}`;
    } else {
      // 大金额：整数
      return `${prefix}${Math.round(cost)}`;
    }
  }
  
  /**
   * 格式化人民币（¥）- 兼容旧接口
   */
  formatCostCNY(cost) {
    return this.formatCost(cost, 'CNY');
  }
  
  /**
   * 格式化美元（$）- 兼容旧接口
   */
  formatCostUSD(cost) {
    return this.formatCost(cost, 'USD');
  }
  
  /**
   * 获取价格参考说明
   */
  getPriceReference() {
    return {
      domestic: '📊 国内参考：DeepSeek V3 ¥0.27/元 (≈$0.038)',
      international: '📊 国际参考：GPT-4o-mini $0.15/千Token (≈¥1.08)',
      exchangeRate: `💱 汇率：1 USD = ¥${this.exchangeRate} (参考值)`
    };
  }
  
  /**
   * 获取价格参考说明
   */
  getPriceReference() {
    return {
      domestic: '📊 国内参考：DeepSeek V3 ¥0.27/元 (≈$0.038)',
      international: '📊 国际参考：GPT-4o-mini $0.15/千Token (≈¥1.08)',
      exchangeRate: `💱 汇率：1 USD = ¥${this.exchangeRate} (参考值)`
    };
  }
  
  /**
   * 根据偏好排序
   */
  sortByPreference(candidates, preference) {
    switch (preference) {
      case 'cost':  // 省钱优先
        return candidates.sort((a, b) => {
          if (a.costNum === 0 && b.costNum > 0) return -1;
          if (b.costNum === 0 && a.costNum > 0) return 1;
          return a.costNum - b.costNum || b.matchScore - a.matchScore;
        });
        
      case 'quality':  // 效果优先
        return candidates.sort((a, b) => {
          return b.matchScore - a.matchScore || a.costNum - b.costNum;
        });
        
      case 'balanced':  // 性价比
      default:
        return candidates.sort((a, b) => {
          const scoreA = a.matchScore * 0.6 - Math.log10(a.costNum + 0.0001) * 20;
          const scoreB = b.matchScore * 0.6 - Math.log10(b.costNum + 0.0001) * 20;
          return scoreB - scoreA;
        });
    }
  }
  
  /**
   * 分成三档推荐（改进版：按任务类型分类，优先推荐同类模型）
   */
  categorizeRecommendations(candidates, taskType = null) {
    if (candidates.length === 0) return {};
    
    // 按分类分组
    const byCategory = {};
    candidates.forEach(m => {
      const cat = m.category;
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(m);
    });
    
    // 免费首选：最便宜的免费模型
    const freeModels = candidates.filter(m => m.costNum === 0);
    const freeRecommendation = freeModels.length > 0 ? freeModels[0] : null;
    
    // 效果最佳：优先使用与任务类型匹配的分类中的最高评分模型
    // 如果任务类型已知且在候选集中有对应分类，优先选该分类
    let qualityCategory = null;
    if (taskType && byCategory[taskType]) {
      // 任务类型直接匹配到模型分类
      qualityCategory = taskType;
    } else {
      // 找到匹配分数(matchScore)最高的分类
      const categoryTopMatches = {};
      Object.entries(byCategory).forEach(([cat, models]) => {
        categoryTopMatches[cat] = Math.max(...models.map(m => m.matchScore || 0));
      });
      qualityCategory = Object.entries(categoryTopMatches).sort((a, b) => b[1] - a[1])[0][0];
    }
    
    // 效果最佳：质量分类中的最优模型（按原始评分）
    const qualityRecommendation = qualityCategory && byCategory[qualityCategory]
      ? [...byCategory[qualityCategory]].sort((a, b) => (b.score || 80) - (a.score || 80))[0]
      : candidates[0];
    
    // 性价比之选：同一分类中综合匹配分数(matchScore)最高的模型
    const balancedRecommendation = qualityCategory && byCategory[qualityCategory]
      ? [...byCategory[qualityCategory]].sort((a, b) => b.matchScore - a.matchScore)[0]
      : candidates.sort((a, b) => b.matchScore - a.matchScore)[0];
    
    return {
      free: freeRecommendation,
      balanced: balancedRecommendation,
      quality: qualityRecommendation
    };
  }
  
  /**
   * 生成对比表格
   */
  generateComparisonTable(candidates) {
    const isEn = this.i18n && this.i18n.getLang() === 'en';
    const modelLabel = isEn ? 'Model' : '模型';
    const priceLabel = isEn ? 'Price(/1K)' : '单价(/1K)';
    const costLabel = isEn ? 'Est. Cost' : '预估成本';
    const effectLabel = isEn ? 'Quality' : '效果评分';

    let table = `
┌──────────────┬─────────────┬──────────────────┬──────────────────────┐
│ ${modelLabel.padEnd(12)} │ ${priceLabel.padEnd(11)} │ ${costLabel.padEnd(16)} │ ${effectLabel.padEnd(20)} │
├──────────────┼─────────────┼──────────────────┼──────────────────────┤
`;
    
    candidates.forEach(m => {
      const stars = '⭐'.repeat(Math.round(m.matchScore / 20));
      table += `│ ${m.display_name.padEnd(12)} │ ¥${m.cost_per_1k_tokens.toFixed(4).padEnd(11)} │ ${m.costEstimate.avg.padEnd(18)} │ ${stars.padEnd(20)} │\n`;
    });
    
    table += `└──────────────┴─────────────┴──────────────────┴──────────────────────┘`;
    
    return table.trim();
  }
  
  /**
   * 生成洞察建议
   */
  generateInsight(candidates) {
    if (candidates.length < 2) return '';

    const isEn = this.i18n && this.i18n.getLang() === 'en';
    const cheapest = candidates[candidates.length - 1];
    const costliest = candidates[0];

    const costRatio = cheapest.costNum > 0
      ? (costliest.costNum / cheapest.costNum).toFixed(1)
      : '∞';

    if (costRatio === '∞') {
      const freeModel = candidates.find(m => m.costNum === 0);
      const freeMsg = isEn
        ? `💡 Insight: Free model option available, recommended: ${freeModel.display_name}`
        : `💡 洞察：存在免费模型选项，推荐使用 ${freeModel.display_name}`;
      return freeMsg;
    }

    const ratioMsg = isEn
      ? `💡 Insight: Most expensive model costs ${costRatio}x the cheapest; choose based on your needs and budget`
      : `💡 洞察：最贵模型成本是最便宜的 ${costRatio} 倍，请根据需求和预算选择`;
    return ratioMsg;
  }
  
  /**
   * 加载模型数据
   */
  loadModels() {
    // 实际应该从 models.yaml 加载，这里内置核心模型
    // region: 'CN' = 国内平台, 'INTL' = 国际平台
    // accessibility: 'free' = 免费使用, 'api-key' = 需要API密钥, 'account' = 需要注册账号
    return [
      // ========== 代码生成类 ==========
      {
        name: 'Qwen-Coder',
        display_name: '通义千问 Coder',
        platform: 'Qwen',
        region: 'CN',
        accessibility: 'free',
        category: '代码生成',
        capabilities: ['代码生成', '代码补全', '代码审查', '调试'],
        strengths: ['开源免费', '中文友好', '8K 上下文'],
        weaknesses: ['复杂架构较弱', '代码质量一般'],
        context_length: 8192,
        cost_per_1k_tokens: 0,
        free_tier: '完全免费',
        score: 85
      },
      {
        name: 'DeepSeek-Coder',
        display_name: 'DeepSeek Coder',
        platform: 'DeepSeek',
        region: 'CN',
        accessibility: 'api-key',
        category: '代码生成',
        capabilities: ['代码生成', '代码补全', '代码审查', '架构设计'],
        strengths: ['性价比极高', '代码质量优秀', '16K 上下文'],
        weaknesses: ['免费额度有限', '中文稍弱于 Qwen'],
        context_length: 16384,
        cost_per_1k_tokens: 0.001,
        free_tier: '500K tokens/月',
        score: 92
      },
      {
        name: 'Claude Sonnet',
        display_name: 'Claude 3.5 Sonnet',
        platform: 'Anthropic',
        region: 'INTL',
        accessibility: 'api-key',
        category: '代码生成',
        capabilities: ['代码生成', '代码审查', '架构设计', '重构', '调试'],
        strengths: ['代码质量卓越', '架构设计优秀', '200K 上下文', '安全考虑完善'],
        weaknesses: ['成本较高', '速度较慢', '需要国际账号'],
        context_length: 200000,
        cost_per_1k_tokens: 0.003,
        free_tier: '无',
        score: 98
      },
      {
        name: 'GPT-4o',
        display_name: 'GPT-4o',
        platform: 'OpenAI',
        region: 'INTL',
        accessibility: 'api-key',
        category: '代码生成',
        capabilities: ['代码生成', '多模态', 'API 开发'],
        strengths: ['通用能力强', '生态完善', '128K 上下文'],
        weaknesses: ['成本较高', '代码质量略逊于 Claude', '需要国际账号'],
        context_length: 128000,
        cost_per_1k_tokens: 0.005,
        free_tier: '有限',
        score: 90
      },
      {
        name: 'GPT-3.5-Turbo',
        display_name: 'GPT-3.5 Turbo',
        platform: 'OpenAI',
        region: 'INTL',
        accessibility: 'api-key',
        category: '代码生成',
        capabilities: ['代码生成', '代码补全'],
        strengths: ['成熟稳定', '速度快', '便宜'],
        weaknesses: ['代码质量一般', '复杂逻辑较弱', '需要国际账号'],
        context_length: 16384,
        cost_per_1k_tokens: 0.0005,
        free_tier: '付费',
        score: 75
      },
      // ========== 文案写作类 ==========
      {
        name: 'Qwen-Long',
        display_name: '通义千问 Long',
        platform: 'Qwen',
        region: 'CN',
        accessibility: 'free',
        category: '文案写作',
        capabilities: ['文案写作', '长文生成', '方案撰写', '报告生成', 'PPT大纲'],
        strengths: ['免费使用', '超长上下文', '中文优秀', '擅长方案策划'],
        weaknesses: ['创意写作一般', '深度分析较弱'],
        context_length: 1000000,
        cost_per_1k_tokens: 0,
        free_tier: '完全免费',
        score: 88
      },
      {
        name: 'Kimi-Long',
        display_name: 'Kimi Chat',
        platform: 'Kimi',
        region: 'CN',
        accessibility: 'account',
        category: '文案写作',
        capabilities: ['文案写作', '长文生成', '方案撰写', '报告生成', 'PPT大纲'],
        strengths: ['超长上下文(200K)', '中文优秀', '网页版免费'],
        weaknesses: ['API费用较高', '创意有限'],
        context_length: 200000,
        cost_per_1k_tokens: 0.0012,
        free_tier: '网页版免费',
        score: 89
      },
      {
        name: 'Claude Haiku',
        display_name: 'Claude 3.5 Haiku',
        platform: 'Anthropic',
        region: 'INTL',
        accessibility: 'api-key',
        category: '文案写作',
        capabilities: ['文案写作', '短文生成', '翻译', 'PPT大纲'],
        strengths: ['速度快', '便宜', '200K 上下文', '文案质量高'],
        weaknesses: ['长文质量一般', '创意有限', '需要国际账号'],
        context_length: 200000,
        cost_per_1k_tokens: 0.00025,
        free_tier: '无',
        score: 82
      },
      {
        name: 'GPT-4o-mini',
        display_name: 'GPT-4o Mini',
        platform: 'OpenAI',
        region: 'INTL',
        accessibility: 'api-key',
        category: '文案写作',
        capabilities: ['文案写作', '方案撰写', '报告生成', '翻译'],
        strengths: ['性价比高', '速度快', '多语言支持好'],
        weaknesses: ['中文创意一般', '需要国际账号'],
        context_length: 128000,
        cost_per_1k_tokens: 0.00015,
        free_tier: '有限',
        score: 86
      },
      {
        name: 'DeepSeek-V3',
        display_name: 'DeepSeek V3',
        platform: 'DeepSeek',
        region: 'CN',
        accessibility: 'api-key',
        category: '文案写作',
        capabilities: ['文案写作', '长文生成', '方案撰写', '报告生成', '深度分析'],
        strengths: ['中文优秀', '长上下文', '成本极低', '擅长方案策划'],
        weaknesses: ['创意写作一般'],
        context_length: 64000,
        cost_per_1k_tokens: 0.00007,
        free_tier: '有免费额度',
        score: 90
      },
      // ========== 搜索研究类 ==========
      {
        name: 'Perplexity',
        display_name: 'Perplexity AI',
        platform: 'Perplexity',
        region: 'INTL',
        accessibility: 'account',
        category: '搜索研究',
        capabilities: ['搜索研究', '信息收集', '引用来源', '实时信息', '年报分析'],
        strengths: ['实时联网', '信息来源标注', '深度研究', '擅长财报分析'],
        weaknesses: ['免费额度有限', '生成内容较短', '需要国际账号'],
        context_length: 500000,
        cost_per_1k_tokens: 0.003,
        free_tier: '有限',
        score: 95
      },
      {
        name: 'DeepSearch',
        display_name: 'DeepSeek 搜索',
        platform: 'DeepSeek',
        region: 'CN',
        accessibility: 'api-key',
        category: '搜索研究',
        capabilities: ['搜索研究', '信息收集', '年报分析', '行业调研'],
        strengths: ['中文优化', '成本低', '长输出能力'],
        weaknesses: ['实时性一般'],
        context_length: 32000,
        cost_per_1k_tokens: 0.001,
        free_tier: '有免费额度',
        score: 88
      },
      // ========== 翻译类 ==========
      {
        name: 'DeepL-Pro',
        display_name: 'DeepL 翻译',
        platform: 'DeepL',
        region: 'INTL',
        accessibility: 'account',
        category: '翻译',
        capabilities: ['翻译', '中英翻译', '多语言', '本地化'],
        strengths: ['翻译质量最高', '中文优化极好', '术语准确'],
        weaknesses: ['仅限翻译', '无生成能力', '需要国际账号'],
        context_length: 5000,
        cost_per_1k_tokens: 0.002,
        free_tier: '有限',
        score: 93
      },
      {
        name: 'Google-Translate',
        display_name: 'Google 翻译 API',
        platform: 'Google',
        region: 'INTL',
        accessibility: 'api-key',
        category: '翻译',
        capabilities: ['翻译', '多语言', '本地化'],
        strengths: ['支持语言最多', '速度快', '免费额度大'],
        weaknesses: ['翻译质量一般', '中文优化弱', '需要国际账号'],
        context_length: 5000,
        cost_per_1k_tokens: 0,
        free_tier: '50万字符/月免费',
        score: 78
      },
      {
        name: 'Baidu-Translate',
        display_name: '百度翻译 API',
        platform: 'Baidu',
        region: 'CN',
        accessibility: 'api-key',
        category: '翻译',
        capabilities: ['翻译', '中英翻译', '多语言'],
        strengths: ['中文优化好', '免费额度', '国内访问快'],
        weaknesses: ['质量略逊于 DeepL'],
        context_length: 6000,
        cost_per_1k_tokens: 0,
        free_tier: '200万字符/月免费',
        score: 82
      },
      // ========== 数据分析类 ==========
      {
        name: 'Claude-Opus',
        display_name: 'Claude 3 Opus',
        platform: 'Anthropic',
        region: 'INTL',
        accessibility: 'api-key',
        category: '数据分析',
        capabilities: ['数据分析', '图表生成', '复杂分析', 'BI报告'],
        strengths: ['分析深度最强', '逻辑推理优秀', '200K上下文'],
        weaknesses: ['成本最高', '速度较慢', '需要国际账号'],
        context_length: 200000,
        cost_per_1k_tokens: 0.015,
        free_tier: '无',
        score: 97
      },
      {
        name: 'GPT-4o-Data',
        display_name: 'GPT-4o 数据分析',
        platform: 'OpenAI',
        region: 'INTL',
        accessibility: 'api-key',
        category: '数据分析',
        capabilities: ['数据分析', '图表生成', '可视化', 'BI报告'],
        strengths: ['可视化代码强', '图表美观', '支持多模态'],
        weaknesses: ['深度分析一般', '需要国际账号'],
        context_length: 128000,
        cost_per_1k_tokens: 0.005,
        free_tier: '有限',
        score: 91
      },
      {
        name: 'Qwen-Analysis',
        display_name: '通义千问 分析版',
        platform: 'Qwen',
        region: 'CN',
        accessibility: 'free',
        category: '数据分析',
        capabilities: ['数据分析', '图表生成', 'BI报告'],
        strengths: ['免费使用', '中文友好', '长上下文'],
        weaknesses: ['复杂分析较弱'],
        context_length: 32000,
        cost_per_1k_tokens: 0,
        free_tier: '完全免费',
        score: 84
      },
      // ========== AI 绘画类 ==========
      {
        name: 'DALL-E-3',
        display_name: 'DALL-E 3',
        platform: 'OpenAI',
        region: 'INTL',
        accessibility: 'api-key',
        category: 'AI 绘画',
        capabilities: ['AI 绘画', '图片生成', '海报设计'],
        strengths: ['图像质量最高', '文字渲染准确', '风格多样'],
        weaknesses: ['成本较高', '生成较慢', '需要国际账号'],
        context_length: 4000,
        cost_per_1k_tokens: 0.04,
        free_tier: '无',
        score: 94
      },
      {
        name: 'Stable-Diffusion',
        display_name: 'Stable Diffusion XL',
        platform: 'Stability',
        region: 'INTL',
        accessibility: 'free',
        category: 'AI 绘画',
        capabilities: ['AI 绘画', '图片生成', '海报设计', '插画'],
        strengths: ['开源免费', '风格灵活', '本地部署'],
        weaknesses: ['文字渲染弱', '质量不稳定'],
        context_length: 77,
        cost_per_1k_tokens: 0,
        free_tier: '完全免费(本地)',
        score: 88
      },
      {
        name: 'Tongyi-Wanxiang',
        display_name: '通义万相',
        platform: 'Qwen',
        region: 'CN',
        accessibility: 'free',
        category: 'AI 绘画',
        capabilities: ['AI 绘画', '图片生成', '海报设计'],
        strengths: ['免费使用', '中文提示词优化', '国内访问快'],
        weaknesses: ['风格相对单一'],
        context_length: 2048,
        cost_per_1k_tokens: 0,
        free_tier: '完全免费',
        score: 86
      }
    ];
  }
}

module.exports = ModelMatcher;
