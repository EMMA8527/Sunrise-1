/* eslint-disable prettier/prettier*/
 import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as serviceAccount from '../../google-services.json'; // JSON you download from Firebase console

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private messaging: admin.messaging.Messaging;

  onModuleInit() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });
    }
    this.messaging = admin.messaging();
  }

  async sendPushNotification(
    token: string,
    title: string,
    body: string,
    data?: { [key: string]: string },
  ) {
    const message: admin.messaging.Message = {
      token,
      notification: {
        title,
        body,
      },
      data,
    };

    try {
      const response = await this.messaging.send(message);
      return response;
    } catch (error) {
      console.error('Error sending Firebase push notification:', error);
      throw error;
    }
  }
} 
