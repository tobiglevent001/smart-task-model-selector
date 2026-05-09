/**
 * Token 预估器
 * 根据任务类型、复杂度、技术要求预估 Token 消耗（Min/Avg/Max 三档）
 */

class TokenEstimator {
  constructor() {
    // 加载模型配置
    this.taskTypes = this.loadTaskTypes();
    this.historyData = this.loadHistoryData();
    // 价格参考基准
    this.priceReference = {
      domestic: {
        model: 'DeepSeek V3',
        pricePer1K: 0.00007,  // ¥0.07/千Token
        display: '¥0.07/千Token'
      },
      international: {
        model: 'GPT-4o-mini',
        pricePer1K: 0.00015,  // $0.15/千Token
        display: '$0.15/千Token'
      }
    };
    this.exchangeRate = 7.2; // 1 USD = 7.2 CNY
  }
  
  /**
   * 预估任务 Token 消耗
   * @param {string} taskType - 任务类型（代码生成/文案写作/搜索研究等）
   * @param {string} complexity - 复杂度（简单/中等/复杂）
   * @param {Array} requirements - 技术要求数组
   * @param {string} accuracy - 精度模式（standard/high）
   * @returns {Object} {min, avg, max} Token 预估
   */
  estimateTokens(taskType, complexity, requirements = [], accuracy = 'standard') {
    // 获取基础 Token 预估
    const base = this.getBaseEstimate(taskType, complexity);
    
    // 根据技术要求调整
    const techMultiplier = this.calculateTechMultiplier(requirements);
    
    // 根据精度模式调整误差范围
    const accuracyAdjustment = this.getAccuracyAdjustment(accuracy);
    
    // 计算预估结果
    let estimate = {
      min: Math.round(base.min * techMultiplier * accuracyAdjustment.min),
      avg: Math.round(base.avg * techMultiplier * accuracyAdjustment.avg),
      max: Math.round(base.max * techMultiplier * accuracyAdjustment.max)
    };
    
    // 参考历史数据优化预估（如果有）
    estimate = this.adjustByHistory(estimate, taskType, complexity, requirements);
    
    // 添加预计耗时（基于Token数量估算，每100 token约需3-5秒）
    const avgTimeSec = Math.round((estimate.avg / 100) * 4);
    const minTimeSec = Math.round((estimate.min / 100) * 4);
    const maxTimeSec = Math.round((estimate.max / 100) * 4);
    estimate.estimatedTime = `${minTimeSec}-${maxTimeSec} 秒`;
    
    // 添加价格参考
    estimate.priceReference = this.getPriceReference();
    
    return estimate;
  }
  
  /**
   * 获取价格参考说明
   */
  getPriceReference() {
    return {
      domestic: {
        model: 'DeepSeek V3',
        description: '国内性价比之王',
        pricePer1KInput: '¥0.27/百万Token',
        pricePer1KOutput: '¥1.10/百万Token',
        freeTier: '注册送 500 万Token'
      },
      international: {
        model: 'GPT-4o-mini',
        description: '国际性价比首选',
        pricePer1KInput: '$0.15/千Token',
        pricePer1KOutput: '$0.60/千Token',
        freeTier: '有限免费额度'
      },
      exchangeRate: '1 USD ≈ ¥7.2',
      note: '💡 成本预估基于模型单价计算，实际费用因使用量而异'
    };
  }
  
  /**
   * 获取基础 Token 预估
   */
  getBaseEstimate(taskType, complexity) {
    const task = this.taskTypes.find(t => t.name === taskType);
    if (!task) {
      // 默认预估
      return { min: 200, avg: 800, max: 2000 };
    }
    
    const key = complexity === '简单' ? '简单' : 
                complexity === '复杂' ? '复杂' : '中等';
    
    return task.base_tokens[key] || task.base_tokens;
  }
  
