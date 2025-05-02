/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { randomInt } from 'crypto';
import * as dayjs from 'dayjs';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'
import { LoginDto } from './dto/login.dto';
import { sendOtpEmail } from '../mail/mailer';
import { VerifyPhoneOtpDto } from './dto/verify-phone.dto';
import { VerifyFaceDto } from './dto/verify-face.dto';


@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService,) {}

  async signup(dto: SignupDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('Email already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        country: dto.country,
      },
    });

    const otpCode = randomInt(100000, 999999).toString();

    await this.prisma.oTP.create({
      data: {
        code: otpCode,
        email: dto.email,
        expiresAt: dayjs().add(10, 'minutes').toDate(),
        user: { connect: { id: user.id } },
      },
    });

    // For now, console log the OTP (later we hook up nodemailer)
    await sendOtpEmail(dto.email, otpCode);
    console.log(`OTP for ${dto.email}: ${otpCode}`);

    return { message: 'User created. OTP sent to email.' };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const otpRecord = await this.prisma.oTP.findFirst({
      where: {
        email: dto.email,
        code: dto.code,
      },
      orderBy: { createdAt: 'desc' },
    });
  
    if (!otpRecord) throw new ForbiddenException('Invalid OTP');
  
    if (otpRecord.expiresAt < new Date()) {
      throw new ForbiddenException('OTP expired');
    }
  
    // Mark user as verified
    await this.prisma.user.update({
      where: { email: dto.email },
      data: { isVerified: true },
    });
  
    // Optionally, delete used OTP
    await this.prisma.oTP.deleteMany({ where: { email: dto.email } });
  
    return { message: 'OTP verified. Email confirmed ✅' };
  }

  async submitPhone(phone: string, userId: string) {
    const code = randomInt(100000, 999999).toString();
  
    await this.prisma.user.update({
      where: { id: userId },
      data: { phone },
    });
  
    await this.prisma.oTP.create({
      data: {
        code,
        phone,
        expiresAt: dayjs().add(10, 'minutes').toDate(),
        user: { connect: { id: userId } },
      },
    });
  
    console.log(`Phone OTP for ${phone}: ${code}`);
    return { message: 'OTP sent to phone 📲' };
  }
  
  async verifyPhoneOtp(dto: VerifyPhoneOtpDto) {
    const otp = await this.prisma.oTP.findFirst({
      where: { phone: dto.phone, code: dto.code },
      orderBy: { createdAt: 'desc' },
    });
  
    if (!otp || otp.expiresAt < new Date()) {
      throw new ForbiddenException('Invalid or expired OTP');
    }
  
    await this.prisma.user.update({
      where: { phone: dto.phone },
      data: { isPhoneVerified: true },
    });
  
    await this.prisma.oTP.deleteMany({ where: { phone: dto.phone } });
  
    return { message: 'Phone verified ✅' };
  }
  

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
  
    if (!user) {
      throw new ForbiddenException('Invalid credentials');
    }
  
    if (!user.isVerified) {
      throw new ForbiddenException('Please verify your email first');
    }
  
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new ForbiddenException('Invalid credentials');
    }
  
    const token = await this.signToken(user.id, user.email);
    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
  
  private async signToken(userId: string, email: string): Promise<string> {
    return this.jwt.signAsync(
      { sub: userId, email },
      { secret: process.env.JWT_SECRET, expiresIn: '7d' },
    );
  }

  async verifyFace(dto: VerifyFaceDto, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
  
    if (!user) throw new BadRequestException('User not found');
  
    const res = await fetch('https://api.mxface.ai/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.MXFACE_API_KEY,
      },
      body: JSON.stringify({
        image: dto.imageBase64,
        subject_id: userId,
      }),
    });
  
    const result = await res.json();
  
    if (!result.success || result.matchScore < 0.85) {
      throw new ForbiddenException('Face verification failed');
    }
  
    await this.prisma.user.update({
      where: { id: userId },
      data: { isFaceVerified: true },
    });
  
    return { message: 'Face verified successfully ✅' };
  }
}  
