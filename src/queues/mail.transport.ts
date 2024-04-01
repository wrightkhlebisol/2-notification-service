import { config } from '@notifications/config';
import { IEmailLocals, winstonLogger } from '@wrightkhlebisol/jobber-shared';
import { Logger } from 'winston';
import { sendEmailWithTemplates } from '@notifications/helpers';

const log: Logger = winstonLogger(
  `${config.ELASTIC_SEARCH_URL}`,
  'email-transport',
  'debug',
);

export async function sendEmail(
  template: string,
  recipient: string,
  locals: IEmailLocals,
): Promise<void> {
  try {
    sendEmailWithTemplates(template, recipient, locals);
    log.info(`Email to ${recipient} sent successfully.`);
  } catch (error) {
    log.error('NotificationService sendEmail() method error', error);
  }
}
