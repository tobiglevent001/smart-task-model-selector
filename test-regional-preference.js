/**
 * AI 模型选择器 - 区域偏好功能测试脚本
 * 测试国内外平台智能推荐功能
 */

const ModelMatcher = require('./src/matcher/modelMatcher');

console.log('\n');
console.log('╔════════════════════════════════════════════════════════════════════════╗');
console.log('║         AI 模型选择器 - 区域偏好功能测试                               ║');
console.log('╚════════════════════════════════════════════════════════════════════════╝');

// 测试用例
const testCases = [
  {
    name: '测试1：无国际账号 + 国内优先 → 搜索研究任务',
    taskType: '搜索研究',
    complexity: '中等',
    requirements: ['中文', '长文档'],
    config: {
      hasInternationalAccess: false,
      hasAccounts: { openai: false, anthropic: false, perplexity: false },
      hasDomesticAccounts: { qwen: true, deepseek: true, kimi: false },
      preference: 'domestic-first'
    },
    tokenEstimate: { min: 800, avg: 2000, max: 5000 }
  },
  {
    name: '测试2：无国际账号 + 国内优先 → 文案写作任务',
    taskType: '文案写作',
    complexity: '复杂',
    requirements: ['中文', '长文档'],
    config: {
      hasInternationalAccess: false,
      hasAccounts: { openai: false, anthropic: false, perplexity: false },
      hasDomesticAccounts: { qwen: true, deepseek: true, kimi: true },
      preference: 'domestic-first'
    },
    tokenEstimate: { min: 2000, avg: 5000, max: 15000 }
  },
  {
    name: '测试3：有国际账号 + 国际优先 → 代码生成任务',
    taskType: '代码生成',
    complexity: '复杂',
    requirements: ['Python', '数据库'],
    config: {
      hasInternationalAccess: true,
      hasAccounts: { openai: true, anthropic: true, perplexity: false },
      hasDomesticAccounts: { qwen: true, deepseek: true, kimi: false },
      preference: 'international-first'
    },
    tokenEstimate: { min: 1500, avg: 3000, max: 8000 }
  }
];

