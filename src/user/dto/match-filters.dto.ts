/* eslint-disable prettier/prettier */
// src/user/dto/match-filters.dto.ts
import { IsOptional, IsIn, IsNumberString } from 'class-validator';

export class MatchFiltersDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  gender?: string;

  @IsOptional()
  location?: string;

  @IsOptional()
  @IsNumberString()
  minAge?: string;

  @IsOptional()
  @IsNumberString()
  maxAge?: string;

  @IsOptional()
  @IsIn(['recent', 'age-asc', 'age-desc'])
  sortBy?: 'recent' | 'age-asc' | 'age-desc';

  @IsOptional()
  @IsNumberString()
  lat?: string;

  @IsOptional()
  @IsNumberString()
  lng?: string;
}
