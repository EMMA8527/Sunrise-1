/* eslint-disable prettier/prettier */
// src/notification/notification.gateway.ts
import {
    WebSocketGateway,
    WebSocketServer,
  } from '@nestjs/websockets';
  import { Server } from 'socket.io';
  
  @WebSocketGateway({
    cors: {
      origin: '*',
    },
  })
  export class NotificationGateway {
    @WebSocketServer()
    server: Server;
  
    // Notify a user by socket
    sendNotification(userId: string, data: any) {
      this.server.to(userId).emit('notification', data);
    }

    
  }

  