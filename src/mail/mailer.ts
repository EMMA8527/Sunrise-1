/* eslint-disable prettier/prettier */
import * as nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: 'mail.privateemail.com',
  port: 587,
  secure: false, //use true for port 465 if needed
  auth: {
    user: process.env.EMAIL_USER, // set this in your .env
    pass: process.env.EMAIL_PASSWORD, // set this in your .env
  },
});

export async function sendOtpEmail(to: string, otp: string) {
  await transporter.sendMail({
    from: `"Sunrise App" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your Sunrise OTP Code',
    html: `
      <div style="font-family: sans-serif; font-size: 16px;">
        <p>Hello 👋,</p>
        <p>Your OTP code is:</p>
        <h2 style="color: #ff6600;">${otp}</h2>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn’t request this, please ignore it.</p>
        <br />
        <p>— Sunrise Team 🌅</p>
      </div>
    `,
  });
}
