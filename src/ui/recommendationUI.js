/**
 * 推荐界面生成器
 * 生成用户友好的模型推荐展示界面
 */

class RecommendationUI {
  constructor() {
    // i18n instance (optional, set externally)
    this.i18n = null;
  }

  /**
   * Helper: get translation or fallback
   */
  t(key, params) {
    return this.i18n ? this.i18n.t(key, params) : key;
  }

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
      ? new Date(priceMeta.lastUpdate).toLocaleString(this.i18n && this.i18n.getLang() === 'en' ? 'en-US' : 'zh-CN')
      : (this.i18n && this.i18n.getLang() === 'en' ? 'First load' : '首次加载');

    const dataAge = priceMeta && priceMeta.dataAge && priceMeta.dataAge > 0
      ? this.formatDataAge(priceMeta.dataAge)
      : (this.i18n && this.i18n.getLang() === 'en' ? 'Just now' : '刚刚');

    const sectionTitle = this.i18n ? this.i18n.t('section.price_status') : '💰 价格数据状态';
    const isEn = this.i18n && this.i18n.getLang() === 'en';
    const dataUpdateLabel = isEn ? 'Data updated' : '数据更新时间';
    const dataAgeLabel = isEn ? 'Data age' : '数据时效';
    const dataSourceLabel = isEn ? 'Data source' : '数据来源';

