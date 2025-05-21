import { IsArray, IsString } from 'class-validator';

export class AddPhotosDto {
  @IsArray()
  @IsString({ each: true })
  photoUrls: string[];
}
