import { Channel, ConsumeMessage } from 'amqplib';
import { config } from '@notifications/config';
import { Logger } from 'winston';
import { winstonLogger } from '@wrightkhlebisol/jobber-shared';
import { createConnectionAndChannel } from '@notifications/queues/connection';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notification-email-consumer', 'debug');

export async function consumeAuthEmailNotification(channel: Channel): Promise<void> {
  try {
    if (!channel) { channel = await createConnectionAndChannel() as Channel; }
    const exchangeName: string = 'jobber-auth-notification';
    const routingKey: string = 'auth-email';
    const queueName: string = 'auth-email-queue';

    const jobberQueue = await setUpQueue(channel, exchangeName, routingKey, queueName);

    channel.consume(
      jobberQueue.queue,
      async (msg: ConsumeMessage | null) => {
        if (!msg) { return; }
        console.log(msg.content.toString());
        // TODO: Send email
        channel.ack(msg);
      }
    );

  } catch (error) {
    log.error('NotificationService consumeAuthEmailNotification() method error', error);
  }
}

export async function consumeOrderEmailNotification(channel: Channel): Promise<void> {
  try {
    if (!channel) { channel = await createConnectionAndChannel() as Channel; }
    const exchangeName: string = 'jobber-order-notification';
    const routingKey: string = 'order-email';
    const queueName: string = 'order-email-queue';

    const jobberQueue = await setUpQueue(channel, exchangeName, routingKey, queueName);

    channel.consume(
      jobberQueue.queue,
      async (msg: ConsumeMessage | null) => {
        if (!msg) { return; }
        console.log(msg.content.toString());
        // TODO: Send email
        channel.ack(msg);
      }
    );

  } catch (error) {
    log.error('NotificationService consumeAuthEmailNotification() method error', error);
  }
}

async function setUpQueue(channel: Channel, exchangeName: string, routingKey: string, queueName: string) {
  // Assert or create exchange
  await channel.assertExchange(exchangeName, 'direct', { durable: false });
  // Assert or create queue
  const jobberQueue = await channel.assertQueue(queueName, { durable: false, autoDelete: false });
  // Bind queue to exchange (routes messages to queue based on routing key)
  await channel.bindQueue(jobberQueue.queue, exchangeName, routingKey);
  return jobberQueue;
}
