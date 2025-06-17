// import { chromium, Browser, Page, BrowserContext } from 'playwright';
// import { z } from 'zod';
// import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// // Global browser instance
// let browser: Browser | null = null;
// let context: BrowserContext | null = null;

// // Initialize Playwright browser
// async function initBrowser() {
//   if (!browser) {
//     browser = await chromium.launch({
//       headless: true,
//       args: ['--no-sandbox', '--disable-setuid-sandbox']
//     });
//   }
//   if (!context) {
//     context = await browser.newContext({
//       viewport: { width: 1280, height: 800 },
//       userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
//     });
//   }
//   return { browser, context };
// }

// // Clean up browser resources
// async function closeBrowser() {
//   if (context) {
//     await context.close();
//     context = null;
//   }
//   if (browser) {
//     await browser.close();
//     browser = null;
//   }
// }

// // Register Playwright tools with MCP server
// export function registerPlaywrightTools(server: McpServer) {
//   // Take a screenshot of a webpage
//   server.tool(
//     'take_screenshot',
//     'Take a screenshot of a webpage',
//     {
//       url: z.string().url('Please provide a valid URL').describe('The URL of the webpage to screenshot'),
//       fullPage: z.boolean().optional().default(false).describe('Whether to take a full page screenshot'),
//       waitFor: z.number().optional().default(2000).describe('Time to wait after page load in ms'),
//       selector: z.string().optional().describe('CSS selector to wait for before taking screenshot'),
//     },
//     async ({ url, fullPage, waitFor, selector }) => {
//       const { context } = await initBrowser();
//       const page = await context.newPage();

//       try {
//         await page.goto(url, { waitUntil: 'networkidle' });

//         if (selector) {
//           await page.waitForSelector(selector, { timeout: 10000 });
//         } else {
//           await page.waitForTimeout(waitFor);
//         }

//         const screenshot = await page.screenshot({
//           fullPage,
//           type: 'png',
//         });

//         return {
//           success: true,
//           screenshot: screenshot.toString('base64'),
//           format: 'base64',
//           mimeType: 'image/png'
//         };
//       } catch (error) {
//         throw new Error(`Failed to take screenshot: ${error instanceof Error ? error.message : String(error)}`);
//       } finally {
//         if (page) await page.close();
//       }
//     }
//   );

//   // Extract text content from a webpage
//   server.tool(
//     'extract_text',
//     'Extract text content from a webpage',
//     {
//       url: z.string().url('Please provide a valid URL').describe('The URL of the webpage to extract text from'),
//       selector: z.string().optional().describe('CSS selector to extract text from (defaults to body)'),
//       waitFor: z.number().optional().default(2000).describe('Time to wait after page load in ms'),
//     },
//     async ({ url, selector = 'body', waitFor }) => {
//       const { context } = await initBrowser();
//       const page = await context.newPage();

//       try {
//         await page.goto(url, { waitUntil: 'domcontentloaded' });
//         await page.waitForTimeout(waitFor);

//         const content = await page.evaluate((sel) => {
//           const element = document.querySelector(sel);
//           return element ? element.textContent?.trim() : null;
//         }, selector);

//         if (!content) {
//           throw new Error(`No content found for selector: ${selector}`);
//         }

//         return {
//           success: true,
//           url,
//           selector,
//           content
//         };
//       } catch (error) {
//         throw new Error(`Failed to extract text: ${error instanceof Error ? error.message : String(error)}`);
//       } finally {
//         if (page) await page.close();
//       }
//     }
//   );

//   // Fill and submit a form
//   server.tool(
//     'submit_form',
//     'Fill and submit a form on a webpage',
//     {
//       url: z.string().url('Please provide a valid URL').describe('The URL of the page with the form'),
//       formSelector: z.string().describe('CSS selector for the form'),
//       formData: z.record(z.string()).describe('Form field values as key-value pairs'),
//       submitButton: z.string().optional().describe('CSS selector for the submit button (defaults to form submit)'),
//       waitFor: z.number().optional().default(3000).describe('Time to wait after submission in ms'),
//     },
//     async ({ url, formSelector, formData, submitButton, waitFor }) => {
//       const { context } = await initBrowser();
//       const page = await context.newPage();

//       try {
//         await page.goto(url, { waitUntil: 'domcontentloaded' });

//         // Fill the form
//         for (const [name, value] of Object.entries(formData)) {
//           await page.fill(`[name="${name}"]`, value);
//         }

//         // Submit the form
//         if (submitButton) {
//           await page.click(submitButton);
//         } else {
//           await page.$eval(formSelector, (form: HTMLFormElement) => form.submit());
//         }

//         // Wait for navigation and additional time
//         await page.waitForLoadState('networkidle');
//         await page.waitForTimeout(waitFor);

//         return {
//           success: true,
//           url: page.url(),
//           title: await page.title(),
//           status: 'Form submitted successfully'
//         };
//       } catch (error) {
//         throw new Error(`Failed to submit form: ${error instanceof Error ? error.message : String(error)}`);
//       } finally {
//         if (page) await page.close();
//       }
//     }
//   );

//   // Get all links from a webpage
//   server.tool(
//     'get_links',
//     'Extract all links from a webpage',
//     {
//       url: z.string().url('Please provide a valid URL').describe('The URL of the webpage to extract links from'),
//       filter: z.string().optional().describe('Filter links by URL pattern (e.g., contains)'),
//       waitFor: z.number().optional().default(2000).describe('Time to wait after page load in ms'),
//     },
//     async ({ url, filter, waitFor }) => {
//       const { context } = await initBrowser();
//       const page = await context.newPage();

//       try {
//         await page.goto(url, { waitUntil: 'domcontentloaded' });
//         await page.waitForTimeout(waitFor);

//         const links = await page.evaluate((filterText) => {
//           const anchors = Array.from(document.getElementsByTagName('a'));
//           return anchors
//             .map(a => ({
//               text: a.textContent?.trim(),
//               href: a.href,
//               title: a.title || ''
//             }))
//             .filter(link =>
//               link.href &&
//               !link.href.startsWith('javascript:') &&
//               (!filterText || link.href.includes(filterText) || link.text?.includes(filterText))
//             );
//         }, filter || '');

//         return {
//           success: true,
//           url,
//           count: links.length,
//           links
//         };
//       } catch (error) {
//         throw new Error(`Failed to extract links: ${error instanceof Error ? error.message : String(error)}`);
//       } finally {
//         if (page) await page.close();
//       }
//     }
//   );

//   // Clean up function to close the browser when the server shuts down
//   process.on('SIGINT', async () => {
//     await closeBrowser();
//     process.exit(0);
//   });

//   process.on('SIGTERM', async () => {
//     await closeBrowser();
//     process.exit(0);
//   });
// }
