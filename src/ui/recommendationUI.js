/**
 * 推荐界面生成器
 * 生成用户友好的模型推荐展示界面
 */

class RecommendationUI {
  /**
   * 生成完整的推荐展示
   * @param {Object} recommendations - 推荐结果
   * @param {Object} analysis - 任务分析
   * @param {Object} tokenDisplay - Token 预估展示数据（包含 tokens 和 cost）
   * @param {Object} priceMeta - 价格元数据
   * @returns {string} Markdown 格式展示
   */
  generateFullDisplay(recommendations, analysis, tokenDisplay, priceMeta = {}) {
    let display = '';
    
    // 1. 价格数据状态（新增）
    display += this.generatePriceStatus(priceMeta);
    display += '\n\n';
    
    // 2. 任务分析展示
    display += this.generateAnalysisSection(analysis);
    display += '\n\n';
    
    // 3. Token 预估展示（修复：正确传参）
    if (tokenDisplay && tokenDisplay.tokens) {
      display += this.generateTokenEstimateSection(tokenDisplay.tokens, {
        ...tokenDisplay.cost,
        estimatedTime: tokenDisplay.estimatedTime
      });
    }
    display += '\n\n';
    
    // 4. 模型推荐展示
    display += this.generateRecommendationSection(recommendations);
    display += '\n\n';
    
    // 5. 对比表格
    if (recommendations.comparison) {
      display += this.generateComparisonSection(recommendations.comparison);
      display += '\n\n';
    }
    
    // 6. 洞察建议
    if (recommendations.insight) {
      display += this.generateInsightSection(recommendations.insight);
    }
    
    return display;
  }
  
  /**
   * 生成价格状态展示（新增）
   */
  generatePriceStatus(priceMeta) {
    const lastUpdate = priceMeta && priceMeta.lastUpdate
      ? new Date(priceMeta.lastUpdate).toLocaleString('zh-CN')
      : '首次加载';
    
    const dataAge = priceMeta && priceMeta.dataAge && priceMeta.dataAge > 0
      ? this.formatDataAge(priceMeta.dataAge)
      : '刚刚';
    
    let status = `
┌─────────────────────────────────────────────────────────────────────┐
│                    💰 价格数据状态                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  📅 数据更新时间：${lastUpdate.padEnd(40)}  │
│  ⏱️ 数据时效：${dataAge.padEnd(45)}  │
│  📡 数据来源：${(priceMeta?.source || '内置默认').padEnd(45)}  │
`;
    
    if (priceMeta?.warning) {
      status += `│                                                                     │\n`;
      status += `│  ${priceMeta.warning.padEnd(68)}  │\n`;
    }
    
    if (priceMeta?.changes && priceMeta.changes.length > 0) {
      status += `│                                                                     │\n`;
      status += `│  🔔 最近变更：\n`;
      priceMeta.changes.slice(0, 3).forEach(c => {
        status += `│     ${c.type}: ${c.model} (${c.oldValue} → ${c.newValue})\n`;
      });
    }
    
    status += `│                                                                     │
│  🔄 刷新选项：                                                       │
│     [r] 立即刷新  [1] 每小时  [2] 每天  [3] 手动                  │
└─────────────────────────────────────────────────────────────────────┘`;
    
    return status.trim();
  }
  
  /**
   * 格式化数据时效
   */
  formatDataAge(ms) {
    if (!ms || ms <= 0) return '刚刚';
    
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(ms / 3600000);
    const days = Math.floor(ms / 86400000);
    
    if (days > 0) return `${days} 天前`;
    if (hours > 0) return `${hours} 小时前`;
    if (minutes > 0) return `${minutes} 分钟前`;
    return '刚刚';
  }
  
  /**
   * 生成任务分析展示
   */
  generateAnalysisSection(analysis) {
    const confidenceStars = '⭐'.repeat(Math.max(1, Math.round(analysis.confidence * 5)));
    const requirementsText = analysis.requirements && analysis.requirements.length > 0
      ? analysis.requirements.join(', ')
      : '暂无';
    
    return `
┌─────────────────────────────────────────────────────────────────────┐
│                    📋 任务分析结果                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  任务类型：${analysis.taskType.padEnd(20)}                           │
│  复杂度：${analysis.complexity.padEnd(20)}                             │
│  技术要求：[${requirementsText.padEnd(30)}]     │
│  置信度：${confidenceStars.padEnd(10)} (${Math.round(analysis.confidence * 100)}%)        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
    `.trim();
  }
  
