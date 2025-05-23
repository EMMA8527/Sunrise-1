/* eslint-disable prettier/prettier */
import { Transform } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { Gender } from '@prisma/client';

export class SetGenderDto {
  @Transform(({ value }) => value?.toUpperCase())
  @IsEnum(Gender, { message: 'Invalid gender. Use MALE, FEMALE, or OTHER.' })
  gender: Gender;
}
