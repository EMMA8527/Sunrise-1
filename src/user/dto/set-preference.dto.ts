/* eslint-disable prettier/prettier */
import { IsString } from 'class-validator';

export class SetPreferenceDto {
  @IsString()
  preference: string;
}