  /**
   * 生成 Token 预估展示（增强版：双币种 + 价格参考）
   */
  generateTokenEstimateSection(tokenEstimate, costs, priceReference = null) {
    const minCost = costs?.min || '-';
    const avgCost = costs?.avg || '-';
    const maxCost = costs?.max || '-';
    const timeRange = costs?.estimatedTime || tokenEstimate?.estimatedTime || '30-60 秒';
    
    // 构建价格参考说明
    let priceRefDisplay = '';
    if (priceReference) {
      priceRefDisplay = `
│  💰 价格参考：                                                        │
│     🇨🇳 国内：${priceReference.domestic?.model || 'DeepSeek V3'} (${priceReference.domestic?.pricePer1KInput || '¥0.27/M'})          │
│     🌍 国际：${priceReference.international?.model || 'GPT-4o-mini'} (${priceReference.international?.pricePer1KOutput || '$0.15/K'})          │
│     💱 汇率：${priceReference.exchangeRate || '1 USD ≈ ¥7.2'}                                        │`;
    }
    
    return `
┌─────────────────────────────────────────────────────────────────────┐
│                    📊 Token 消耗预估                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┬──────────────┬──────────────┬─────────────────┐  │
│  │ 预估级别    │ Token 数量   │ 预估成本     │ 说明               │  │
│  ├─────────────┼──────────────┼──────────────┼─────────────────┤  │
│  │ 🟢 最小     │ ${String(tokenEstimate.min).padEnd(12)} │ ${String(minCost).padEnd(12)} │ 理想情况，一次过    │  │
│  │ 🟡 平均     │ ${String(tokenEstimate.avg).padEnd(12)} │ ${String(avgCost).padEnd(12)} │ 标准情况，正常交互  │  │
│  │ 🔴 最大     │ ${String(tokenEstimate.max).padEnd(12)} │ ${String(maxCost).padEnd(12)} │ 复杂情况，多轮调试  │  │
│  └─────────────┴──────────────┴──────────────┴─────────────────┘  │
│                                                                     │
│  ⏱️ 预计耗时：${timeRange.padEnd(50)}  │${priceRefDisplay}
│  💡 成本预估基于模型单价计算，实际费用因使用量而异                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
    `.trim();
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
    if (cost === null || cost === undefined) return '-';
    if (typeof cost === 'string') return cost;
    
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
   * 生成模型推荐展示
   */
  generateRecommendationSection(recommendations) {
    let display = `
┌─────────────────────────────────────────────────────────────────────┐
│                    🏆 模型推荐对比                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
    `.trim();
    
    // 免费首选
    if (recommendations.free) {
      display += '\n' + this.generateRecommendationCard(recommendations.free, '🥇 免费首选', '⭐ 免费首选');
    }
    
    // 性价比之选
    if (recommendations.balanced) {
      display += '\n\n' + this.generateRecommendationCard(recommendations.balanced, '💰 性价比之选', '⚖️ 性价比最优');
    }
    
    // 效果最佳
    if (recommendations.quality) {
      display += '\n\n' + this.generateRecommendationCard(recommendations.quality, '💎 效果最佳', '💎 效果最佳');
    }
    
    display += '\n\n└─────────────────────────────────────────────────────────────────────┘';
    
    return display;
  }
  
  /**
   * 生成单个推荐卡片（双币种成本显示）
   */
  generateRecommendationCard(model, title, badge) {
    const stars = '⭐'.repeat(Math.round(model.matchScore / 20));
    
    // 双币种成本显示
    let costDisplay = '';
    if (model.costEstimate && model.costEstimate.min !== undefined) {
      // 使用 calculateCost 返回的双币种格式
      costDisplay = `${model.costEstimate.avg}`;
    } else {
      // 降级：使用旧的格式
      costDisplay = this.formatCost(model.costEstimate?.minNum || 0) + ' - ' + this.formatCost(model.costEstimate?.maxNum || 0);
    }
    
    const timeRange = this.estimateTimeRange(model);
    
    // 添加区域标识
    const regionBadge = model.region === 'CN' ? '🇨🇳 国内' : '🌍 国际';
    
    // 添加访问要求提示
    let accessHint = '';
    if (model.accessibility === 'free') {
      accessHint = '✅ 免费使用';
    } else if (model.accessibility === 'account') {
      accessHint = model.region === 'CN' ? '⚠️ 需要注册账号' : '⚠️ 需要国际账号';
    } else if (model.accessibility === 'api-key') {
      accessHint = model.region === 'CN' ? '⚠️ 需要API Key' : '⚠️ 需要国际API Key';
    }
    
    // 判断是否是用户不可访问的模型
    const isInaccessible = model.matchScore < 50;
    const inaccessibleWarning = isInaccessible ? '\n║  ⚠️ 提示：您可能暂无访问权限，已降低推荐优先级              ║' : '';
    
    // 生成优点和缺点
    const pros = model.strengths.slice(0, 3).map(s => `✅ ${s}`).join('  ');
    const cons = model.weaknesses.slice(0, 2).map(w => `⚠️ ${w}`).join('  ');
    
    // 获取模型单价信息
    const priceInfo = this.getModelPriceInfo(model);
    
    return `
╔═════════════════════════════════════════════════════════════════╗
║  ${title.padEnd(50)}║
╠═════════════════════════════════════════════════════════════════╣
║  模型：${model.display_name.padEnd(50)}║
║  区域：${regionBadge.padEnd(45)}║
║  访问：${accessHint.padEnd(45)}║
║  💰 成本：${costDisplay.substring(0, 45).padEnd(45)}║
║  💹 单价：${priceInfo.padEnd(45)}║
║  ⏱️ 耗时：${timeRange.padEnd(45)}║
║  ⭐ 效果：${stars.padEnd(50)}║
║  ${badge.padEnd(50)}║
║                                                                    ║
║  优点：${pros.padEnd(50)}║
║  缺点：${cons.padEnd(50)}║${inaccessibleWarning}
╚═════════════════════════════════════════════════════════════════╝
    `.trim();
  }
  
  /**
   * 获取模型单价信息（双币种）
   */
  getModelPriceInfo(model) {
    const costPer1K = model.cost_per_1k_tokens;
    const exchangeRate = 7.2;
    
    if (costPer1K === 0) {
      return '免费使用';
    }
    
    if (model.region === 'CN') {
      // 国内模型：¥ 显示，$ 换算
      const usdPrice = costPer1K / exchangeRate;
      return `¥${costPer1K.toFixed(5)}/K (≈$${usdPrice.toFixed(5)})`;
    } else {
      // 国际模型：$ 显示，¥ 换算
      const cnyPrice = costPer1K * exchangeRate;
      return `$${costPer1K.toFixed(5)}/K (≈¥${cnyPrice.toFixed(5)})`;
    }
  }
  
  estimateTimeRange(model) {
    // 简单的时间预估逻辑
    if (model.context_length > 100000) return '20-40 秒';
    if (model.cost_per_1k_tokens === 0) return '45-90 秒';
    return '30-60 秒';
  }
  
  /**
   * 生成对比表格
   */
  generateComparisonSection(comparison) {
    return `
┌─────────────────────────────────────────────────────────────────────┐
│                    💰 模型成本对比表                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┬─────────────┬──────────────────┬────────────────┐│
│  │ 模型         │ 单价(/1K)   │ 预估成本        │ 效果评分          ││
│  ├──────────────┼─────────────┼──────────────────┼────────────────┤│
${comparison}
│  └──────────────┴─────────────┴──────────────────┴────────────────┘│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
    `.trim();
  }
  
  /**
   * 生成洞察建议
   */
  generateInsightSection(insight) {
    return `
┌─────────────────────────────────────────────────────────────────────┐
│                    💡 智能建议                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ${insight.padEnd(70)}                             │
│                                                                     │
│  建议：                                                              │
│  1. 如果预算敏感 → 选择【免费首选】                                 │
│  2. 如果追求性价比 → 选择【性价比之选】推荐                        │
│  3. 如果对效果要求极高 → 选择【效果最佳】                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
    `.trim();
  }
  
  /**
   * 生成用户选择提示
   */
  generateChoicePrompt(recommendations, priceMeta = {}) {
    let prompt = '\n请选择模型（输入数字）：\n';
    
    if (recommendations.free) {
      prompt += '  [1] 🆓 免费首选：' + recommendations.free.display_name + '\n';
    }
    
    if (recommendations.balanced) {
      prompt += '  [2] 💰 性价比之选：' + recommendations.balanced.display_name + '\n';
    }
    
    if (recommendations.quality) {
      prompt += '  [3] 💎 效果最佳：' + recommendations.quality.display_name + '\n';
    }
    
    prompt += '  [4] 详细对比\n';
    prompt += '  [5] 重新选择精度/偏好\n';
    
    // 价格相关选项
    if (priceMeta.dataAge && priceMeta.dataAge > 3600000) {
      prompt += '\n💡 价格数据已超过 1 小时，建议刷新以获取最新价格\n';
      prompt += '  [r] 立即刷新价格\n';
    }
    
    return prompt;
  }
}

module.exports = RecommendationUI;
