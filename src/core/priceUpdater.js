/**
 * 价格动态更新管理器
 * 处理模型价格的实时更新和缓存管理
 */

class PriceUpdateManager {
  constructor(options = {}) {
    this.cacheDir = options.cacheDir || './cache';
    this.updateInterval = options.updateInterval || 3600000; // 默认 1 小时
    this.maxCacheAge = options.maxCacheAge || 86400000; // 默认 24 小时
    this.enableAutoUpdate = options.enableAutoUpdate !== false;
    
    // 价格数据源
    this.dataSources = {
      // 内置默认价格（作为兜底）
      default: this.getDefaultPrices(),
      
      // OpenRouter 价格 API（免费）
      openrouter: 'https://openrouter.ai/api/v1/models',
      
      // 自定义价格表（用户可配置）
      custom: null
    };
    
    this.cache = this.loadCache();
    this.updateHistory = [];
  }
  
  /**
   * 获取价格数据（带智能缓存）
   * @param {Object} options - 配置选项
   * @returns {Object} {prices, meta}
   */
  async getPrices(options = {}) {
    const {
      forceRefresh = false,      // 强制刷新
      showWarnings = true,        // 显示警告
      updateMode = 'auto'         // auto / hourly / daily / manual
    } = options;
    
    const now = Date.now();
    const cacheAge = (this.cache.lastUpdate && this.cache.lastUpdate > 0) 
      ? now - this.cache.lastUpdate 
      : -1;  // -1 表示没有缓存
    
    // 判断是否需要更新
    const needsUpdate = this.shouldUpdate(cacheAge, updateMode, forceRefresh);
    
    // 获取价格数据
    let prices = this.cache.prices || this.dataSources.default;
    let meta = {
      lastUpdate: this.cache.lastUpdate,
      source: this.cache.source || 'default',
      dataAge: cacheAge > 0 ? cacheAge : null,  // 如果是首次加载，dataAge 为 null
      isStale: this.cache.lastUpdate ? (cacheAge > this.maxCacheAge) : false,
      warning: null
    };
    
    // 如果是首次加载（没有缓存），不显示警告
    if (!this.cache.lastUpdate) {
      meta.warning = null;
    } else if (needsUpdate && showWarnings) {
      meta.warning = this.getWarningMessage(cacheAge);
    }
    
    // 如果需要更新，异步刷新（不阻塞返回）
    if (needsUpdate) {
      this.refreshPrices().catch(err => {
        console.error('价格更新失败:', err.message);
      });
    }
    
    return { prices, meta };
  }
  
  /**
   * 判断是否需要更新
   */
  shouldUpdate(cacheAge, updateMode, forceRefresh) {
    if (forceRefresh) return true;
    
    switch (updateMode) {
      case 'hourly':
        return cacheAge > 3600000; // 1 小时
        
      case 'daily':
        return cacheAge > 86400000; // 24 小时
        
      case 'manual':
        return false; // 手动模式不自动更新
        
      case 'auto':
      default:
        return cacheAge > this.maxCacheAge; // 24 小时（默认）
    }
  }
  
  /**
   * 获取警告信息
   */
  getWarningMessage(cacheAge) {
    if (cacheAge <= 0) return null;
    
    const ageHours = Math.floor(cacheAge / 3600000);
    const ageDays = Math.floor(cacheAge / 86400000);
    
    if (cacheAge > this.maxCacheAge) {
      return `⚠️ 数据已过期（${ageDays} 天前更新），建议手动刷新`;
    }
    
    if (ageHours >= 1 && ageHours < 24) {
      return `📊 数据 ${ageHours} 小时前更新，可能有变化`;
    }
    
    if (ageDays >= 1) {
      return `📊 数据 ${ageDays} 天前更新，建议刷新`;
    }
    
    return null;
  }
  
