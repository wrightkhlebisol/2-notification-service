import path from 'path';

import { config } from '@notifications/config';
import Email from 'email-templates';
import { Logger } from 'winston';
import nodemailer, { Transporter } from 'nodemailer';
import { winstonLogger, IEmailLocals } from '@wrightkhlebisol/jobber-shared';

const log: Logger = winstonLogger(
  `${config.ELASTIC_SEARCH_URL}`,
  'mail-transport-helpers',
  'debug',
);

export async function sendEmailWithTemplates(
  template: string,
  receiver: string,
  locals: IEmailLocals,
): Promise<void> {
  try {
    const transporter: Transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: config.EMAIL_SENDER,
        pass: config.EMAIL_SENDER_PASSWORD,
      },
    });

    const email: Email = new Email({
      message: {
        from: `Jobber App <${config.EMAIL_SENDER}>`,
      },
      send: true,
      preview: false,
      transport: transporter,
      views: {
        options: {
          extension: 'ejs',
        },
      },
      juice: true,
      juiceResources: {
        preserveImportant: true,
        webResources: {
          relativeTo: path.join(__dirname, '../build'),
          images: true,
        },
      },
    });

    await email.send({
      template: path.join(__dirname, `../src/emails/${template}`),
      message: {
        to: receiver,
      },
      locals,
    });

    log.info(`Sent email to ${receiver}`);
  } catch (error) {
    log.error('NotificationService sendEmail() method error', error);
  }
}
