import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { logger } from './logger';

export class PdfGenerator {
  static async generate(data: any): Promise<Buffer> {
    logger.info('Generating PDF report...', { userId: data.userId });
    
    let browser;
    try {
      // 1. Load and compile template
      const templatePath = path.join(__dirname, '../templates/report.hbs');
      const templateHtml = await fs.readFile(templatePath, 'utf-8');
      const template = handlebars.compile(templateHtml);
      const html = template(data);

      // 2. Launch Puppeteer
      browser = await puppeteer.launch({
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
        headless: true,
      });

      const page = await browser.newPage();
      
      // 3. Set content and wait for it to be ready
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // 4. Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
      });

      logger.info('PDF generated successfully', { userId: data.userId, size: pdfBuffer.length });
      return pdfBuffer;
    } catch (error: any) {
      logger.error('Failed to generate PDF', { 
        userId: data.userId, 
        error: error.message 
      });
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}