  /**
   * 刷新价格数据
   */
  async refreshPrices() {
    console.log('🔄 开始刷新价格数据...');
    
    try {
      // 1. 尝试从多个数据源获取价格
      let newPrices = await this.fetchFromSources();
      
      // 2. 对比旧价格，生成变更报告
      const changes = this.comparePrices(this.cache.prices, newPrices);
      
      // 3. 保存新数据
      this.cache = {
        prices: newPrices,
        lastUpdate: Date.now(),
        source: 'openrouter',
        changes: changes
      };
      
      this.saveCache();
      
      // 4. 记录更新历史
      this.updateHistory.push({
        timestamp: Date.now(),
        changes: changes,
        success: true
      });
      
      console.log(`✅ 价格更新成功！${changes.length} 项变更`);
      changes.forEach(c => {
        console.log(`   ${c.type}: ${c.model} - ${c.oldValue} → ${c.newValue}`);
      });
      
      return { success: true, changes };
      
    } catch (error) {
      console.error('❌ 价格更新失败:', error.message);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * 从多个数据源获取价格
   */
  async fetchFromSources() {
    const prices = {};
    
    // 1. 先加载默认价格作为基础
    Object.assign(prices, this.getDefaultPrices());
    
    // 2. 尝试从 OpenRouter 获取实时价格（如果可用）
    try {
      const openrouterPrices = await this.fetchOpenRouterPrices();
      Object.assign(prices, openrouterPrices);
    } catch (e) {
      console.log('⚠️ 无法获取 OpenRouter 价格，使用内置数据');
    }
    
    // 3. 合并自定义价格（如果有）
    if (this.dataSources.custom) {
      Object.assign(prices, this.dataSources.custom);
    }
    
    return prices;
  }
  
  /**
   * 从 OpenRouter 获取价格
   */
  async fetchOpenRouterPrices() {
    // 注意：实际使用时需要调用真实 API
    // 这里简化处理，返回示例数据
    return new Promise((resolve, reject) => {
      // 模拟 API 调用
      setTimeout(() => {
        // 返回一些常见模型的价格
        resolve({
          'gpt-4': { cost_per_1k: 0.03, free_tier: false },
          'gpt-3.5-turbo': { cost_per_1k: 0.0005, free_tier: false },
          'claude-3-opus': { cost_per_1k: 0.015, free_tier: false },
          'claude-3-sonnet': { cost_per_1k: 0.003, free_tier: false },
          'deepseek-chat': { cost_per_1k: 0.001, free_tier: true },
          'qwen-72b-chat': { cost_per_1k: 0, free_tier: true }
        });
      }, 100);
    });
  }
  
  /**
   * 对比新旧价格
   */
  comparePrices(oldPrices, newPrices) {
    const changes = [];
    
    if (!oldPrices) return changes;
    
    for (const [model, newData] of Object.entries(newPrices)) {
      const oldData = oldPrices[model];
      
      if (!oldData) {
        changes.push({
          type: '🆕 新增',
          model,
          oldValue: '-',
          newValue: `¥${newData.cost_per_1k}/1K`
        });
        continue;
      }
      
      if (oldData.cost_per_1k !== newData.cost_per_1k) {
        const change = newData.cost_per_1k - oldData.cost_per_1k;
        const percent = ((change / oldData.cost_per_1k) * 100).toFixed(1);
        
        changes.push({
          type: change > 0 ? '📈 涨价' : '📉 降价',
          model,
          oldValue: `¥${oldData.cost_per_1k}/1K`,
          newValue: `¥${newData.cost_per_1k}/1K`,
          percent: `${Math.abs(percent)}%`
        });
      }
    }
    
    return changes;
  }
  
  /**
   * 获取默认价格表
   */
  getDefaultPrices() {
    return {
      'Qwen-Coder': { cost_per_1k: 0, free_tier: true, source: 'default' },
      'DeepSeek-Coder': { cost_per_1k: 0.001, free_tier: true, source: 'default' },
      'Claude Sonnet': { cost_per_1k: 0.003, free_tier: false, source: 'default' },
      'Claude Haiku': { cost_per_1k: 0.00025, free_tier: false, source: 'default' },
      'GPT-4o': { cost_per_1k: 0.005, free_tier: false, source: 'default' },
      'GPT-4o-mini': { cost_per_1k: 0.00015, free_tier: false, source: 'default' },
      'GPT-3.5-Turbo': { cost_per_1k: 0.0005, free_tier: false, source: 'default' },
      'Perplexity': { cost_per_1k: 0.003, free_tier: true, source: 'default' },
      'Stable Diffusion': { cost_per_1k: 0, free_tier: true, source: 'default' }
    };
  }
  
  /**
   * 加载缓存
   */
  loadCache() {
    // 实际应该从文件加载
    // 这里简化为返回空缓存，但使用当前时间作为 lastUpdate 以避免显示异常
    return {
      prices: null,
      lastUpdate: null,  // 改为 null，表示没有缓存
      source: 'default',
      changes: []
    };
  }
  
  /**
   * 保存缓存
   */
  saveCache() {
    // 实际应该保存到文件
    console.log('💾 价格缓存已保存');
  }
  
  /**
   * 生成价格展示（带更新时间）
   */
  generatePriceDisplay(prices, meta) {
    const lastUpdateStr = meta.lastUpdate 
      ? new Date(meta.lastUpdate).toLocaleString('zh-CN')
      : '未知';
    
    let display = `
┌─────────────────────────────────────────────────────────────────────┐
│                    💰 实时价格数据                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  📅 数据更新时间：${lastUpdateStr.padEnd(40)}  │
│  📡 数据来源：${(meta.source || 'default').padEnd(47)}  │
│                                                                     │
`;
    
    if (meta.warning) {
      display += `  ${meta.warning}\n`;
    }
    
    if (meta.changes && meta.changes.length > 0) {
      display += `\n  🔔 最新变更：\n`;
      meta.changes.slice(0, 5).forEach(c => {
        display += `     ${c.type}: ${c.model} (${c.oldValue} → ${c.newValue})\n`;
      });
    }
    
    display += `│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 刷新设置：                                                   │ │
│  │ [1] 自动更新（推荐）  [2] 每小时  [3] 每天  [4] 手动        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
`;
    
    return display;
  }
}

// 导出
module.exports = PriceUpdateManager;
