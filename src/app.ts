import { config } from '@notifications/config';
import express, { Express } from 'express';
import { Logger } from 'winston';
import { start } from '@notifications/server';
import { winstonLogger } from '@wrightkhlebisol/jobber-shared';

const logs: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notification-app', 'debug');

function initApp(): void {
  const app: Express = express();
  start(app);
  logs.info('Notification service started successfully');
}

initApp();