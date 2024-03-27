import 'express-async-errors';
import http from 'http';

import { Application } from 'express';
import { config } from '@notifications/config';
import { Logger } from 'winston';
import { winstonLogger } from '@wrightkhlebisol/jobber-shared';
import { healthRoutes } from '@notifications/routes';

const SERVER_PORT = 4001;

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notification-service', 'debug');

export function start(app: Application): void {
  startServer(app);
  app.use('', healthRoutes);
  startQueues();
  startElasticSearch();
}

function startServer(app: Application): void {
  try {
    const httpServer: http.Server = new http.Server(app);
    httpServer.listen(SERVER_PORT, () => {
      log.info(`Notification server running on port ${SERVER_PORT}`);

    });
    log.info(`Worker with process id of ${process.pid} for notification service started`);
  } catch (error) {
    log.log('error', 'Notification startServer() method', error);
  }
}

async function startQueues(): Promise<void> {

}

function startElasticSearch(): void {

}
