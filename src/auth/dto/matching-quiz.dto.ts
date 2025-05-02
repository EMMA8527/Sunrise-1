/* eslint-disable prettier/prettier */
// matching-quiz.dto.ts

import { IsObject } from 'class-validator';

export class MatchingQuizDto {
  @IsObject()
  quizAnswers: Record<string, any>;
}
