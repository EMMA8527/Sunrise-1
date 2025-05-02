/* eslint-disable prettier/prettier */
// src/match/match.controller.ts
import {
    Controller,
    Post,
    Body,
    Req,
    UseGuards,
    Get,
  } from '@nestjs/common';
  import { MatchService } from './match.service';
  import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
  
  @Controller('match')
  @UseGuards(JwtAuthGuard)
  export class MatchController {
    constructor(private matchService: MatchService) {}
  
    @Post('action')
    recordMatchAction(
      @Req() req,
      @Body() body: { targetId: string; action: 'LIKE' | 'PASS' },
    ) {
      console.log('req.user:', req.user);
      const userId = req.user.userId;

      return this.matchService.recordAction(userId, body.targetId, body.action);
    }
  
    @Get('matches')
    getMatches(@Req() req) {
      const userId = req.user.id;
      return this.matchService.getMatchedUsers(userId);
    }
  }
  