/* eslint-disable prettier/prettier */

import { Module } from "@nestjs/common";
import { FirebaseAdminService } from "./firebase-admin.service";

@Module({
  providers: [FirebaseAdminService, ],
  exports: [FirebaseAdminService],
})
export class FirebaseModule {} 