    let status = `
┌─────────────────────────────────────────────────────────────────────┐
│                    ${sectionTitle.padEnd(54)}│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  📅 ${dataUpdateLabel}：${lastUpdate.padEnd(40)}  │
│  ⏱️ ${dataAgeLabel}：${dataAge.padEnd(45)}  │
│  📡 ${dataSourceLabel}：${(priceMeta?.source || (isEn ? 'Built-in default' : '内置默认')).padEnd(45)}  │
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
    if (!ms || ms <= 0) return this.i18n && this.i18n.getLang() === 'en' ? 'Just now' : '刚刚';

    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(ms / 3600000);
    const days = Math.floor(ms / 86400000);
    const isEn = this.i18n && this.i18n.getLang() === 'en';

    if (days > 0) return isEn ? `${days} day(s) ago` : `${days} 天前`;
    if (hours > 0) return isEn ? `${hours} hour(s) ago` : `${hours} 小时前`;
    if (minutes > 0) return isEn ? `${minutes} min(s) ago` : `${minutes} 分钟前`;
    return isEn ? 'Just now' : '刚刚';
  }
  
  /**
   * 生成任务分析展示
   */
  generateAnalysisSection(analysis) {
    const confidenceStars = '⭐'.repeat(Math.max(1, Math.round(analysis.confidence * 5)));
    const isEn = this.i18n && this.i18n.getLang() === 'en';
    const requirementsText = analysis.requirements && analysis.requirements.length > 0
      ? analysis.requirements.join(', ')
      : (isEn ? 'None' : '暂无');

    const taskTypeLabel = isEn ? 'Task Type' : '任务类型';
    const complexityLabel = isEn ? 'Complexity' : '复杂度';
    const techLabel = isEn ? 'Requirements' : '技术要求';
    const confidenceLabel = isEn ? 'Confidence' : '置信度';
    const sectionTitle = this.i18n ? this.i18n.t('section.task_analysis') : '📋 任务分析结果';

    // Translate task type and complexity display
    const displayTaskType = this.translateTaskType(analysis.taskType);
    const displayComplexity = this.translateComplexity(analysis.complexity);

    return `
┌─────────────────────────────────────────────────────────────────────┐
│                    ${sectionTitle.padEnd(54)}│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ${taskTypeLabel}：${displayTaskType.padEnd(20)}                           │
│  ${complexityLabel}：${displayComplexity.padEnd(20)}                              │
│  ${techLabel}：[${requirementsText.padEnd(30)}]     │
│  ${confidenceLabel}：${confidenceStars.padEnd(10)} (${Math.round(analysis.confidence * 100)}%)        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
    `.trim();
  }

  /**
   * Translate task type for display
   */
  translateTaskType(taskType) {
    if (!this.i18n) return taskType;
    const map = {
      '代码生成': 'task.code_gen',
      '代码审查': 'task.code_review',
      '代码调试': 'task.code_debug',
      '文案写作': 'task.writing',
      '翻译': 'task.translation',
      '搜索研究': 'task.research',
      '数据分析': 'task.data_analysis',
      'AI 绘画': 'task.ai_art',
      '图片处理': 'task.image_processing'
    };
    const key = map[taskType];
    return key ? this.i18n.t(key) : taskType;
  }

  /**
   * Translate complexity for display
   */
  translateComplexity(complexity) {
    if (!this.i18n) return complexity;
    const map = {
      '简单': 'complexity.simple',
      '中等': 'complexity.medium',
      '复杂': 'complexity.complex'
    };
    const key = map[complexity];
    return key ? this.i18n.t(key) : complexity;
  }
  
  /**
   * 生成 Token 预估展示（增强版：双币种 + 价格参考）
   */
  generateTokenEstimateSection(tokenEstimate, costs, priceReference = null) {
    const minCost = costs?.min || '-';
    const avgCost = costs?.avg || '-';
    const maxCost = costs?.max || '-';
    const timeRange = costs?.estimatedTime || tokenEstimate?.estimatedTime || '30-60 秒';

    const isEn = this.i18n && this.i18n.getLang() === 'en';
    const sectionTitle = this.i18n ? this.i18n.t('section.token_estimate') : '📊 Token 消耗预估';
    const estimateLevel = isEn ? 'Est. Level' : '预估级别';
    const tokenCount = isEn ? 'Token Count' : 'Token 数量';
    const estimatedCost = isEn ? 'Est. Cost' : '预估成本';
    const description = isEn ? 'Description' : '说明';
    const minLabel = isEn ? 'Min' : '最小';
    const avgLabel = isEn ? 'Avg' : '平均';
    const maxLabel = isEn ? 'Max' : '最大';
    const minDesc = this.i18n ? this.i18n.t('ui.min_desc') : '理想情况，一次过';
    const avgDesc = this.i18n ? this.i18n.t('ui.avg_desc') : '标准情况，正常交互';
    const maxDesc = this.i18n ? this.i18n.t('ui.max_desc') : '复杂情况，多轮调试';
    const estTimeLabel = this.i18n ? this.i18n.t('ui.estimated_time') : '预计耗时';
    const costNote = this.i18n ? this.i18n.t('ui.cost_note') : '💡 成本预估基于模型单价计算，实际费用因使用量而异';

    // 构建价格参考说明
    let priceRefDisplay = '';
    if (priceReference) {
      const domesticLabel = this.i18n ? this.i18n.t('price.domestic_label') : '🇨🇳 国内';
      const intlLabel = this.i18n ? this.i18n.t('price.intl_label') : '🌍 国际';
      const rateLabel = this.i18n ? this.i18n.t('price.exchange_rate') : '💱 汇率';
      priceRefDisplay = `
│  ${domesticLabel}：${priceReference.domestic?.model || 'DeepSeek V3'} (${priceReference.domestic?.pricePer1KInput || '¥0.27/M'})          │
│  ${intlLabel}：${priceReference.international?.model || 'GPT-4o-mini'} (${priceReference.international?.pricePer1KOutput || '$0.15/K'})          │
│  ${rateLabel}：${priceReference.exchangeRate || '1 USD ≈ ¥7.2'}                                        │`;
    }

    return `
┌─────────────────────────────────────────────────────────────────────┐
│                    ${sectionTitle.padEnd(54)}│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┬──────────────┬──────────────┬─────────────────┐  │
│  │ ${estimateLevel.padEnd(11)} │ ${tokenCount.padEnd(12)} │ ${estimatedCost.padEnd(12)} │ ${description.padEnd(15)} │  │
│  ├─────────────┼──────────────┼──────────────┼─────────────────┤  │
│  │ 🟢 ${minLabel.padEnd(9)} │ ${String(tokenEstimate.min).padEnd(12)} │ ${String(minCost).padEnd(12)} │ ${minDesc.padEnd(15)} │  │
│  │ 🟡 ${avgLabel.padEnd(9)} │ ${String(tokenEstimate.avg).padEnd(12)} │ ${String(avgCost).padEnd(12)} │ ${avgDesc.padEnd(15)} │  │
│  │ 🔴 ${maxLabel.padEnd(9)} │ ${String(tokenEstimate.max).padEnd(12)} │ ${String(maxCost).padEnd(12)} │ ${maxDesc.padEnd(15)} │  │
│  └─────────────┴──────────────┴──────────────┴─────────────────┘  │
│                                                                     │
│  ⏱️ ${estTimeLabel}：${timeRange.padEnd(50)}  │${priceRefDisplay}
│  ${costNote.padEnd(70)}│
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
    const sectionTitle = this.i18n ? this.i18n.t('section.model_recommendation') : '🏆 模型推荐对比';
    const freeTitle = this.i18n ? this.i18n.t('rec.free') : '🥇 免费首选';
    const balancedTitle = this.i18n ? this.i18n.t('rec.balanced') : '💰 性价比之选';
    const qualityTitle = this.i18n ? this.i18n.t('rec.quality') : '💎 效果最佳';
    const isEn = this.i18n && this.i18n.getLang() === 'en';
    const freeBadge = isEn ? '⭐ Free Pick' : '⭐ 免费首选';
    const balancedBadge = isEn ? '⚖️ Best Value' : '⚖️ 性价比最优';
    const qualityBadge = isEn ? '💎 Best Quality' : '💎 效果最佳';

