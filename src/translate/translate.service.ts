/* eslint-disable prettier/prettier */
// src/translate/translate.service.ts
import { Injectable } from '@nestjs/common';
import { v2 } from '@google-cloud/translate';
import * as path from 'path';

@Injectable()
export class TranslateService {
  private translate: v2.Translate;

  constructor() {
    this.translate = new v2.Translate({
      keyFilename: path.join(__dirname, '../../service-account-file.json'), // Path to your service account key
    });
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    const [translation] = await this.translate.translate(text, targetLanguage);
    return translation;
  }
}
