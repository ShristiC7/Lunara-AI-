const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function verify() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 826 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  const screenshotDir = path.join(__dirname, 'frontend_screenshots');
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir);
  
  const screenshotPath = (name) => path.join(screenshotDir, name);

  try {
    console.log('--- Navigating to Dashboard ---');
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: screenshotPath('02_dashboard_bypass.png') });

    console.log('--- Navigating to Insights ---');
    await page.goto('http://localhost:5174/insights', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: screenshotPath('03_insights_bypass.png') });

    console.log('--- Navigating to Analytics ---');
    await page.goto('http://localhost:5174/analytics', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: screenshotPath('04_analytics_bypass.png') });

    console.log('--- Navigating to Settings ---');
    await page.goto('http://localhost:5174/settings', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: screenshotPath('05_settings_bypass.png') });

    console.log('--- Testing Logger Modal ---');
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    
    // Find FAB and click
    const fabExists = await page.$('button'); // FAB usually has no text or specific icon
    if (fabExists) {
      // In our code, QuickLogFAB has a button with PenLine icon.
      // Let's try to find a button in the bottom right area.
      const rect = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const fab = btns.find(b => {
          const r = b.getBoundingClientRect();
          return r.bottom > 700 && r.right > 1400;
        });
        if (fab) {
          fab.click();
          return true;
        }
        return false;
      });
      
      if (rect) {
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: screenshotPath('06_logger_modal_bypass.png') });
      }
    }

  } catch (err) {
    console.error('Verification failed:', err);
  } finally {
    await browser.close();
    console.log('Verification script finished.');
  }
}

verify();
