// eslint-disable-next-line prettier/prettier
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [PrismaModule, UserModule, JwtModule, PassportModule], // 👈 import it here
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
