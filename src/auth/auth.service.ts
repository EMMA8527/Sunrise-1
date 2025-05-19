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
import { VerifyResetOtpDto } from './dto/verify-reset-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';


@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService,) {}

  async signup(dto: SignupDto) {
  const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
  if (existingUser) throw new BadRequestException('Email already exists');

  const pending = await this.prisma.pendingSignup.findUnique({ where: { email: dto.email } });
  if (pending) throw new BadRequestException('A signup is already in progress for this email.');

  const hashedPassword = await bcrypt.hash(dto.password, 10);
  const otp = randomInt(1000, 9999).toString(); // 4-digit OTP

  await this.prisma.pendingSignup.create({
    data: {
      email: dto.email,
      hashedPassword,
      country: dto.country,
      otp,
      expiresAt: dayjs().add(10, 'minutes').toDate(),
    },
  });

  await sendOtpEmail(dto.email, otp);
  console.log(`Pending OTP for ${dto.email}: ${otp}`);

  return { message: 'Signup initiated. OTP sent to email.' };
}

  async verifyOtp(dto: VerifyOtpDto) {
  const pending = await this.prisma.pendingSignup.findUnique({
    where: { email: dto.email },
  });

  if (!pending || pending.otp !== dto.code) {
    throw new ForbiddenException('Invalid OTP');
  }

  if (pending.expiresAt < new Date()) {
    throw new ForbiddenException('OTP expired');
  }

  // Create user from pending record
  const user = await this.prisma.user.create({
    data: {
      email: pending.email,
      password: pending.hashedPassword,
      country: pending.country,
      isVerified: true,
    },
  });

  // Remove the pending record
  await this.prisma.pendingSignup.delete({ where: { email: dto.email } });

  return { message: 'Signup completed. Email verified ✅' };
}


   async submitPhone(phone: string, userId: string) {
    // 1) Ensure the phone isn't used by someone else
    const existing = await this.prisma.user.findUnique({ where: { phone } });
    if (existing && existing.id !== userId) {
      throw new BadRequestException('Phone number already in use');
    }

    // 2) Generate OTP
    const code = randomInt(1000, 9999).toString();

    // 3) Update the user's phone
    await this.prisma.user.update({
      where: { id: userId },
      data: { phone },
    });

    // 4) Store OTP
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

  if (!user) throw new ForbiddenException('Invalid credentials');
  if (!user.isVerified) throw new ForbiddenException('Please verify your email first');

  const isMatch = await bcrypt.compare(dto.password, user.password);
  if (!isMatch) throw new ForbiddenException('Invalid credentials');

  const token = await this.signToken(user.id, user.email, user.role); // pass role

  return {
    accessToken: token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role, // send role in response
    },
  };
}

 private async signToken(
  userId: string,
  email: string,
  role: string, // add role here
): Promise<string> {
  return this.jwt.signAsync(
    { sub: userId, email, role },
    { secret: process.env.JWT_SECRET, expiresIn: '7d' },
  );
}


  async verifyFace(dto: VerifyFaceDto, userId: string) {
  const user = await this.prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new BadRequestException('User not found');
console.log('Using MXFace URL:', process.env.MXFACE_URL);
console.log('Using MXFace Key:', process.env.MXFACE_API_KEY?.slice(0,4) + '…');

  // 1) Call MXFace
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

  // 2) Check for non-200
  if (!res.ok) {
    const text = await res.text();
    throw new BadRequestException(
      `Face verification service error (${res.status}): ${text || res.statusText}`,
    );
  }

  // 3) Parse JSON safely
  const text = await res.text();
  let result: any;
  try {
    result = text ? JSON.parse(text) : null;
  } catch {
    throw new BadRequestException('Invalid response from face verification service');
  }

  // 4) Validate the result
  if (!result || !result.success || result.matchScore < 0.85) {
    throw new ForbiddenException('Face verification failed');
  }

  // 5) Mark user as verified
  await this.prisma.user.update({
    where: { id: userId },
    data: { isFaceVerified: true },
  });

  return { message: 'Face verified successfully ✅' };
}
  async forgotPassword(dto: ForgotPasswordDto) {
  const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
  if (!user) throw new BadRequestException('Email not found');

  const otp = randomInt(1000, 9999).toString();
  const expiresAt = dayjs().add(10, 'minutes').toDate();

  await this.prisma.passwordReset.upsert({
    where: { email: dto.email },
    update: { otp, expiresAt },
    create: { email: dto.email, otp, expiresAt },
  });

  await sendOtpEmail(dto.email, otp); // reuse email helper

  console.log(`Reset OTP for ${dto.email}: ${otp}`);
  return { message: 'Reset OTP sent to email 📧' };
}

async verifyResetOtp(dto: VerifyResetOtpDto) {
  const record = await this.prisma.passwordReset.findUnique({
    where: { email: dto.email },
  });

  if (!record || record.otp !== dto.otp || record.expiresAt < new Date()) {
    throw new ForbiddenException('Invalid or expired OTP');
  }

  return { message: 'OTP verified ✅' };
}

async resetPassword(dto: ResetPasswordDto) {
  const record = await this.prisma.passwordReset.findUnique({
    where: { email: dto.email },
  });

  if (!record || record.expiresAt < new Date()) {
    throw new ForbiddenException('Reset session expired');
  }

  const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

  await this.prisma.user.update({
    where: { email: dto.email },
    data: { password: hashedPassword },
  });

  await this.prisma.passwordReset.delete({ where: { email: dto.email } });

  return { message: 'Password reset successful 🔒' };
}

}  
