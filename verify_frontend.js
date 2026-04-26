const puppeteer = require('puppeteer');
const path = require('path');

async function verify() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 826 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  const screenshotPath = (name) => path.join('C:\\Users\\shris\\.gemini\\antigravity\\brain\\fc159499-dcdc-41b1-b5c1-20df95160954\\artifacts', name);

  try {
    console.log('--- Phase 1: Login ---');
    await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: screenshotPath('01_login_page.png') });
    
    await page.type('input[type="email"]', 'test@example.com');
    await page.type('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    console.log('Waiting for Dashboard...');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
    await page.screenshot({ path: screenshotPath('02_dashboard.png') });
    console.log('Dashboard URL:', page.url());

    console.log('--- Phase 2: Sidebar & Navigation ---');
    // Check for sidebar links
    const links = await page.$$eval('nav a', el => el.map(a => a.href));
    console.log('Nav links found:', links);

    console.log('--- Phase 3: Insights ---');
    await page.goto('http://localhost:5174/insights', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: screenshotPath('03_insights.png') });

    console.log('--- Phase 4: Settings ---');
    await page.goto('http://localhost:5174/settings', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: screenshotPath('04_settings.png') });

    console.log('--- Phase 5: Logging Modal ---');
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });
    const fabExists = await page.$('button svg'); // Simplified check for FAB
    if (fabExists) {
      await page.click('button:has(svg)'); // Click FAB
      await new Promise(r => setTimeout(r, 1000)); // Wait for modal
      await page.screenshot({ path: screenshotPath('05_logger_modal.png') });
    } else {
      console.log('FAB not found on Dashboard');
    }

  } catch (err) {
    console.error('Verification failed:', err);
    await page.screenshot({ path: screenshotPath('error_state.png') });
  } finally {
    await browser.close();
  }
}

verify();
