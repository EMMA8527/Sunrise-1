import { IsString, MinLength } from 'class-validator';

export class SetNameDto {
  @IsString()
  @MinLength(2)
  fullName: string;
}
