import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { logger } from './logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '1025', 10),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export class EmailService {
  static async send(options: {
    to: string;
    subject: string;
    templateName: string;
    context: any;
    attachments?: any[];
  }) {
    try {
      // 1. Load and compile template
      const templatePath = path.join(__dirname, `../templates/${options.templateName}.hbs`);
      const templateHtml = await fs.readFile(templatePath, 'utf-8');
      const template = handlebars.compile(templateHtml);
      const html = template(options.context);

      // 2. Send email
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Lunara AI" <hello@lunara.ai>',
        to: options.to,
        subject: options.subject,
        html,
        attachments: options.attachments,
      });

      logger.info('Email sent successfully', { messageId: info.messageId, to: options.to });
      return info;
    } catch (error: any) {
      logger.error('Failed to send email', { error: error.message, to: options.to });
      throw error;
    }
  }
}
