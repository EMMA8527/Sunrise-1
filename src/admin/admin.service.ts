/* eslint-disable prettier/prettier */
// src/admin/admin.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(page = 1, limit = 10, status?: string, search?: string) {
    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: { password: false },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);
    return {
      data: users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    };
  }

  async getUserStats() {
    const total = await this.prisma.user.count();
    const active = await this.prisma.user.count({ where: { status: 'ACTIVE' } });
    const banned = await this.prisma.user.count({ where: { status: 'BANNED' } });
    const pending = await this.prisma.user.count({ where: { status: 'PENDING' } });

    return { total, active, banned, pending };
  }

  async getUserDetails(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { password: false },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async createUser(dto: CreateAdminUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('User with this email already exists');
    const hashed = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashed,
        status: dto.status,
        isPremium: dto.subscription === 'paid',
        premiumSince: dto.subscription === 'paid' ? new Date() : null,
        premiumExpires: dto.subscription === 'paid' ? new Date() : null,
      },
    });
  }

  async updateUser(id: string, dto: UpdateAdminUserDto) {
    if (dto.password) dto.password = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.update({ where: { id }, data: dto });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUserStatus(id: string, dto: UpdateUserStatusDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { status: dto.status },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
