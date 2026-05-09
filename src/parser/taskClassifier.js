/**
 * 任务分类器
 * 分析用户输入，识别任务类型、复杂度、技术要求
 */

class TaskClassifier {
  constructor() {
    // 任务类型关键词
    this.taskKeywords = {
      '代码生成': [
        '写代码', '写一个', '实现', '开发', '创建', '生成代码',
        'login', '注册', '登录', 'api', '接口', '函数', '类',
        'crud', '增删改查', '后台', '管理', '系统', '编程',
        'code', 'coding', '写程序', '软件开发'
      ],
      '代码审查': [
        '审查', 'review', '检查代码', '代码质量', '优化代码',
        '重构', 'refactor', '改进', '提升代码'
      ],
      '代码调试': [
        '调试', 'debug', '报错', 'bug', '错误', '不工作', '失败',
        '修复', 'fix', '问题', '异常'
      ],
      '文案写作': [
        '写作', '写文章', '写文案', '写小说', '写故事', '写报告',
        '写总结', '写邮件', '写方案', '写策划', '写PPT', '做PPT',
        '撰写', '生成PPT', '演示文稿', '幻灯片', '促销', '推广',
        '营销', '宣传', '广告', '策划案', '活动方案', '商业计划'
      ],
      '翻译': [
        '翻译', 'translate', '中英', '英中', '多语言', '本地化',
        '口译', '笔译', '译本', '外文', '英文版', '中文版'
      ],
      '搜索研究': [
        '搜索', '上网搜索', '查找', '研究', '分析', '了解', '对比',
        '调研', '调查', '信息收集', '年报', '季报', '半年报', '财报',
        '索引', '汇总', '整理', '下载', '采集', '爬取', '收录'
      ],
      '数据分析': [
        '数据分析', '统计', '图表', '可视化', '报表', '处理数据',
        '分析数据', '数据清洗', '数据挖掘', '数据处理', 'BI',
        'dashboard', '数据汇总', '数据分析报告'
      ],
      'AI 绘画': [
        '画', '绘画', '生成图片', 'AI 绘画', '画图', '设计图',
        'midjourney', 'stable diffusion', '文生图'
      ],
      '图片处理': [
        '处理图片', '编辑图片', '抠图', '滤镜', '修图',
        '图片增强', '图片压缩'
      ]
    };
    
    // 复杂度关键词
    this.complexityKeywords = {
      '简单': [
        '简单', '基础', '入门', 'hello world', '示例',
        '单个', '一个功能', '小功能', '简单', '简短的'
      ],
      '复杂': [
        '复杂', '大型', '系统', '平台', '完整', '全栈',
        '分布式', '高并发', '微服务', '架构', '企业级',
        '全面', '详细', '深度', '综合', '完整版'
      ]
      // 默认是 '中等'
    };
    
    // 技术要求关键词
    this.techKeywords = {
      '多语言': ['多语言', '国际化', 'i18n', '双语', '中英', '英文'],
      '数据库': ['数据库', 'mysql', 'postgresql', 'mongodb', 'redis', 'sql'],
      'API': ['api', '接口', 'restful', 'graphql'],
      '实时': ['实时', 'websocket', 'socket.io', '即时'],
      '异步': ['异步', 'async', 'promise', '协程'],
      '安全': ['安全', '加密', '认证', '授权', 'jwt', 'oauth'],
      '测试': ['测试', '单元测试', '集成测试', 'test', 'tdd'],
      '部署': ['部署', 'docker', 'kubernetes', 'ci/cd'],
      '高并发': ['高并发', '分布式', '负载均衡', '缓存'],
      '机器学习': ['机器学习', '深度学习', 'ai', '训练', '模型'],
      '长文档': ['长文', '万字', '详细', '全面', '深度'],
      '中文': ['中文', '中英', '中文版', '中文优先']
    };
  }
  
  /**
   * 分析用户任务
   * @param {string} userInput - 用户输入
   * @returns {Object} {taskType, complexity, requirements}
   */
  analyze(userInput) {
    const input = userInput.toLowerCase();
    
    // 1. 识别任务类型
    const taskType = this.identifyTaskType(input);
    
    // 2. 评估复杂度
    const complexity = this.assessComplexity(input, taskType);
    
    // 3. 提取技术要求
    const requirements = this.extractRequirements(input);
    
    return {
      taskType,
      complexity,
      requirements,
      confidence: this.calculateConfidence(taskType, input)
    };
  }
  
