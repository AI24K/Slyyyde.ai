import { chromium } from 'playwright';

async function testPlaywright() {
  console.log('Starting Playwright test...');
  
  try {
    // Launch the browser
    console.log('Launching browser...');
    const browser = await chromium.launch({ headless: true });
    
    // Create a new browser context and page
    console.log('Creating new page...');
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Navigate to a test page
    console.log('Navigating to example.com...');
    await page.goto('https://example.com');
    
    // Get the page title
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // Take a screenshot
    console.log('Taking screenshot...');
    const screenshot = await page.screenshot({ path: 'test-screenshot.png' });
    console.log(`Screenshot saved as test-screenshot.png (${screenshot.length} bytes)`);
    
    // Close the browser
    await browser.close();
    
    console.log('✅ Playwright test completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Playwright test failed:');
    console.error(error);
    return false;
  }
}

// Run the test
testPlaywright().then(success => {
  process.exit(success ? 0 : 1);
});
