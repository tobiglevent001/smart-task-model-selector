/**
 * AI 模型选择器 - 真实任务测试（双币种成本版）
 * 测试三个实际用户任务
 */

const TaskClassifier = require('./src/parser/taskClassifier');
const TokenEstimator = require('./src/estimator/tokenEstimator');
const ModelMatcher = require('./src/matcher/modelMatcher');

console.log('\n');
console.log('╔════════════════════════════════════════════════════════════════════════╗');
console.log('║         AI 模型选择器 - 真实任务测试（双币种成本版）                ║');
console.log('╚════════════════════════════════════════════════════════════════════════╝');

// 真实测试用例
const testCases = [
  {
    name: '任务1：跨境独立官网开发',
    task: '开发一个跨境的独立官网，面向欧美市场，需要多语言支持、SEO优化、支付集成、国际化设计风格',
    expectedType: '代码生成'
  },
  {
    name: '任务2：股价与新闻关系调研',
    task: '调研一家上市公司过去半年的股价变动，分析并找出与经营动态新闻的关联关系，形成一份分析报告',
    expectedType: '搜索研究'
  },
  {
    name: '任务3：AI知识问答小程序',
    task: '开发一个面向中小学生的AI知识互动问答小程序，包含题目库、智能出题、答题反馈、学习报告等功能',
    expectedType: '代码生成'
  }
];

// 辅助函数：获取双币种价格显示
function getPriceDisplay(model) {
  const costPer1K = model.cost_per_1k_tokens;
  const exchangeRate = 7.2;
  
  if (costPer1K === 0) {
    return '免费使用';
  }
  
  if (model.region === 'CN') {
    const usdPrice = costPer1K / exchangeRate;
    return `¥${costPer1K.toFixed(5)}/K (≈$${usdPrice.toFixed(5)})`;
  } else {
    const cnyPrice = costPer1K * exchangeRate;
    return `$${costPer1K.toFixed(5)}/K (≈¥${cnyPrice.toFixed(5)})`;
  }
}

// 模拟用户配置：无国际账号，国内优先
const userConfig = {
  hasInternationalAccess: false,
  hasAccounts: { openai: false, anthropic: false, perplexity: false, deepl: false, google: false },
  hasDomesticAccounts: { qwen: true, deepseek: true, kimi: true, zhipu: false, ernie: false, spark: false },
  preference: 'domestic-first'
};

