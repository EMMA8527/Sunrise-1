/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsDateString, IsEnum, IsArray, IsOptional } from 'class-validator';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export class CreateProfileDto {
  @IsNotEmpty()
  fullName: string;

  @IsNotEmpty({ each: true })
  @IsArray()
  intentions: string[]; // e.g., ['Dating', 'Relationship']

  @IsNotEmpty()
  @IsDateString() // expects a valid ISO date string
  birthday: string;

  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  @IsArray()
  photos?: string[]; // Array of S3 URLs
  password: any;
}