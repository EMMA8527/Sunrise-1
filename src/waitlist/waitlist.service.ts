/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JoinWaitlistDto } from './dto/join-waitlist.dto';

@Injectable()
export class WaitlistService {
  constructor(private prisma: PrismaService) {}

  // Reusable method for joining waitlist
  async addUser(dto: JoinWaitlistDto) {
    const email = dto.email.toLowerCase(); // ensure lowercase

    const existing = await this.prisma.waitlist.findUnique({
      where: { email },
    });

    if (existing) {
      throw new BadRequestException('Email already on waitlist');
    }

    const waitlistEntry = await this.prisma.waitlist.create({
      data: {
        email,
        name: dto.name,
        gender: dto.gender,
        referredBy: dto.referredBy,
        
      },
    });

    return {
      message: 'Successfully joined the waitlist',
      data: waitlistEntry,
    };
  }

  // Admin route to fetch all waitlist entries
  async getAll() {
    return this.prisma.waitlist.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