async function runTest(tc, index) {
  console.log('\n' + '='.repeat(80));
  console.log(`📋 ${tc.name}`);
  console.log('='.repeat(80));
  
  console.log('\n📝 用户任务：', tc.task);
  console.log('\n🔧 用户配置：');
  console.log('   - 国际访问：❌ 无');
  console.log('   - 国内账号：qwen, deepseek, kimi');
  console.log('   - 推荐偏好：🇨🇳 国内优先');
  
  // 1. 任务分析
  console.log('\n📊 Step 1: 任务分析...');
  const classifier = new TaskClassifier();
  const analysis = classifier.analyze(tc.task);
  
  console.log('   - 识别任务类型：', analysis.taskType);
  console.log('   - 期望任务类型：', tc.expectedType);
  console.log('   - 识别结果：', analysis.taskType === tc.expectedType ? '✅ 正确' : '⚠️ 待验证');
  console.log('   - 复杂度：', analysis.complexity);
  console.log('   - 技术要求：', analysis.requirements.join(', ') || '暂无');
  console.log('   - 置信度：', (analysis.confidence * 100).toFixed(0) + '%');
  
  // 2. Token 预估
  console.log('\n📊 Step 2: Token 预估...');
  const estimator = new TokenEstimator();
  const tokenEstimate = estimator.estimateTokens(
    analysis.taskType,
    analysis.complexity,
    analysis.requirements,
    'standard'
  );
  
  console.log('   - Token 范围：', tokenEstimate.min, '-', tokenEstimate.avg, '-', tokenEstimate.max);
  console.log('   - 预计耗时：', tokenEstimate.estimatedTime);
  
  // 3. 价格参考说明
  console.log('\n💰 价格参考：');
  const priceRef = estimator.getPriceReference();
  console.log('   🇨🇳 国内参考：', priceRef.domestic.model, '-', priceRef.domestic.pricePer1KInput, '(输入) /', priceRef.domestic.pricePer1KOutput, '(输出)');
  console.log('   🌍 国际参考：', priceRef.international.model, '-', priceRef.international.pricePer1KInput, '(输入) /', priceRef.international.pricePer1KOutput, '(输出)');
  console.log('   💱 汇率：', priceRef.exchangeRate);
  console.log('   📝 备注：', priceRef.note);
  
  // 4. 模型匹配
  console.log('\n📊 Step 3: 模型匹配...');
  const matcher = new ModelMatcher();
  matcher.userConfig = { userAccess: userConfig };
  
  const result = matcher.matchModels(analysis, tokenEstimate, {
    optimizationPreference: 'balanced',
    accuracyMode: 'standard'
  });
  
  if (result.error) {
    console.log('   ❌ 错误：', result.error);
    return;
  }
  
  // 5. 显示推荐（双币种）
  console.log('\n🏆 模型推荐结果（双币种成本）：');
  console.log('─'.repeat(80));
  
  const recs = result.recommendations;
  
  // 免费首选
  if (recs.free) {
    const m = recs.free;
    console.log('\n🥇 免费首选：', m.display_name);
    console.log('   区域：', m.region === 'CN' ? '🇨🇳 国内' : '🌍 国际');
    console.log('   访问：', m.accessibility === 'free' ? '✅ 免费' : '⚠️ 需API Key/账号');
    console.log('   💹 单价：', getPriceDisplay(m));
    console.log('   💰 成本范围：', m.costEstimate?.avg || '¥0');
    console.log('   效果：', '⭐'.repeat(Math.round(m.matchScore / 20)));
    console.log('   优点：', m.strengths.slice(0, 2).join('、'));
  }
  
  // 性价比之选
  if (recs.balanced) {
    const m = recs.balanced;
    console.log('\n💰 性价比之选：', m.display_name);
    console.log('   区域：', m.region === 'CN' ? '🇨🇳 国内' : '🌍 国际');
    console.log('   访问：', m.accessibility === 'free' ? '✅ 免费' : '⚠️ 需API Key/账号');
    console.log('   💹 单价：', getPriceDisplay(m));
    console.log('   💰 成本范围：', m.costEstimate?.avg || '¥0');
    console.log('   效果：', '⭐'.repeat(Math.round(m.matchScore / 20)));
    console.log('   优点：', m.strengths.slice(0, 2).join('、'));
  }
  
  // 效果最佳
  if (recs.quality) {
    const m = recs.quality;
    console.log('\n💎 效果最佳：', m.display_name);
    console.log('   区域：', m.region === 'CN' ? '🇨🇳 国内' : '🌍 国际');
    console.log('   访问：', m.accessibility === 'free' ? '✅ 免费' : '⚠️ 需API Key/账号');
    console.log('   💹 单价：', getPriceDisplay(m));
    console.log('   💰 成本范围：', m.costEstimate?.avg || '¥0');
    console.log('   效果：', '⭐'.repeat(Math.round(m.matchScore / 20)));
    console.log('   优点：', m.strengths.slice(0, 2).join('、'));
  }
  
  // 6. 验证总结
  console.log('\n✅ 测试验证：');
  const cnCount = [recs.free, recs.balanced, recs.quality].filter(m => m && m.region === 'CN').length;
  const intlCount = [recs.free, recs.balanced, recs.quality].filter(m => m && m.region === 'INTL').length;
  
  console.log('   - 推荐国内模型：', cnCount, '个');
  console.log('   - 推荐国际模型：', intlCount, '个');
  
  if (cnCount >= 2) {
    console.log('   - ✅ 符合"国内优先"配置');
  }
}

// 辅助函数：获取双币种价格显示
function getPriceDisplay(model) {
  const costPer1K = model.cost_per_1k_tokens;
  const exchangeRate = 7.2;
  
  if (costPer1K === 0) {
    return '免费使用';
  }
  
  if (model.region === 'CN') {
    const usdPrice = costPer1K / exchangeRate;
    return `¥${costPer1K.toFixed(5)}/K (≈$${usdPrice.toFixed(5)})`;
  } else {
    const cnyPrice = costPer1K * exchangeRate;
    return `$${costPer1K.toFixed(5)}/K (≈¥${cnyPrice.toFixed(5)})`;
  }
}

// 主函数
async function main() {
  for (let i = 0; i < testCases.length; i++) {
    await runTest(testCases[i], i + 1);
  }
  
  // 总结
  console.log('\n' + '='.repeat(80));
  console.log('📊 真实任务测试总结（双币种成本版）');
  console.log('='.repeat(80));
  
  console.log('\n✅ 新增功能：');
  console.log('   1. 💰 双币种成本显示 - 同时显示 ¥CNY 和 $USD');
  console.log('   2. 📊 价格参考说明 - 标注基于哪个模型的价格');
  console.log('   3. 💱 汇率换算 - 自动换算方便对比');
  console.log('   4. 💹 单价信息 - 显示每千Token的价格');
  
  console.log('\n📋 价格参考基准：');
  console.log('   🇨🇳 国内：DeepSeek V3 - ¥0.27/M (输入) / ¥1.10/M (输出)');
  console.log('   🌍 国际：GPT-4o-mini - $0.15/K (输入) / $0.60/K (输出)');
  console.log('   💱 汇率：1 USD ≈ ¥7.2');
  
  console.log('\n💡 成本预估说明：');
  console.log('   - 成本 = Token数量 × 模型单价');
  console.log('   - 预估为大致范围，实际因使用量而异');
  console.log('   - 免费模型：显示"免费使用"');
  console.log('   - 国内模型：主要显示¥，括号换算$');
  console.log('   - 国际模型：主要显示$，括号换算¥');
}

main().catch(console.error);