    let display = `
┌─────────────────────────────────────────────────────────────────────┐
│                    ${sectionTitle.padEnd(54)}│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
    `.trim();

    // 免费首选
    if (recommendations.free) {
      display += '\n' + this.generateRecommendationCard(recommendations.free, freeTitle, freeBadge);
    }

    // 性价比之选
    if (recommendations.balanced) {
      display += '\n\n' + this.generateRecommendationCard(recommendations.balanced, balancedTitle, balancedBadge);
    }

    // 效果最佳
    if (recommendations.quality) {
      display += '\n\n' + this.generateRecommendationCard(recommendations.quality, qualityTitle, qualityBadge);
    }

    display += '\n\n└─────────────────────────────────────────────────────────────────────┘';

    return display;
  }
  
  /**
   * 生成单个推荐卡片（双币种成本显示）
   */
  generateRecommendationCard(model, title, badge) {
    const stars = '⭐'.repeat(Math.round(model.matchScore / 20));
    const isEn = this.i18n && this.i18n.getLang() === 'en';

    // 双币种成本显示
    let costDisplay = '';
    if (model.costEstimate && model.costEstimate.min !== undefined) {
      costDisplay = `${model.costEstimate.avg}`;
    } else {
      costDisplay = this.formatCost(model.costEstimate?.minNum || 0) + ' - ' + this.formatCost(model.costEstimate?.maxNum || 0);
    }

    const timeRange = this.estimateTimeRange(model);

    // 添加区域标识
    const regionBadge = model.region === 'CN'
      ? (isEn ? '🇨🇳 Domestic' : '🇨🇳 国内')
      : (isEn ? '🌍 International' : '🌍 国际');

    // 添加访问要求提示
    let accessHint = '';
    if (model.accessibility === 'free') {
      accessHint = this.i18n ? this.i18n.t('access.free') : '✅ 免费使用';
    } else if (model.accessibility === 'account') {
      accessHint = model.region === 'CN'
        ? (this.i18n ? this.i18n.t('access.account_cn') : '⚠️ 需要注册账号')
        : (this.i18n ? this.i18n.t('access.account_intl') : '⚠️ 需要国际账号');
    } else if (model.accessibility === 'api-key') {
      accessHint = model.region === 'CN'
        ? (this.i18n ? this.i18n.t('access.api_key_cn') : '⚠️ 需要API Key')
        : (this.i18n ? this.i18n.t('access.api_key_intl') : '⚠️ 需要国际API Key');
    }

    // 判断是否是用户不可访问的模型
    const isInaccessible = model.matchScore < 50;
    const inaccessibleWarning = isInaccessible
      ? '\n║  ' + (this.i18n ? this.i18n.t('warn.inaccessible') : '⚠️ 提示：您可能暂无访问权限，已降低推荐优先级').padEnd(68) + '║'
      : '';

    // 生成优点和缺点
    const prosLabel = this.i18n ? this.i18n.t('rec.pros') : '优点';
    const consLabel = this.i18n ? this.i18n.t('rec.cons') : '缺点';
    const modelLabel = this.i18n ? this.i18n.t('rec.model') : '模型';
    const regionLabel = this.i18n ? this.i18n.t('rec.region') : '区域';
    const accessLabel = this.i18n ? this.i18n.t('rec.access') : '访问';
    const costLabel = this.i18n ? this.i18n.t('rec.cost') : '💰 成本';
    const unitPriceLabel = this.i18n ? this.i18n.t('rec.unit_price') : '💹 单价';
    const timeLabel = this.i18n ? this.i18n.t('rec.time') : '⏱️ 耗时';
    const effectLabel = this.i18n ? this.i18n.t('rec.effect') : '⭐ 效果';

    const pros = model.strengths.slice(0, 3).map(s => `✅ ${s}`).join('  ');
    const cons = model.weaknesses.slice(0, 2).map(w => `⚠️ ${w}`).join('  ');

    // 获取模型单价信息
    const priceInfo = this.getModelPriceInfo(model);

    return `
╔═════════════════════════════════════════════════════════════════╗
║  ${title.padEnd(50)}║
╠═════════════════════════════════════════════════════════════════╣
║  ${modelLabel}：${model.display_name.padEnd(50)}║
║  ${regionLabel}：${regionBadge.padEnd(45)}║
║  ${accessLabel}：${accessHint.padEnd(45)}║
║  ${costLabel}：${costDisplay.substring(0, 45).padEnd(45)}║
║  ${unitPriceLabel}：${priceInfo.padEnd(45)}║
║  ${timeLabel}：${timeRange.padEnd(45)}║
║  ${effectLabel}：${stars.padEnd(50)}║
║  ${badge.padEnd(50)}║
║                                                                    ║
║  ${prosLabel}：${pros.padEnd(50)}║
║  ${consLabel}：${cons.padEnd(50)}║${inaccessibleWarning}
╚═════════════════════════════════════════════════════════════════╝
    `.trim();
  }
  
  /**
   * 获取模型单价信息（双币种）
   */
  getModelPriceInfo(model) {
    const costPer1K = model.cost_per_1k_tokens;
    const exchangeRate = 7.2;
    const isEn = this.i18n && this.i18n.getLang() === 'en';

    if (costPer1K === 0) {
      return isEn ? 'Free to use' : '免费使用';
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
    const isEn = this.i18n && this.i18n.getLang() === 'en';
    // 简单的时间预估逻辑
    if (model.context_length > 100000) return isEn ? '20-40 sec' : '20-40 秒';
    if (model.cost_per_1k_tokens === 0) return isEn ? '45-90 sec' : '45-90 秒';
    return isEn ? '30-60 sec' : '30-60 秒';
  }
  
  /**
   * 生成对比表格
   */
  generateComparisonSection(comparison) {
    const isEn = this.i18n && this.i18n.getLang() === 'en';
    const sectionTitle = this.i18n ? this.i18n.t('section.cost_comparison') : '💰 模型成本对比表';
    const modelLabel = isEn ? 'Model' : '模型';
    const priceLabel = isEn ? 'Price(/1K)' : '单价(/1K)';
    const costLabel = isEn ? 'Est. Cost' : '预估成本';
    const effectLabel = isEn ? 'Quality' : '效果评分';

    return `
┌─────────────────────────────────────────────────────────────────────┐
│                    ${sectionTitle.padEnd(54)}│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┬─────────────┬──────────────────┬────────────────┐│
│  │ ${modelLabel.padEnd(12)} │ ${priceLabel.padEnd(11)} │ ${costLabel.padEnd(16)} │ ${effectLabel.padEnd(14)} ││
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
    const sectionTitle = this.i18n ? this.i18n.t('section.insight') : '💡 智能建议';
    const isEn = this.i18n && this.i18n.getLang() === 'en';
    const suggestionLabel = isEn ? 'Suggestions' : '建议';
    const suggestion1 = this.i18n ? this.i18n.t('insight.suggestion1') : '如果预算敏感 → 选择【免费首选】';
    const suggestion2 = this.i18n ? this.i18n.t('insight.suggestion2') : '如果追求性价比 → 选择【性价比之选】推荐';
    const suggestion3 = this.i18n ? this.i18n.t('insight.suggestion3') : '如果对效果要求极高 → 选择【效果最佳】';

    return `
┌─────────────────────────────────────────────────────────────────────┐
│                    ${sectionTitle.padEnd(54)}│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ${insight.padEnd(70)}                             │
│                                                                     │
│  ${suggestionLabel}：                                                              │
│  1. ${suggestion1.padEnd(64)}│
│  2. ${suggestion2.padEnd(64)}│
│  3. ${suggestion3.padEnd(64)}│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
    `.trim();
  }
  
  /**
   * 生成用户选择提示
   */
  generateChoicePrompt(recommendations, priceMeta = {}) {
    const selectLabel = this.i18n ? this.i18n.t('choice.select') : '请选择模型（输入数字）：';
    let prompt = '\n' + selectLabel + '\n';

    if (recommendations.free) {
      const freeLabel = this.i18n ? this.i18n.t('choice.free') : '🆓 免费首选：';
      prompt += '  [1] ' + freeLabel + recommendations.free.display_name + '\n';
    }

    if (recommendations.balanced) {
      const balancedLabel = this.i18n ? this.i18n.t('choice.balanced') : '💰 性价比之选：';
      prompt += '  [2] ' + balancedLabel + recommendations.balanced.display_name + '\n';
    }

    if (recommendations.quality) {
      const qualityLabel = this.i18n ? this.i18n.t('choice.quality') : '💎 效果最佳：';
      prompt += '  [3] ' + qualityLabel + recommendations.quality.display_name + '\n';
    }

    const detailLabel = this.i18n ? this.i18n.t('choice.detail') : '详细对比';
    const reselectLabel = this.i18n ? this.i18n.t('choice.reselect') : '重新选择精度/偏好';
    prompt += '  [4] ' + detailLabel + '\n';
    prompt += '  [5] ' + reselectLabel + '\n';

    // 价格相关选项
    const isEn = this.i18n && this.i18n.getLang() === 'en';
    if (priceMeta.dataAge && priceMeta.dataAge > 3600000) {
      prompt += '\n' + (isEn ? '💡 Price data is over 1 hour old, refresh recommended' : '💡 价格数据已超过 1 小时，建议刷新以获取最新价格') + '\n';
      prompt += '  [r] ' + (isEn ? 'Refresh prices now' : '立即刷新价格') + '\n';
    }

    return prompt;
  }
}

module.exports = RecommendationUI;
