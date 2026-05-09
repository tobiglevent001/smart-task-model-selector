/**
 * 配置管理器
 * 管理用户国内外平台访问权限配置
 */

class ConfigManager {
  constructor() {
    this.configPath = require('path').join(__dirname, '../../config.json');
    this.fs = require('fs');
  }
  
  /**
   * 加载配置
   */
  loadConfig() {
    try {
      const configData = this.fs.readFileSync(this.configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      // 返回默认配置
      return this.getDefaultConfig();
    }
  }
  
  /**
   * 保存配置
   */
  saveConfig(config) {
    try {
      this.fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error('保存配置失败：', error.message);
      return false;
    }
  }
  
  /**
   * 获取默认配置
   */
  getDefaultConfig() {
    return {
      version: '1.0.0',
      userAccess: {
        hasInternationalAccess: false,
        hasAccounts: {
          openai: false,
          anthropic: false,
          perplexity: false,
          deepl: false,
          google: false
        },
        hasDomesticAccounts: {
          qwen: true,
          deepseek: true,
          kimi: false,
          zhipu: false,
          ernie: false,
          spark: false
        },
        preference: 'domestic-first',
        showAccessHint: true
      },
      regionPriority: {
        'domestic-first': ['CN', 'INTL'],
        'international-first': ['INTL', 'CN'],
        'domestic-only': ['CN'],
        'international-only': ['INTL']
      }
    };
  }
  
  /**
   * 运行配置向导（交互式）
   */
  runSetupWizard() {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║     🔧 Smart Task-Model Selector - 首次配置向导                     ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    console.log('本向导将帮助您配置国内外 AI 平台的访问权限。');
    console.log('这样我们可以优先推荐您能使用的模型。\n');
    
    const config = this.getDefaultConfig();
    const answers = {};
    
    const askQuestion = (question) => {
      return new Promise((resolve) => {
        rl.question(question, (answer) => {
          resolve(answer.trim().toLowerCase());
        });
      });
    };
    
    const main = async () => {
      // 1. 询问国际平台访问权限
      console.log('📌 第一步：国际平台访问');
      console.log('大多数国内用户无法直接访问 OpenAI、Claude、Perplexity 等国际平台。\n');
      
      answers.hasInternational = await askQuestion('您是否有国际 AI 平台的 API 账号或访问权限？(y/n，默认 n): ');
      config.userAccess.hasInternationalAccess = answers.hasInternational === 'y' || answers.hasInternational === 'yes';
      
      if (config.userAccess.hasInternationalAccess) {
        console.log('\n请选择您拥有的国际平台账号（多选，空格分隔）：');
        console.log('  1. OpenAI (GPT 系列)');
        console.log('  2. Anthropic (Claude 系列)');
        console.log('  3. Perplexity AI');
        console.log('  4. DeepL 翻译');
        console.log('  5. Google (Gemini/翻译)');
        
        const intlPlatforms = await askQuestion('\n输入编号（如：1 2 3）或输入 n 跳过: ');
        
        if (intlPlatforms !== 'n') {
          const selections = intlPlatforms.split(' ').map(s => s.trim());
          config.userAccess.hasAccounts.openai = selections.includes('1');
          config.userAccess.hasAccounts.anthropic = selections.includes('2');
          config.userAccess.hasAccounts.perplexity = selections.includes('3');
          config.userAccess.hasAccounts.deepl = selections.includes('4');
          config.userAccess.hasAccounts.google = selections.includes('5');
        }
      }
      
      // 2. 询问国内平台访问权限
      console.log('\n\n📌 第二步：国内平台访问');
      console.log('国内平台通常更容易访问，很多提供免费额度。\n');
      
      console.log('请选择您拥有的国内平台账号（多选，空格分隔）：');
      console.log('  1. 通义千问 (Qwen) - 阿里云');
      console.log('  2. DeepSeek - 深度求索');
      console.log('  3. Kimi (Moonshot) - 月之暗面');
      console.log('  4. 智谱 AI (ChatGLM)');
      console.log('  5. 文心一言 (ERNIE) - 百度');
      console.log('  6. 讯飞星火 (Spark)');
      
      const domPlatforms = await askQuestion('\n输入编号（如：1 2）或输入 n 跳过: ');
      
      if (domPlatforms !== 'n') {
        const selections = domPlatforms.split(' ').map(s => s.trim());
        config.userAccess.hasDomesticAccounts.qwen = selections.includes('1');
        config.userAccess.hasDomesticAccounts.deepseek = selections.includes('2');
        config.userAccess.hasDomesticAccounts.kimi = selections.includes('3');
        config.userAccess.hasDomesticAccounts.zhipu = selections.includes('4');
        config.userAccess.hasDomesticAccounts.ernie = selections.includes('5');
        config.userAccess.hasDomesticAccounts.spark = selections.includes('6');
      }
      
      // 3. 询问推荐偏好
      console.log('\n\n📌 第三步：推荐偏好');
      console.log('选择模型推荐的优先级：\n');
      console.log('  1. 国内优先（推荐）- 优先推荐国内平台，国际平台作为备选');
      console.log('  2. 国际优先 - 优先推荐国际平台，国内平台作为备选');
      console.log('  3. 仅国内 - 只推荐国内平台');
      console.log('  4. 仅国际 - 只推荐国际平台\n');
      
      const preference = await askQuestion('请选择（1-4，默认 1）: ');
      
      const prefMap = {
        '1': 'domestic-first',
        '2': 'international-first',
        '3': 'domestic-only',
        '4': 'international-only'
      };
      
      config.userAccess.preference = prefMap[preference] || 'domestic-first';
      
      // 4. 保存配置
      console.log('\n\n✅ 配置完成！正在保存...');
      
      if (this.saveConfig(config)) {
        console.log('✅ 配置已保存到：' + this.configPath);
        console.log('\n您随时可以通过以下命令重新配置：');
        console.log('  /smart-task-model-selector --config\n');
        
        // 显示配置摘要
        this.displayConfigSummary(config);
      } else {
        console.log('❌ 配置保存失败，请检查文件权限');
      }
      
      rl.close();
    };
    
    main();
  }
  
  /**
   * 显示配置摘要
   */
  displayConfigSummary(config) {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                     📋 配置摘要                              ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    console.log('国际平台访问：', config.userAccess.hasInternationalAccess ? '✅ 是' : '❌ 否');
    
    if (config.userAccess.hasInternationalAccess) {
      const intlAccounts = Object.entries(config.userAccess.hasAccounts)
        .filter(([k, v]) => v)
        .map(([k]) => k)
        .join(', ');
      console.log('已配置的国际平台：', intlAccounts || '无');
    }
    
    console.log('\n国内平台账号：');
    Object.entries(config.userAccess.hasDomesticAccounts)
      .filter(([k, v]) => v)
      .forEach(([k]) => {
        console.log(`  ✅ ${this.getPlatformDisplayName(k, 'CN')}`);
      });
    
    console.log('\n推荐偏好：', this.getPreferenceDisplayName(config.userAccess.preference));
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
  
  /**
   * 获取平台显示名称
   */
  getPlatformDisplayName(platform, region) {
    const names = {
      'qwen': '通义千问 (Qwen)',
      'deepseek': 'DeepSeek',
      'kimi': 'Kimi (Moonshot)',
      'zhipu': '智谱 AI (ChatGLM)',
      'ernie': '文心一言 (ERNIE)',
      'spark': '讯飞星火 (Spark)',
      'openai': 'OpenAI',
      'anthropic': 'Anthropic (Claude)',
      'perplexity': 'Perplexity AI',
      'deepl': 'DeepL',
      'google': 'Google'
    };
    
    return names[platform] || platform;
  }
  
  /**
   * 获取偏好显示名称
   */
  getPreferenceDisplayName(preference) {
    const names = {
      'domestic-first': '🇨🇳 国内优先（国内平台优先，国际平台备选）',
      'international-first': '🌍 国际优先（国际平台优先，国内平台备选）',
      'domestic-only': '🇨🇳 仅国内（只推荐国内平台）',
      'international-only': '🌍 仅国际（只推荐国际平台）'
    };
    
    return names[preference] || preference;
  }
  
  /**
   * 更新配置（命令行模式）
   */
  updateConfig(updates) {
    const config = this.loadConfig();
    
    // 深度合并更新
    if (updates.userAccess) {
      config.userAccess = { ...config.userAccess, ...updates.userAccess };
    }
    
    if (updates.regionPriority) {
      config.regionPriority = { ...config.regionPriority, ...updates.regionPriority };
    }
    
    return this.saveConfig(config);
  }
  
  /**
   * 重置为默认配置
   */
  resetConfig() {
    const defaultConfig = this.getDefaultConfig();
    return this.saveConfig(defaultConfig);
  }
}

module.exports = ConfigManager;

// 如果直接运行此文件，启动配置向导
if (require.main === module) {
  const manager = new ConfigManager();
  manager.runSetupWizard();
}
