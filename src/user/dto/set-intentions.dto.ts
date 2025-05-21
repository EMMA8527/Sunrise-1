import { IsArray, IsString } from 'class-validator';

export class SetIntentionsDto {
  @IsArray()
  @IsString({ each: true })
  intentions: string[];
}
