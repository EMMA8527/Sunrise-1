/* eslint-disable prettier/prettier */
// dto/verify-face.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyFaceDto {
  @IsNotEmpty()
  @IsString()
  imageBase64: string;
}
