import { chromium } from 'playwright';

async function testScreenshot() {
  console.log('Testing screenshot tool...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('https://example.com');
  const screenshot = await page.screenshot({ fullPage: true });
  console.log('Screenshot taken successfully!');
  console.log('Screenshot size (bytes):', screenshot.length);
  
  await browser.close();
}

async function testExtractText() {
  console.log('\nTesting text extraction...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('https://example.com');
  const title = await page.title();
  const h1Text = await page.$eval('h1', el => el.textContent?.trim() || '');
  
  console.log('Page title:', title);
  console.log('H1 text:', h1Text);
  
  await browser.close();
}

async function testFormSubmission() {
  console.log('\nTesting form submission...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Using a test form page
  await page.goto('https://httpbin.org/forms/post');
  
  // Fill the form
  await page.fill('input[name="custname"]', 'Test User');
  await page.selectOption('select[name="custtel"]', '408.555.1212');
  
  console.log('Form filled successfully');
  
  // Take a screenshot of the filled form
  const screenshot = await page.screenshot({ fullPage: true });
  console.log('Filled form screenshot size (bytes):', screenshot.length);
  
  await browser.close();
}

async function testLinkExtraction() {
  console.log('\nTesting link extraction...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('https://example.com');
  
  const links = await page.$$eval('a', anchors => 
    anchors.map(a => ({
      text: a.textContent?.trim(),
      href: a.href
    })).filter(link => link.text && link.href)
  );
  
  console.log(`Found ${links.length} links:`);
  links.slice(0, 5).forEach((link, i) => {
    console.log(`${i + 1}. ${link.text} - ${link.href}`);
  });
  
  await browser.close();
}

async function runTests() {
  try {
    console.log('Starting Playwright tests...');
    await testScreenshot();
    await testExtractText();
    await testFormSubmission();
    await testLinkExtraction();
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

runTests();
