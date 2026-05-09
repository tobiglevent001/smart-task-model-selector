/**
 * i18n 国际化模块
 * 支持中文 (zh) 和英文 (en) 的语言切换
 */

const translations = {
  zh: {
    // Task types
    'task.code_gen': '代码生成',
    'task.code_review': '代码审查',
    'task.code_debug': '代码调试',
    'task.writing': '文案写作',
    'task.translation': '翻译',
    'task.research': '搜索研究',
    'task.data_analysis': '数据分析',
    'task.ai_art': 'AI 绘画',
    'task.image_processing': '图片处理',

    // Complexity
    'complexity.simple': '简单',
    'complexity.medium': '中等',
    'complexity.complex': '复杂',

    // UI Labels
    'ui.task_type': '任务类型',
    'ui.complexity': '复杂度',
    'ui.tech_requirements': '技术要求',
    'ui.confidence': '置信度',
    'ui.token_estimate': 'Token 消耗预估',
    'ui.estimate_level': '预估级别',
    'ui.token_count': 'Token 数量',
    'ui.estimated_cost': '预估成本',
    'ui.description': '说明',
    'ui.min': '最小',
    'ui.avg': '平均',
    'ui.max': '最大',
    'ui.min_desc': '理想情况，一次过',
    'ui.avg_desc': '标准情况，正常交互',
    'ui.max_desc': '复杂情况，多轮调试',
    'ui.estimated_time': '预计耗时',
    'ui.cost_note': '💡 成本预估基于模型单价计算，实际费用因使用量而异',

    // Recommendation labels
    'rec.free': '🥇 免费首选',
    'rec.balanced': '💰 性价比之选',
    'rec.quality': '💎 效果最佳',
    'rec.model': '模型',
    'rec.region': '区域',
    'rec.access': '访问',
    'rec.cost': '💰 成本',
    'rec.unit_price': '💹 单价',
    'rec.time': '⏱️ 耗时',
    'rec.effect': '⭐ 效果',
    'rec.pros': '优点',
    'rec.cons': '缺点',

    // Region labels
    'region.cn': '🇨🇳 国内',
    'region.intl': '🌍 国际',

    // Access labels
    'access.free': '✅ 免费使用',
    'access.account_cn': '⚠️ 需要注册账号',
    'access.account_intl': '⚠️ 需要国际账号',
    'access.api_key_cn': '⚠️ 需要API Key',
    'access.api_key_intl': '⚠️ 需要国际API Key',

    // Section headers
    'section.price_status': '💰 价格数据状态',
    'section.task_analysis': '📋 任务分析结果',
    'section.token_estimate': '📊 Token 消耗预估',
    'section.model_recommendation': '🏆 模型推荐对比',
    'section.cost_comparison': '💰 模型成本对比表',
    'section.insight': '💡 智能建议',
    'section.price_ref': '💰 价格参考',

    // Price reference
    'price.domestic_label': '🇨🇳 国内',
    'price.intl_label': '🌍 国际',
    'price.exchange_rate': '💱 汇率',
    'price.domestic_ref': '参考：DeepSeek Flash ¥0.1/元 (≈$0.014)',
    'price.intl_ref': '参考：GPT-4o-mini $0.15/千Token',
    'price.free': '免费使用',

    // Cost display
    'cost.free': '免费',

    // Choice prompts
    'choice.select': '请选择模型（输入数字）：',
    'choice.free': '🆓 免费首选：',
    'choice.balanced': '💰 性价比之选：',
    'choice.quality': '💎 效果最佳：',
    'choice.detail': '详细对比',
    'choice.reselect': '重新选择精度/偏好',

    // Insights
    'insight.free_recommend': '存在免费模型选项，推荐使用',
    'insight.cost_ratio': '最贵模型成本是最便宜的 {ratio} 倍，请根据需求和预算选择',
    'insight.suggestion1': '如果预算敏感 → 选择【免费首选】',
    'insight.suggestion2': '如果追求性价比 → 选择【性价比之选】推荐',
    'insight.suggestion3': '如果对效果要求极高 → 选择【效果最佳】',

    // Config
    'config.title': 'Smart Task-Model Selector 配置向导',
    'config.welcome': '欢迎！让我们配置您的模型偏好',

    // Warnings
    'warn.inaccessible': '⚠️ 提示：您可能暂无访问权限，已降低推荐优先级',
    'warn.budget_exceeded': '所有模型都超出预算',
    'warn.budget_suggestion': '请提高预算或选择免费模型',

    // CLI
    'cli.title': '🎯 Smart Task-Model Selector',
    'cli.input_prompt': '请描述你的任务：',
    'cli.analyzing': '🚀 开始分析任务...',
    'cli.done': '✅ 完成！',

    // Time estimates
    'time.20_40': '20-40 秒',
    'time.30_60': '30-60 秒',
    'time.45_90': '45-90 秒',
  },
  en: {
    // Task types
    'task.code_gen': 'Code Generation',
    'task.code_review': 'Code Review',
    'task.code_debug': 'Code Debugging',
    'task.writing': 'Content Writing',
    'task.translation': 'Translation',
    'task.research': 'Search & Research',
    'task.data_analysis': 'Data Analysis',
    'task.ai_art': 'AI Art Generation',
    'task.image_processing': 'Image Processing',

    // Complexity
    'complexity.simple': 'Simple',
    'complexity.medium': 'Medium',
    'complexity.complex': 'Complex',

    // UI Labels
    'ui.task_type': 'Task Type',
    'ui.complexity': 'Complexity',
    'ui.tech_requirements': 'Requirements',
    'ui.confidence': 'Confidence',
    'ui.token_estimate': 'Token Consumption Estimate',
    'ui.estimate_level': 'Estimate Level',
    'ui.token_count': 'Token Count',
    'ui.estimated_cost': 'Estimated Cost',
    'ui.description': 'Description',
    'ui.min': 'Min',
    'ui.avg': 'Avg',
    'ui.max': 'Max',
    'ui.min_desc': 'Ideal case, one-shot',
    'ui.avg_desc': 'Standard case, normal interaction',
    'ui.max_desc': 'Complex case, multi-round debugging',
    'ui.estimated_time': 'Est. Time',
    'ui.cost_note': '💡 Cost estimates are based on model pricing; actual costs may vary',

    // Recommendation labels
    'rec.free': '🥇 Free Pick',
    'rec.balanced': '💰 Best Value',
    'rec.quality': '💎 Best Quality',
    'rec.model': 'Model',
    'rec.region': 'Region',
    'rec.access': 'Access',
    'rec.cost': '💰 Cost',
    'rec.unit_price': '💹 Unit Price',
    'rec.time': '⏱️ Time',
    'rec.effect': '⭐ Quality',
    'rec.pros': 'Pros',
    'rec.cons': 'Cons',

    // Region labels
    'region.cn': '🇨🇳 Domestic',
    'region.intl': '🌍 International',

    // Access labels
    'access.free': '✅ Free to use',
    'access.account_cn': '⚠️ Registration required',
    'access.account_intl': '⚠️ International account required',
    'access.api_key_cn': '⚠️ API Key required',
    'access.api_key_intl': '⚠️ International API Key required',

    // Section headers
    'section.price_status': '💰 Price Data Status',
    'section.task_analysis': '📋 Task Analysis',
    'section.token_estimate': '📊 Token Estimate',
    'section.model_recommendation': '🏆 Model Recommendations',
    'section.cost_comparison': '💰 Cost Comparison',
    'section.insight': '💡 Smart Insights',
    'section.price_ref': '💰 Price Reference',

    // Price reference
    'price.domestic_label': '🇨🇳 Domestic',
    'price.intl_label': '🌍 International',
    'price.exchange_rate': '💱 Exchange Rate',
    'price.domestic_ref': 'Ref: DeepSeek Flash ¥0.1/token (≈$0.014)',
    'price.intl_ref': 'Ref: GPT-4o-mini $0.15/1K tokens',
    'price.free': 'Free to use',

    // Cost display
    'cost.free': 'Free',

    // Choice prompts
    'choice.select': 'Select a model (enter number):',
    'choice.free': '🆓 Free Pick: ',
    'choice.balanced': '💰 Best Value: ',
    'choice.quality': '💎 Best Quality: ',
    'choice.detail': 'Detailed Comparison',
    'choice.reselect': 'Reselect Preferences',

    // Insights
    'insight.free_recommend': 'Free model option available, recommended',
    'insight.cost_ratio': 'Most expensive model costs {ratio}x the cheapest; choose based on your needs and budget',
    'insight.suggestion1': 'Budget sensitive → Choose 【Free Pick】',
    'insight.suggestion2': 'Best value → Choose 【Best Value】',
    'insight.suggestion3': 'Best quality needed → Choose 【Best Quality】',

    // Config
    'config.title': 'Smart Task-Model Selector Configuration',
    'config.welcome': 'Welcome! Let us configure your model preferences',

    // Warnings
    'warn.inaccessible': '⚠️ Note: You may not have access; recommendation priority lowered',
    'warn.budget_exceeded': 'All models exceed budget',
    'warn.budget_suggestion': 'Please increase budget or select a free model',

    // CLI
    'cli.title': '🎯 Smart Task-Model Selector',
    'cli.analyzing': '🚀 Analyzing task...',
    'cli.done': '✅ Done!',

    // Time estimates
    'time.20_40': '20-40 sec',
    'time.30_60': '30-60 sec',
    'time.45_90': '45-90 sec',
  }
};