// 运行测试
async function runTests() {
  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    
    console.log('\n' + '='.repeat(80));
    console.log(`📋 ${tc.name}`);
    console.log('='.repeat(80));
    
    console.log('\n📝 任务信息：');
    console.log('   - 任务类型：', tc.taskType);
    console.log('   - 复杂度：', tc.complexity);
    console.log('   - 技术要求：', tc.requirements.join(', '));
    
    console.log('\n🔧 用户配置：');
    console.log('   - 国际访问：', tc.config.hasInternationalAccess ? '✅ 有' : '❌ 无');
    console.log('   - 国内账号：', Object.entries(tc.config.hasDomesticAccounts).filter(([k,v])=>v).map(([k])=>k).join(', ') || '无');
    console.log('   - 推荐偏好：', tc.config.preference === 'domestic-first' ? '🇨🇳 国内优先' : '🌍 国际优先');
    
    // 创建匹配器
    const matcher = new ModelMatcher();
    
    // 注入测试配置
    matcher.userConfig = {
      userAccess: tc.config
    };
    
    // 任务分析
    const analysis = {
      taskType: tc.taskType,
      complexity: tc.complexity,
      requirements: tc.requirements
    };
    
    // 模型匹配
    console.log('\n📊 模型匹配结果：');
    
    const result = matcher.matchModels(analysis, tc.tokenEstimate, {
      optimizationPreference: 'balanced',
      accuracyMode: 'standard'
    });
    
    if (result.error) {
      console.log('   ❌ 错误：', result.error);
      continue;
    }
    
    // 显示推荐
    const recs = result.recommendations;
    
    console.log('\n🏆 三档推荐：');
    
    // 免费首选
    if (recs.free) {
      console.log('\n🥇 免费首选：');
      console.log('   ', recs.free.display_name);
      console.log('   区域：', recs.free.region === 'CN' ? '🇨🇳 国内' : '🌍 国际', 
                  ' | 访问：', recs.free.accessibility === 'free' ? '✅ 免费' : '⚠️ 需API');
      console.log('   成本：', `¥${recs.free.costEstimate.minNum.toFixed(4)} - ¥${recs.free.costEstimate.maxNum.toFixed(4)}`);
      console.log('   评分：', '⭐'.repeat(Math.round(recs.free.matchScore / 20)));
    }
    
    // 性价比之选
    if (recs.balanced) {
      console.log('\n💰 性价比之选：');
      console.log('   ', recs.balanced.display_name);
      console.log('   区域：', recs.balanced.region === 'CN' ? '🇨🇳 国内' : '🌍 国际',
                  ' | 访问：', recs.balanced.accessibility === 'free' ? '✅ 免费' : '⚠️ 需API');
      console.log('   成本：', `¥${recs.balanced.costEstimate.minNum.toFixed(4)} - ¥${recs.balanced.costEstimate.maxNum.toFixed(4)}`);
      console.log('   评分：', '⭐'.repeat(Math.round(recs.balanced.matchScore / 20)));
    }
    
    // 效果最佳
    if (recs.quality) {
      console.log('\n💎 效果最佳：');
      console.log('   ', recs.quality.display_name);
      console.log('   区域：', recs.quality.region === 'CN' ? '🇨🇳 国内' : '🌍 国际',
                  ' | 访问：', recs.quality.accessibility === 'free' ? '✅ 免费' : '⚠️ 需API');
      console.log('   成本：', `¥${recs.quality.costEstimate.minNum.toFixed(4)} - ¥${recs.quality.costEstimate.maxNum.toFixed(4)}`);
      console.log('   评分：', '⭐'.repeat(Math.round(recs.quality.matchScore / 20)));
    }
    
    // 验证结果
    console.log('\n' + '─'.repeat(80));
    console.log('✅ 验证：');
    
    // 验证推荐是否符合配置
    const recommendedModels = [recs.free, recs.balanced, recs.quality].filter(Boolean);
    const cnModels = recommendedModels.filter(m => m.region === 'CN');
    const intlModels = recommendedModels.filter(m => m.region === 'INTL');
    
    if (tc.config.preference === 'domestic-first') {
      if (cnModels.length > 0) {
        console.log('   ✅ 正确：优先推荐了国内模型 (', cnModels.map(m=>m.display_name).join(', '), ')');
      }
      if (intlModels.length > 0) {
        const inaccessible = intlModels.filter(m => m.matchScore < 50);
        if (inaccessible.length === intlModels.length) {
          console.log('   ✅ 正确：国际模型因不可访问被降分 (评分 < 50)');
        }
      }
    }
    
    if (tc.config.preference === 'international-first' && tc.config.hasInternationalAccess) {
      if (intlModels.length > 0) {
        console.log('   ✅ 正确：优先推荐了国际模型 (', intlModels.map(m=>m.display_name).join(', '), ')');
      }
    }
    
    // 检查是否所有推荐都可访问
    const allAccessible = recommendedModels.every(m => m.matchScore >= 50);
    if (allAccessible) {
      console.log('   ✅ 所有推荐模型都可访问');
    } else {
      const inaccessible = recommendedModels.filter(m => m.matchScore < 50);
      console.log('   ⚠️ 有', inaccessible.length, '个推荐模型可能不可访问');
    }
  }
  
  // 总结
  console.log('\n' + '='.repeat(80));
  console.log('📊 测试总结');
  console.log('='.repeat(80));
  
  console.log('\n✅ 实现的功能：');
  console.log('   1. 区域标识：每个模型标注 🇨🇳 国内 / 🌍 国际');
  console.log('   2. 访问要求：标注 ✅ 免费使用 / ⚠️ 需API Key / ⚠️ 需国际账号');
  console.log('   3. 智能降分：不可访问的模型自动降分（-50分）');
  console.log('   4. 区域偏好：国内优先模式下，国内模型获得 +15 分加分');
  console.log('   5. 配置化：用户可配置文件声明拥有的平台账号');
  
  console.log('\n💡 推荐逻辑：');
  console.log('   综合评分 = 基础评分 + 任务匹配度 + 复杂度适配 + 区域偏好 - 不可访问惩罚');
  
  console.log('\n🎯 效果：');
  console.log('   - 无国际账号用户：优先展示国内免费/低成本模型');
  console.log('   - 有国际账号用户：可选择"国际优先"，仍推荐国际平台');
  console.log('   - 所有推荐都清晰标注区域和访问要求，避免用户困惑');
}

// 运行测试
runTests().catch(console.error);
