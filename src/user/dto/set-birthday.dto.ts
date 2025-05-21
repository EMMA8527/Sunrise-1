import { IsDateString } from 'class-validator';

export class SetBirthdayDto {
  @IsDateString()
  birthday: string;
}