  /**
   * 计算技术复杂度系数
   */
  calculateTechMultiplier(requirements) {
    let multiplier = 1.0;
    
    // 增加复杂度的因素
    const increaseFactors = {
      '多语言': 1.3,
      '异步': 1.2,
      '实时': 1.2,
      '数据库': 1.15,
      'API': 1.1,
      '安全': 1.2,
      '测试': 1.3,
      '部署': 1.4,
      '高并发': 1.5,
      '分布式': 1.6,
      '机器学习': 1.8,
      '图像识别': 1.5
    };
    
    // 降低复杂度的因素
    const decreaseFactors = {
      '示例': 0.8,
      '模板': 0.7,
      '简单': 0.9
    };
    
    requirements.forEach(req => {
      if (increaseFactors[req]) {
        multiplier *= increaseFactors[req];
      }
      if (decreaseFactors[req]) {
        multiplier *= decreaseFactors[req];
      }
    });
    
    return Math.min(Math.max(multiplier, 0.5), 3.0); // 限制在 0.5-3.0 之间
  }
  
  /**
   * 根据精度模式调整预估
   */
  getAccuracyAdjustment(accuracy) {
    if (accuracy === 'high') {
      // 高精度：缩小误差范围
      return {
        min: 0.9,  // Min 上调 10%
        avg: 1.0,  // Avg 不变
        max: 1.2   // Max 上调 20%（留出余量）
      };
    } else {
      // 标准精度：默认误差范围
      return {
        min: 0.7,  // Min 可能偏低
        avg: 1.0,
        max: 1.5   // Max 可能偏高
      };
    }
  }
  
  /**
   * 根据历史数据调整预估
   */
  adjustByHistory(estimate, taskType, complexity, requirements) {
    // 查找相似历史任务
    const similarTasks = this.historyData.filter(h => 
      h.taskType === taskType && 
      h.complexity === complexity
    );
    
    if (similarTasks.length >= 3) {
      // 有充足历史数据，使用平均值调整
      const avgActual = similarTasks.reduce((sum, h) => sum + h.actualTokens, 0) / similarTasks.length;
      const adjustmentFactor = avgActual / estimate.avg;
      
      return {
        min: Math.round(estimate.min * adjustmentFactor),
        avg: Math.round(estimate.avg * adjustmentFactor),
        max: Math.round(estimate.max * adjustmentFactor)
      };
    }
    
    return estimate;
  }
  
