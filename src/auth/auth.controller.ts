/* eslint-disable prettier/prettier */ 
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';
import { SubmitPhoneDto } from './dto/submit-phone.dto';
import { VerifyPhoneOtpDto } from './dto/verify-phone.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { VerifyFaceDto } from './dto/verify-face.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// New DTOs for password reset
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyResetOtpDto } from './dto/verify-reset-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('submit-phone')
  @UseGuards(JwtAuthGuard)
  submitPhone(@Body() dto: SubmitPhoneDto, @GetUser('userId') userId: string) {
    return this.authService.submitPhone(dto.phone, userId);
  }

  @Post('verify-phone')
  verifyPhoneOtp(@Body() dto: VerifyPhoneOtpDto) {
    return this.authService.verifyPhoneOtp(dto);
  }

  @Post('verify-face')
  @UseGuards(JwtAuthGuard)
  verifyFace(@Body() dto: VerifyFaceDto, @GetUser('userId') userId: string) {
    return this.authService.verifyFace(dto, userId);
  }

  // 🔐 Forgot Password Flow

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('verify-reset-otp')
  verifyResetOtp(@Body() dto: VerifyResetOtpDto) {
    return this.authService.verifyResetOtp(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
