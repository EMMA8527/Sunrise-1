/* eslint-disable prettier/prettier */
import { IsOptional, IsString, IsDateString, IsArray } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsDateString()
  birthday?: string;

  @IsOptional()
  @IsArray()
  photos?: string[]; // array of photo URLs

  @IsOptional()
  @IsString()
  gender?: string; // Gender is optional
}