  /**
   * 格式化预估结果（用于界面展示）
   * @param {Object} estimate - Token 预估 {min, avg, max, estimatedTime}
   * @param {Object} modelInfo - 模型信息，包含 cost_per_1k 或 cost_per_1k_tokens
   */
  formatEstimate(estimate, modelInfo) {
    // 支持两种参数名：cost_per_1k 或 cost_per_1k_tokens
    const costPer1k = modelInfo.cost_per_1k || modelInfo.cost_per_1k_tokens || 0;
    
    const costMin = (estimate.min / 1000) * costPer1k;
    const costAvg = (estimate.avg / 1000) * costPer1k;
    const costMax = (estimate.max / 1000) * costPer1k;
    
    return {
      tokens: {
        min: estimate.min,
        avg: estimate.avg,
        max: estimate.max
      },
      cost: {
        min: this.formatCost(costMin),
        avg: this.formatCost(costAvg),
        max: this.formatCost(costMax)
      },
      estimatedTime: estimate.estimatedTime || '30-60 秒',
      display: this.generateDisplayTable(estimate, costMin, costAvg, costMax)
    };
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
  
  /**
   * 生成展示表格（Markdown 格式）
   */
  generateDisplayTable(estimate, costMin, costAvg, costMax) {
    const timeRange = estimate.estimatedTime || '30-90 秒';
    return `
┌─────────────┬──────────────┬──────────────┬─────────────────────┐
│ 预估级别    │ Token 数量   │ 预估成本     │ 说明                │
├─────────────┼──────────────┼──────────────┼─────────────────────┤
│ 🟢 最小     │ ${String(estimate.min).padEnd(12)} │ ${this.formatCost(costMin).padEnd(12)} │ 理想情况，一次过     │
│ 🟡 平均     │ ${String(estimate.avg).padEnd(12)} │ ${this.formatCost(costAvg).padEnd(12)} │ 标准情况，正常交互   │
│ 🔴 最大     │ ${String(estimate.max).padEnd(12)} │ ${this.formatCost(costMax).padEnd(12)} │ 复杂情况，多轮调试   │
└─────────────┴──────────────┴──────────────┴─────────────────────┘
│                                                                     │
│  ⏱️ 预计耗时：${timeRange.padEnd(50)}  │
    `.trim();
  }
  
  /**
   * 加载任务类型配置
   */
  loadTaskTypes() {
    // 实际应该从 models.yaml 加载，这里简化为内置数据
    return [
      {
        name: '代码生成',
        base_tokens: {
          '简单': { min: 300, avg: 800, max: 1500 },
          '中等': { min: 800, avg: 2000, max: 4000 },
          '复杂': { min: 2000, avg: 5000, max: 10000 }
        }
      },
      {
        name: '代码审查',
        base_tokens: {
          '简单': { min: 400, avg: 1000, max: 2000 },
          '中等': { min: 1000, avg: 2500, max: 5000 },
          '复杂': { min: 3000, avg: 6000, max: 12000 }
        }
      },
      {
        name: '代码调试',
        base_tokens: {
          '简单': { min: 300, avg: 700, max: 1500 },
          '中等': { min: 700, avg: 1800, max: 3500 },
          '复杂': { min: 2000, avg: 4000, max: 8000 }
        }
      },
      {
        name: '文案写作',
        base_tokens: {
          '简单': { min: 500, avg: 1500, max: 3000 },
          '中等': { min: 2000, avg: 5000, max: 10000 },
          '复杂': { min: 5000, avg: 12000, max: 25000 }
        }
      },
      {
        name: '翻译',
        base_tokens: {
          '简单': { min: 300, avg: 1000, max: 2000 },
          '中等': { min: 1000, avg: 3000, max: 6000 },
          '复杂': { min: 3000, avg: 8000, max: 15000 }
        }
      },
      {
        name: '搜索研究',
        base_tokens: {
          '简单': { min: 500, avg: 2000, max: 4000 },
          '中等': { min: 2000, avg: 5000, max: 10000 },
          '复杂': { min: 5000, avg: 12000, max: 25000 }
        }
      },
      {
        name: '数据分析',
        base_tokens: {
          '简单': { min: 500, avg: 1500, max: 3000 },
          '中等': { min: 1500, avg: 4000, max: 8000 },
          '复杂': { min: 4000, avg: 10000, max: 20000 }
        }
      },
      {
        name: 'AI 绘画',
        base_tokens: {
          '简单': { min: 50, avg: 100, max: 200 },
          '中等': { min: 100, avg: 200, max: 400 },
          '复杂': { min: 200, avg: 500, max: 1000 }
        }
      },
      {
        name: '图片处理',
        base_tokens: {
          '简单': { min: 100, avg: 300, max: 600 },
          '中等': { min: 300, avg: 800, max: 1500 },
          '复杂': { min: 800, avg: 2000, max: 4000 }
        }
      }
    ];
  }
  
  /**
   * 加载历史数据（用于优化预估）
   */
  loadHistoryData() {
    // 实际应该从文件或数据库加载
    // 这里返回空数组，表示没有历史数据
    return [];
  }
  
  /**
   * 记录实际 Token 消耗（用于未来优化预估）
   */
  recordActualUsage(taskType, complexity, requirements, estimatedTokens, actualTokens) {
    const record = {
      taskType,
      complexity,
      requirements,
      estimatedTokens,
      actualTokens,
      timestamp: new Date().toISOString()
    };
    
    // 实际应该写入文件或数据库
    this.historyData.push(record);
    
    // 计算误差
    const errorRate = Math.abs(actualTokens - estimatedTokens.avg) / estimatedTokens.avg;
    
    return {
      record,
      errorRate: (errorRate * 100).toFixed(1) + '%',
      isAccurate: errorRate < 0.3  // 误差 < 30% 认为准确
    };
  }
}

module.exports = TokenEstimator;
