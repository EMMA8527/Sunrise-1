import { IsEnum } from 'class-validator';
import { Gender } from '@prisma/client';

export class SetGenderDto {
  @IsEnum(Gender)
  gender: Gender;
}
