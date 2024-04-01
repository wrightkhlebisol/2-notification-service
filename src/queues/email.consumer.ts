import { Channel, ConsumeMessage } from 'amqplib';
import { config } from '@notifications/config';
import { Logger } from 'winston';
import { IEmailLocals, winstonLogger } from '@wrightkhlebisol/jobber-shared';
import { createConnectionAndChannel } from '@notifications/queues/connection';
import { sendEmail } from '@notifications/queues/mail.transport';

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
        // TODO: Send email
        const { receiverEmail, username, verifyLink, resetLink, template } = JSON.parse(msg.content.toString());
        const locals: IEmailLocals = {
          appLink: config.CLIENT_URL as string,
          appIcon: config.APP_ICON as string,
          username,
          verifyLink,
          resetLink
        };
        await sendEmail(template, receiverEmail, locals);
        channel.ack(msg);
        log.info('Consumed, sent mail and acknowledged auth notification');
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

        const { sender,
          buyerUsername,
          sellerUsername,
          orderUrl,
          orderId,
          orderDue,
          title,
          description,
          amount,
          requirements,
          serviceFee,
          total,
          template } = JSON.parse(msg.content.toString());

        const locals: IEmailLocals = { sender, appLink: `${config.CLIENT_URL}`, appIcon: `${config.APP_ICON}`, amount, buyerUsername, sellerUsername, title, description, orderId, orderDue, requirements, orderUrl, serviceFee, total };

        if (template === 'orderPlaced') {
          await sendEmail(template, sender, locals);
          await sendEmail('orderReceipt', sender, locals);
        } else {
          await sendEmail(template, sender, locals);
        }

        channel.ack(msg);
        log.info('Consumed, sent mail and acknowledged order notification');
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
