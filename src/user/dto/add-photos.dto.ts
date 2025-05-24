/* eslint-disable prettier/prettier */
import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class AddPhotosDto {
  @IsArray()
  @ArrayMinSize(2, { message: 'Please upload at least two photos' })
  @IsString({ each: true })
  photoUrls: string[];
}
