import { Injectable, Logger } from '@nestjs/common';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private readonly expo = new Expo();

  async send(tokens: string[], title: string, body: string, data?: Record<string, unknown>) {
    const messages: ExpoPushMessage[] = tokens
      .filter((token) => Expo.isExpoPushToken(token))
      .map((token) => ({
        to: token,
        sound: 'default',
        title,
        body,
        data,
      }));

    if (!messages.length) {
      return;
    }

    const chunks = this.expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        await this.expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Push send failed: ${message}`);
      }
    }
  }
}