class I18n {
  /**
   * @param {string} lang - 初始语言，默认 'zh'
   */
  constructor(lang = 'zh') {
    this.lang = lang;
    this.translations = translations;
  }

  /**
   * 翻译 key 对应的文本
   * @param {string} key - 翻译键，如 'task.code_gen'
   * @param {Object} params - 可选的插值参数，如 { ratio: '5' }
   * @returns {string} 翻译后的文本，找不到时返回 key 本身
   */
  t(key, params = {}) {
    const dict = this.translations[this.lang] || this.translations['zh'];
    let text = dict[key];

    // 回退到中文
    if (text === undefined) {
      text = this.translations['zh'][key];
    }

    // 仍然找不到，返回 key 本身
    if (text === undefined) {
      return key;
    }

    // 简单插值：替换 {key} 形式的占位符
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }

    return text;
  }

  /**
   * 设置语言
   * @param {string} lang - 'zh' 或 'en'
   */
  setLang(lang) {
    if (this.translations[lang]) {
      this.lang = lang;
    }
  }

  /**
   * 获取当前语言
   * @returns {string}
   */
  getLang() {
    return this.lang;
  }

  /**
   * 检测文本是否主要是英文
   * 简单启发式：如果 >50% 的字符是 ASCII 字母，视为英文
   * @param {string} text - 输入文本
   * @returns {boolean}
   */
  static detectEnglish(text) {
    if (!text || text.length === 0) return false;
    let asciiLetterCount = 0;
    for (const ch of text) {
      if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z')) {
        asciiLetterCount++;
      }
    }
    return asciiLetterCount / text.length > 0.5;
  }
}

module.exports = I18n;