  /**
   * 识别任务类型
   */
  identifyTaskType(input) {
    let bestMatch = '文案写作';  // 默认改为更通用的文案写作
    let bestScore = 0;
    
    for (const [taskType, keywords] of Object.entries(this.taskKeywords)) {
      const score = this.calculateKeywordScore(input, keywords);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = taskType;
      }
    }
    
    // 如果没有任何关键词匹配，给出未知但合理的默认值
    if (bestScore === 0) {
      // 根据输入内容判断
      if (input.includes('分析') || input.includes('研究')) return '搜索研究';
      if (input.includes('写') || input.includes('方案') || input.includes('报告')) return '文案写作';
      if (input.includes('翻译')) return '翻译';
      if (input.includes('代码') || input.includes('程序')) return '代码生成';
      return '文案写作';  // 默认文案写作更通用
    }
    
    return bestMatch;
  }
  
  /**
   * 计算关键词匹配分数（增强版：支持模糊匹配）
   */
  calculateKeywordScore(input, keywords) {
    let score = 0;
    keywords.forEach(keyword => {
      const kw = keyword.toLowerCase();
      if (input.includes(kw)) {
        // 精确匹配给2分，部分匹配给1分
        score += input === kw ? 3 : (input.startsWith(kw) || input.endsWith(kw)) ? 2 : 1;
      }
    });
    return score;
  }
  
  /**
   * 评估复杂度
   */
  assessComplexity(input, taskType) {
    // 检查明确的复杂度关键词
    for (const [level, keywords] of Object.entries(this.complexityKeywords)) {
      for (const keyword of keywords) {
        if (input.includes(keyword.toLowerCase())) {
          return level;
        }
      }
    }
    
    // 根据输入描述长度和关键词推断
    const wordCount = input.length;
    
    // 多步骤任务特征词
    const multiStepIndicators = ['搜索', '查找', '收集', '整理', '汇总', '索引', '下载', '撰写', '分析', '对比'];
    const multiStepCount = multiStepIndicators.filter(w => input.includes(w)).length;
    
    // 方案类任务（促销方案、商业计划等）通常中等~复杂
    const planIndicators = ['方案', '计划', '策划', '报告', '提案', '建议'];
    const hasPlanIndicator = planIndicators.some(w => input.includes(w));
    
    // 搜索+整理类任务通常中等
    if (multiStepCount >= 2 || (multiStepCount >= 1 && hasPlanIndicator)) {
      return '中等';
    }
    
    // 简单任务
    if (wordCount < 15) return '简单';
    
    // 超长描述通常是复杂任务
    if (wordCount > 80) return '复杂';
    
    // 中等描述
    if (wordCount > 30) return '中等';
    
    // 根据特定指标判断
    if (taskType === '代码生成') {
      if (input.includes('登录') || input.includes('注册')) return '中等';
      if (input.includes('系统') || input.includes('平台')) return '复杂';
    }
    
    // 方案/策划类默认中等偏复杂
    if (hasPlanIndicator) return '中等';
    
    return '中等';  // 默认
  }
  
  /**
   * 提取技术要求
   */
  extractRequirements(input) {
    const requirements = [];
    
    for (const [tech, keywords] of Object.entries(this.techKeywords)) {
      for (const keyword of keywords) {
        if (input.includes(keyword.toLowerCase())) {
          if (!requirements.includes(tech)) {
            requirements.push(tech);
          }
          break;
        }
      }
    }
    
    return requirements;
  }
  
  /**
   * 计算置信度（改进版）
   */
  calculateConfidence(taskType, input) {
    const keywords = this.taskKeywords[taskType] || [];
    if (keywords.length === 0) return 0.5;
    
    const matchedKeywords = keywords.filter(keyword => {
      return input.includes(keyword.toLowerCase());
    });
    
    // 匹配数量越多置信度越高
    const rawConfidence = Math.min(matchedKeywords.length / 5, 1.0);
    return rawConfidence;
  }
  
  /**
   * 生成任务分析展示（Markdown 格式）
   */
  generateAnalysisDisplay(analysis) {
    return `
┌─────────────────────────────────────────────────────────────────────┐
│                    📋 任务分析结果                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  任务类型：${analysis.taskType.padEnd(20)}                           │
│  复杂度：${analysis.complexity.padEnd(20)}                              │
│  技术要求：[${analysis.requirements.join(', ')}]                     │
│  置信度：${'⭐'.repeat(Math.round(analysis.confidence * 5))}        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
    `.trim();
  }
}

module.exports = TaskClassifier;
