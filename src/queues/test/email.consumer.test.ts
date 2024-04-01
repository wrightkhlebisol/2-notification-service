import amqp from 'amqplib';
import * as connection from '@notifications/queues/connection';
import {
  consumeAuthEmailNotification,
  consumeOrderEmailNotification,
} from '@notifications/queues/email.consumer';

jest.mock('@notifications/queues/connection');
jest.mock('amqplib');
jest.mock('@wrightkhlebisol/jobber-shared');

describe('Email Consumer', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('consumeAuthEmailMessages method', () => {
    it('should be called', async () => {
      const channel = {
        assertExchange: jest.fn(),
        assertQueue: jest.fn(),
        bindQueue: jest.fn(),
        consume: jest.fn(),
        publish: jest.fn(),
      };

      jest.spyOn(channel, 'assertExchange');
      jest.spyOn(channel, 'assertQueue').mockReturnValue({
        queue: 'auth-email-queue',
        messageCount: 0,
        consumerCount: 0,
      });
      jest
        .spyOn(connection, 'createConnectionAndChannel')
        .mockReturnValue(channel as never);
      const connectionChannel: amqp.Channel | undefined =
        await connection.createConnectionAndChannel();
      await consumeAuthEmailNotification(connectionChannel!);

      expect(connectionChannel!.assertExchange).toHaveBeenCalledWith(
        'jobber-auth-notification',
        'direct',
        { durable: false },
      );
      expect(connectionChannel!.assertQueue).toHaveBeenCalledTimes(1);
      expect(connectionChannel!.consume).toHaveBeenCalledTimes(1);
      expect(connectionChannel!.bindQueue).toHaveBeenCalledWith(
        'auth-email-queue',
        'jobber-auth-notification',
        'auth-email',
      );
    });
  });

  describe('consumeOrderEmailMessages method', () => {
    it('should be called', async () => {
      const channel = {
        assertExchange: jest.fn(),
        assertQueue: jest.fn(),
        bindQueue: jest.fn(),
        consume: jest.fn(),
        publish: jest.fn(),
      };

      jest.spyOn(channel, 'assertExchange');
      jest.spyOn(channel, 'assertQueue').mockReturnValue({
        queue: 'order-email-queue',
        messageCount: 0,
        consumerCount: 0,
      });
      jest
        .spyOn(connection, 'createConnectionAndChannel')
        .mockReturnValue(channel as never);
      const connectionChannel: amqp.Channel | undefined =
        await connection.createConnectionAndChannel();
      await consumeOrderEmailNotification(connectionChannel!);

      expect(connectionChannel!.assertExchange).toHaveBeenCalledWith(
        'jobber-order-notification',
        'direct',
        { durable: false },
      );
      expect(connectionChannel!.assertQueue).toHaveBeenCalledTimes(1);
      expect(connectionChannel!.consume).toHaveBeenCalledTimes(1);
      expect(connectionChannel!.bindQueue).toHaveBeenCalledWith(
        'order-email-queue',
        'jobber-order-notification',
        'order-email',
      );
    });
  });
});

// describe('consumeAuthEmailNotification', () => {
//   it('should consume and send email', async () => {
//     const mockChannel: Channel = {
//       assertExchange: jest.fn(),
//       assertQueue: jest.fn(),
//       bindQueue: jest.fn(),
//       consume: jest.fn(),
//       publish: jest.fn(),
//       ack: jest.fn(),
//     };

//     const mockMessage: ConsumeMessage = {
//       content: Buffer.from(JSON.stringify({
//         receiverEmail: 'test@example.com',
//         username: 'testuser',
//         verifyLink: 'https://example.com/verify',
//         resetLink: 'https://example.com/reset',
//         template: 'email-template',
//       })),
//     };

//     jest.spyOn(connection, 'createConnectionAndChannel').mockResolvedValue(mockChannel);
//     jest.spyOn(mockChannel, 'consume').mockImplementation((queue, callback) => {
//       callback(mockMessage);
//     });

//     await consumeAuthEmailNotification(mockChannel);

//     expect(mockChannel.assertExchange).toHaveBeenCalledWith('jobber-auth-notification', 'direct');
//     expect(mockChannel.assertQueue).toHaveBeenCalledWith('auth-email-queue');
//     expect(mockChannel.bindQueue).toHaveBeenCalledWith('jobber-auth-notification', 'direct');
//     expect(mockChannel.consume).toHaveBeenCalledWith('auth-email-queue', expect.any(Function));
//     expect(mockChannel.ack).toHaveBeenCalledWith(mockMessage);
//   });

//   it('should handle error', async () => {
//     const mockChannel: Channel = {
//       assertExchange: jest.fn(),
//       assertQueue: jest.fn(),
//       bindQueue: jest.fn(),
//       consume: jest.fn(),
//       publish: jest.fn(),
//       ack: jest.fn(),
//     };

//     jest.spyOn(connection, 'createConnectionAndChannel').mockRejectedValue(new Error('Connection error'));
//     jest.spyOn(console, 'error').mockImplementation();

//     await consumeAuthEmailNotification(mockChannel);

//     expect(console.error).toHaveBeenCalledWith('NotificationService consumeAuthEmailNotification() method error', expect.any(Error));
//   });
// });
