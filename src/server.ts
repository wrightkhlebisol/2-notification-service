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
import {
  consumeAuthEmailNotification,
  consumeOrderEmailNotification,
} from '@notifications/queues/email.consumer';

const SERVER_PORT = 4001;

const log: Logger = winstonLogger(
  `${config.ELASTIC_SEARCH_URL}`,
  'notification-service',
  'debug',
);

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
    log.info(
      `Worker with process id of ${process.pid} for notification service started`,
    );
  } catch (error) {
    log.log('error', 'Notification startServer() method', error);
  }
}

async function startQueues(): Promise<void> {
  const emailChannel: Channel = (await createConnectionAndChannel()) as Channel;
  await consumeAuthEmailNotification(emailChannel);
  await consumeOrderEmailNotification(emailChannel);
  // await emailChannel.assertExchange('jobber-auth-notification', 'direct', { durable: false });
  // const verificationLink = 'http://localhost:4000/verify';
  // const authMessageDetails: IEmailMessageDetails = {
  //   receiverEmail: config.EMAIL_SENDER as string,
  //   verifyLink: verificationLink,
  //   template: 'verifyEmail',
  // };
  // const message = JSON.stringify(authMessageDetails);
  // emailChannel.publish('jobber-auth-notification', 'auth-email', Buffer.from(message));
  // log.info(`Published auth notification for ${authMessageDetails.receiverEmail}`);

  await emailChannel.assertExchange('jobber-order-notification', 'direct', {
    durable: false,
  });
  const orderMessageDetails = {
    sender: `Jobber App <${config.EMAIL_SENDER}>`,
    buyerUsername: 're_wrighting',
    sellerUsername: 'cuddle_baby',
    orderUrl: 'http://localhost:4000/orders/jnh73rrg78h',
    orderId: 'jnh73rrg78h',
    orderDue: '2014-08-12T12:20:25.000Z',
    title: 'Build Ecommerce app',
    description:
      'Build me something like Alibabas website but with a twist',
    amount: '3400.00',
    serviceFee: '340.00',
    requirements: 'Make it pop',
    template: 'orderPlaced',
    total: '3740.00',
  };
  const orderContent = JSON.stringify(orderMessageDetails);
  emailChannel.publish(
    'jobber-order-notification',
    'order-email',
    Buffer.from(orderContent),
  );
}

function startElasticSearch(): void {
  checkConnection();
}
