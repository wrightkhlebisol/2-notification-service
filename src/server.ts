import 'express-async-errors';
import http from 'http';

import { Application } from 'express';
import { config } from '@notifications/config';
import { Logger } from 'winston';
import { Channel } from 'amqplib';
import { winstonLogger } from '@wrightkhlebisol/jobber-shared';
import { healthRoutes } from '@notifications/routes';
import { checkConnection } from '@notifications/elasticsearch';
import { createConnectionAndChannel } from '@notifications/queues/connection';
import { consumeAuthEmailNotification, consumeOrderEmailNotification } from '@notifications/queues/email.consumer';

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
  const emailChannel: Channel = await createConnectionAndChannel() as Channel;
  await consumeAuthEmailNotification(emailChannel);
  await consumeOrderEmailNotification(emailChannel);
  await emailChannel.assertExchange('jobber-auth-notification', 'direct', { durable: false });
  const message = JSON.stringify({ name: 'jobber-auth', service: 'notification service - auth' });
  emailChannel.publish('jobber-auth-notification', 'auth-email', Buffer.from(message));

  await emailChannel.assertExchange('jobber-order-notification', 'direct', { durable: false });
  const message1 = JSON.stringify({ name: 'jobber-order', service: 'notification service - order' });
  emailChannel.publish('jobber-auth-notification', 'auth-email', Buffer.from(message1));

}

function startElasticSearch(): void {
  checkConnection();
}
