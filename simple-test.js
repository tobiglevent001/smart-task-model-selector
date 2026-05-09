/**
 * Simple test for AI Model Selector - ASCII output only
 */

const AIModelSelector = require('./index.js');

async function runSimpleTest() {
  console.log('====================================');
  console.log('AI Model Selector - Simple Test');
  console.log('====================================\n');
  
  const selector = new AIModelSelector();
  
  // Test 1: Code generation task
  console.log('Test 1: Code Generation Task');
  console.log('-'.repeat(50));
  
  let result1 = await selector.selectModel(
    "Write a Python web scraper",
    {
      accuracyMode: 'standard',
      optimizationPreference: 'balanced',
      updateMode: 'auto'
    }
  );
  
  console.log('\n' + '='.repeat(50));
  
  // Test 2: Check if price age is displayed correctly
  console.log('\nTest 2: Check Price Age Display');
  console.log('-'.repeat(50));
  
  const priceManager = selector.priceManager;
  const { prices, meta } = await priceManager.getPrices({ updateMode: 'auto', showWarnings: true });
  
  console.log('lastUpdate:', meta.lastUpdate);
  console.log('dataAge:', meta.dataAge);
  console.log('source:', meta.source);
  
  console.log('\n' + '='.repeat(50));
  console.log('\nAll tests completed!\n');
}

runSimpleTest().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
