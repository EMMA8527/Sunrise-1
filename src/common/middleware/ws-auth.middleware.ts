/* eslint-disable prettier/prettier */
// src/common/middleware/ws-auth.middleware.ts
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';

@Injectable()
export class WsAuthMiddleware {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  use = async (socket: Socket, next: (err?: any) => void) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) throw new UnauthorizedException('Token missing');

      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      socket.data.userId = decoded.sub; // Store securely
      return next();
    } catch (err) {
      Logger.error('Socket Auth Failed:', err.message);
      return next(new UnauthorizedException('Unauthorized WebSocket'));
    }
  };
}
