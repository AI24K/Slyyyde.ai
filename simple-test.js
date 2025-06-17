import { chromium } from 'playwright';

console.log('Starting Playwright test...');

(async () => {
  let browser;
  try {
    console.log('Launching browser...');
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    console.log('Navigating to example.com...');
    await page.goto('https://example.com');
    
    const title = await page.title();
    console.log(`✅ Page loaded successfully!`);
    console.log(`📄 Page title: ${title}`);
    
    // Take a screenshot
    await page.screenshot({ path: 'test-screenshot.png' });
    console.log('📸 Screenshot saved as test-screenshot.png');
    
    console.log('✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:');
    console.error(error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
